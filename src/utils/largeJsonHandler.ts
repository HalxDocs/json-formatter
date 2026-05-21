export interface ParseProgress {
  progress: number;
  lines: number;
  bytes: number;
  status: 'processing' | 'complete' | 'error';
}

export interface ParseResult {
  success: boolean;
  data: any;
  error?: string;
  metadata?: {
    totalLines: number;
    totalBytes: number;
    chunks: number;
  };
}

export interface StreamOptions {
  maxLines?: number;
  onProgress?: (progress: ParseProgress) => void;
}


export class LargeJsonHandler {
  private maxLines: number;
  private progressCallback: ((progress: ParseProgress) => void) | null;

  constructor(options?: StreamOptions) {
    this.maxLines = options?.maxLines || 500000;
    this.progressCallback = options?.onProgress || null;
  }
  // Parse large JSON file in chunks
  async parseJsonStream(file: File, onProgress?: (progress: ParseProgress) => void): Promise<ParseResult> {
    this.progressCallback = onProgress || this.progressCallback;
    const fileSize = file.size;
    const reader = file.stream().getReader();
    let buffer = '';
    let lineCount = 0;
    let processedBytes = 0;
    const chunks: any[] = [];
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        processedBytes += value.length;
        buffer += decoder.decode(value, { stream: true });

        // Process complete JSON objects from buffer
        const { processed, remaining, lines } = this.extractCompleteJson(buffer);
        
        if (processed.length > 0) {
          chunks.push(...processed);
          lineCount += lines;
          
          // Emit progress
          if (this.progressCallback) {
            const progress = Math.min(100, Math.round((processedBytes / fileSize) * 100));
            this.progressCallback({
              progress,
              lines: lineCount,
              bytes: processedBytes,
              status: 'processing'
            });
          }

          // Check limits
          if (lineCount > this.maxLines) {
            console.warn(`Exceeded max lines (${this.maxLines}), truncating...`);
            break;
          }
        }
        
        buffer = remaining;
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const lastChunk = JSON.parse(buffer);
          chunks.push(lastChunk);
        } catch (e) {
          console.warn('Could not parse final buffer:', e);
        }
      }

      return {
        success: true,
        data: this.mergeChunks(chunks),
        metadata: {
          totalLines: lineCount,
          totalBytes: processedBytes,
          chunks: chunks.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null,
        metadata: { totalLines: lineCount, totalBytes: processedBytes, chunks: chunks.length }
      };
    }
  }

  // Extract complete JSON objects from buffer
  private extractCompleteJson(buffer: string): { processed: any[], remaining: string, lines: number } {
    const processed: any[] = [];
    let remaining = buffer;
    let lineCount = 0;
    let start = 0;
    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i];
      
      // Handle string literals
      if (char === '"' && !escapeNext) {
        inString = !inString;
      }
      
      // Handle escape sequences
      escapeNext = (char === '\\' && !escapeNext);
      
      // Count braces/brackets only when not in string
      if (!inString) {
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
        
        // Found complete JSON object
        if (depth === 0 && i > start) {
          try {
            const chunk = buffer.slice(start, i + 1);
            const parsed = JSON.parse(chunk);
            processed.push(parsed);
            
            // Count lines in this chunk (approximate)
            lineCount += (chunk.match(/\n/g) || []).length;
            
            start = i + 1;
            remaining = buffer.slice(start);
          } catch (e) {
            // Not a complete JSON object, continue
            continue;
          }
        }
      }
    }

    return { processed, remaining, lines: lineCount };
  }

  // Merge chunks intelligently
  private mergeChunks(chunks: any[]): any {
    if (chunks.length === 0) return null;
    if (chunks.length === 1) return chunks[0];
    
    // If all chunks are arrays, concatenate them
    if (chunks.every(chunk => Array.isArray(chunk))) {
      return chunks.flat();
    }
    
    // If all chunks are objects, merge them
    if (chunks.every(chunk => typeof chunk === 'object' && !Array.isArray(chunk))) {
      return Object.assign({}, ...chunks);
    }
    
    // Default: return as array of chunks
    return chunks;
  }

  // Format large JSON — always parse the whole string as one unit
  async formatLargeJson(jsonString: string, indent: number = 2): Promise<string> {
    try {
      // Yield to allow the UI to update before the blocking parse
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      return JSON.stringify(JSON.parse(jsonString), null, indent);
    } catch (e) {
      throw new Error(`Parse error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  // Sample large JSON for preview
  sampleJson(jsonData: any, sampleSize: number = 1000): any {
    if (Array.isArray(jsonData)) {
      return jsonData.slice(0, sampleSize);
    }
    
    if (typeof jsonData === 'object' && jsonData !== null) {
      const keys = Object.keys(jsonData);
      const sampled: Record<string, any> = {};
      for (let i = 0; i < Math.min(sampleSize, keys.length); i++) {
        const key = keys[i];
        sampled[key] = jsonData[key];
      }
      return sampled;
    }
    
    return jsonData;
  }

  // Check if JSON is large
  isLargeJson(jsonString: string, thresholdMB: number = 5): boolean {
    return jsonString.length > thresholdMB * 1024 * 1024;
  }

  // Get estimated line count
  estimateLineCount(jsonString: string): number {
    return jsonString.split('\n').length;
  }

  // Get size in MB
  getSizeMB(jsonString: string): number {
    return jsonString.length / 1024 / 1024;
  }
}

// Singleton instance
export const largeJsonHandler = new LargeJsonHandler();
export default largeJsonHandler;