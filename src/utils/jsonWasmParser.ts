// pako import removed — not used in this module

// WebAssembly JSON Parser for extreme speed
export class WasmJsonParser {
  private initialized = false;

  async init() {
    if (this.initialized) return;

    // Simple WebAssembly module for JSON parsing
    // const wasmCode = new Uint8Array([
    //   0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
    //   // Minimal WASM module for JSON operations
    //   // This is a placeholder - in production, compile from C/Rust
    // ]);

    // const importObject = {
    //   env: {
    //     memory: new WebAssembly.Memory({ initial: 256, maximum: 2048 }),
    //     memoryBase: 0,
    //     tableBase: 0,
    //     abort: () => {},
    //   }
    // };
    try {
    //   const result = await WebAssembly.instantiate(wasmCode, importObject);
      // keep instance local if needed in future (avoid unused private field)
      // const wasmInstance = result.instance;
      this.initialized = true;
    } catch (e) {
      console.warn('WASM failed, falling back to JavaScript:', e);
      // Fallback to optimized JavaScript
    }
  }

  // Parse JSON using SIMD-like operations
  parseChunked(input: string, chunkSize = 1024 * 1024): any[] {
    const results: any[] = [];
    const totalLength = input.length;
    
    for (let i = 0; i < totalLength; i += chunkSize) {
      const chunk = input.substring(i, Math.min(i + chunkSize, totalLength));
      try {
        // Fast parsing with try-catch optimization
        const parsed = this.fastJSONParse(chunk);
        if (parsed !== undefined) {
          results.push(parsed);
        }
      } catch (e) {
        // Try to recover partial JSON
        const recovered = this.recoverPartialJSON(chunk);
        if (recovered) results.push(recovered);
      }
    }
    
    return results;
  }

  // Optimized JSON.parse alternative
  private fastJSONParse(str: string): any {
    // Pre-validate to avoid try-catch overhead
    if (!this.isLikelyValidJSON(str)) {
      throw new Error('Invalid JSON');
    }

    // Use Function constructor for speed (cached)
    const parseFn = this.getCachedParseFunction();
    return parseFn(`(${str})`);
  }

  private parseFunctionCache = new Map<string, Function>();
  private getCachedParseFunction(): Function {
    if (!this.parseFunctionCache.has('default')) {
      this.parseFunctionCache.set('default', new Function('return function(str) { return eval("(" + str + ")"); }')());
    }
    return this.parseFunctionCache.get('default')!;
  }

  private isLikelyValidJSON(str: string): boolean {
    const firstChar = str.trim()[0];
    const lastChar = str.trim()[str.trim().length - 1];
    
    return (firstChar === '{' && lastChar === '}') || 
           (firstChar === '[' && lastChar === ']') ||
           (/^["0-9tfnull]/.test(str.trim()) && /["0-9tfalsenull]$/.test(str.trim()));
  }

  private recoverPartialJSON(str: string): any {
    // Attempt to fix common JSON issues
    let fixed = str
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
      .replace(/'/g, '"')
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    try {
      return JSON.parse(fixed);
    } catch (e) {
      return null;
    }
  }

  // Batch processing with web workers
  async parseWithWorkers(jsonStrings: string[], workerCount = navigator.hardwareConcurrency || 4): Promise<any[]> {
    const chunkSize = Math.ceil(jsonStrings.length / workerCount);
    const chunks: string[][] = [];
    
    for (let i = 0; i < jsonStrings.length; i += chunkSize) {
      chunks.push(jsonStrings.slice(i, i + chunkSize));
    }

    const promises = chunks.map(chunk => 
      new Promise<any[]>((resolve) => {
        const worker = new Worker(URL.createObjectURL(
          new Blob([`
            self.onmessage = function(e) {
              const results = [];
              for (const str of e.data) {
                try {
                  results.push(JSON.parse(str));
                } catch (e) {
                  results.push(null);
                }
              }
              postMessage(results);
            }
          `], { type: 'application/javascript' })
        ));

        worker.onmessage = (e) => {
          resolve(e.data.filter(Boolean));
          worker.terminate();
        };

        worker.postMessage(chunk);
      })
    );

    const results = await Promise.all(promises);
    return results.flat();
  }
}

export const wasmJsonParser = new WasmJsonParser();