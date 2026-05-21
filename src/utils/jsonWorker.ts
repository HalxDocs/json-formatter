export interface WorkerMessage {
  id: number;
  type: string;
  payload: any;
  options?: any;
}

export interface WorkerResponse {
  id: number;
  result?: any;
  error?: string;
  progress?: number;
}

export class JsonWorker {
  private worker: Worker;
  private callbacks: Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    onProgress?: (progress: number) => void;
  }>;
  private nextId: number;

  constructor() {
    // Create worker with proper TypeScript handling
    this.worker = new Worker(new URL('../workers/json.worker.js', import.meta.url));
    this.callbacks = new Map();
    this.nextId = 0;
    
    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, result, error, progress } = e.data;
      
      if (this.callbacks.has(id)) {
        const callback = this.callbacks.get(id)!;
        
        if (progress !== undefined && callback.onProgress) {
          callback.onProgress(progress);
        } else if (error) {
          callback.reject(new Error(error));
          this.callbacks.delete(id);
        } else {
          callback.resolve(result);
          this.callbacks.delete(id);
        }
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      // Reject all pending callbacks
      this.callbacks.forEach((callback, id) => {
        callback.reject(new Error('Worker terminated with error'));
        this.callbacks.delete(id);
      });
    };
  }

  execute(type: string, payload: any, options: any = {}, onProgress?: (progress: number) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.callbacks.set(id, { resolve, reject, onProgress });
      
      this.worker.postMessage({
        id,
        type,
        payload,
        options
      });
    });
  }

  terminate(): void {
    this.worker.terminate();
    this.callbacks.clear();
  }
}

// Singleton instance with TypeScript type safety
let workerInstance: JsonWorker | null = null;

export function getJsonWorker(): JsonWorker {
  if (!workerInstance) {
    workerInstance = new JsonWorker();
  }
  return workerInstance;
}

export function terminateJsonWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
}