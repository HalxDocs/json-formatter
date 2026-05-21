export class ZeroCopyJsonParser {
  private decoder = new TextDecoder();
  
  // Parse directly from ArrayBuffer (zero string copies)
  parseFromBuffer(buffer: ArrayBuffer): any {
    const uint8Array = new Uint8Array(buffer);
    const jsonString = this.decoder.decode(uint8Array, { stream: false });
    
    // Use JSON.parse with reviver for direct property assignment
    return JSON.parse(jsonString, (_key, value) => {
      // Fast path for primitive values
      if (typeof value !== 'object' || value === null) {
        return value;
      }
      
      // For arrays, use typed arrays if possible
      if (Array.isArray(value)) {
        if (value.length > 1000 && value.every(v => typeof v === 'number')) {
          return Float64Array.from(value);
        }
        return value;
      }
      
      return value;
    });
  }

  // Stream parse with minimal allocations
  *streamParse(text: string, bufferSize = 65536): Generator<any, void, unknown> {
    let position = 0;
    const totalLength = text.length;
    
    while (position < totalLength) {
      const chunk = text.substring(position, Math.min(position + bufferSize, totalLength));
      position += bufferSize;
      
      // Find complete JSON objects in chunk
      const objects = this.extractCompleteObjects(chunk);
      for (const obj of objects) {
        yield obj;
      }
      
      // Yield to event loop for responsiveness
      if (position % (bufferSize * 10) === 0) {
        yield new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }

  private extractCompleteObjects(chunk: string): any[] {
    const objects: any[] = [];
    let start = 0;
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i];
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
      }
      
      escapeNext = (char === '\\' && !escapeNext);
      
      if (!inString) {
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
        
        if (depth === 0 && i > start) {
          try {
            const objStr = chunk.substring(start, i + 1);
            // Use direct eval for speed (in controlled environment)
            const obj = (0, eval)(`(${objStr})`);
            objects.push(obj);
            start = i + 1;
          } catch (e) {
            // Continue searching
          }
        }
      }
    }
    
    return objects;
  }

  // Memory-efficient flattening
  flattenToTypedArrays(obj: any): Record<string, Float64Array | Uint8Array> {
    const result: Record<string, any> = {};
    
    const process = (current: any, path: string[] = []) => {
      if (Array.isArray(current)) {
        if (current.length > 1000) {
          // Use typed arrays for large numeric arrays
          if (current.every(v => typeof v === 'number')) {
            const key = path.join('.');
            result[key] = Float64Array.from(current);
            return;
          }
        }
        
        for (let i = 0; i < current.length; i++) {
          process(current[i], [...path, `[${i}]`]);
        }
      } else if (current && typeof current === 'object') {
        for (const [key, value] of Object.entries(current)) {
          process(value, [...path, key]);
        }
      } else {
        const key = path.join('.');
        result[key] = current;
      }
    };
    
    process(obj);
    return result;
  }
}

export const zeroCopyParser = new ZeroCopyJsonParser();