import { useState, useCallback, useRef, useEffect } from 'react';
import { largeJsonHandler, type ParseResult, type ParseProgress } from '../utils/largeJsonHandler';
import { getJsonWorker, terminateJsonWorker } from '../utils/jsonWorker';

export interface UseLargeJsonOptions {
  maxFileSize?: number; // in MB
  chunkSize?: number; // in bytes
  enableWorker?: boolean;
}

export interface ProcessingState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  currentOperation: string | null;
  metadata: {
    totalLines: number;
    totalBytes: number;
    chunks: number;
  } | null;
}

export interface UseLargeJsonReturn {
  // State
  jsonData: any;
  previewData: any;
  processingState: ProcessingState;
  
  // Actions
  processFile: (file: File) => Promise<ParseResult>;
  processJsonString: (jsonString: string) => Promise<string>;
  executeOperation: (operation: string, payload: any, options?: any) => Promise<any>;
  cancelProcessing: () => void;
  
  // Utilities
  isLargeFile: boolean;
  estimatedLines: number;
  estimatedSizeMB: number;
}

export function useLargeJson(options: UseLargeJsonOptions = {}): UseLargeJsonReturn {
  const {
    maxFileSize = 50,
    chunkSize = 1024 * 512,
    enableWorker = true
  } = options;

  const [processingState, setProcessingState] = useState<ProcessingState>({
    isLoading: false,
    progress: 0,
    error: null,
    currentOperation: null,
    metadata: null
  });

  const [jsonData, setJsonData] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const workerRef = useRef(enableWorker ? getJsonWorker() : null);

  // Process file with streaming
  const processFile = useCallback(async (file: File): Promise<ParseResult> => {
    const fileSizeMB = file.size / 1024 / 1024;
    const isLarge = fileSizeMB > 5; // 5MB threshold
    setIsLargeFile(isLarge);

    if (fileSizeMB > maxFileSize) {
      throw new Error(`File too large. Max size: ${maxFileSize}MB, got: ${fileSizeMB.toFixed(2)}MB`);
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setProcessingState({
      isLoading: true,
      progress: 0,
      error: null,
      currentOperation: 'Parsing JSON file...',
      metadata: null
    });

    try {
      const result = await largeJsonHandler.parseJsonStream(
        file,
        (progress: ParseProgress) => {
          if (!signal.aborted) {
            setProcessingState(prev => ({
              ...prev,
              progress: progress.progress,
              metadata: {
                totalLines: progress.lines,
                totalBytes: progress.bytes,
                chunks: Math.ceil(progress.bytes / chunkSize)
              }
            }));
          }
        }
      );

      if (signal.aborted) {
        throw new Error('Processing cancelled');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse JSON');
      }

      setJsonData(result.data);
      
      // Create preview (first 1000 lines or sampled)
      const preview = largeJsonHandler.sampleJson(result.data, 1000);
      setPreviewData(preview);

      setProcessingState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        currentOperation: 'Complete',
        metadata: result.metadata || null
      }));

      return result;

    } catch (error) {
      if (error instanceof Error && error.message !== 'Processing cancelled') {
        setProcessingState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
          currentOperation: 'Error'
        }));
      }
      throw error;
    }
  }, [maxFileSize, chunkSize]);

  // Process JSON string
  const processJsonString = useCallback(async (jsonString: string): Promise<string> => {
    const sizeMB = jsonString.length / 1024 / 1024;
    const isLarge = sizeMB > 5;
    setIsLargeFile(isLarge);

    if (sizeMB > maxFileSize) {
      throw new Error(`JSON too large. Max size: ${maxFileSize}MB, got: ${sizeMB.toFixed(2)}MB`);
    }

    setProcessingState({
      isLoading: true,
      progress: 0,
      error: null,
      currentOperation: 'Processing JSON...',
      metadata: null
    });

    try {
      let result: string;
      
      if (enableWorker && workerRef.current && isLarge) {
        // Use worker for large processing
        setProcessingState(prev => ({ ...prev, currentOperation: 'Formatting in worker...' }));
        
        result = await workerRef.current.execute(
          'LARGE_FORMAT',
          jsonString,
          { indent: 2 },
          (progress: number) => {
            setProcessingState(prev => ({
              ...prev,
              progress
            }));
          }
        );
      } else {
        // Process in main thread (for smaller JSON)
        result = await largeJsonHandler.formatLargeJson(jsonString, 2);
      }

      const lines = result.split('\n').length;
      const bytes = new TextEncoder().encode(result).length;

      setJsonData(JSON.parse(result));
      setPreviewData(largeJsonHandler.sampleJson(JSON.parse(result), 1000));

      setProcessingState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        currentOperation: 'Complete',
        metadata: {
          totalLines: lines,
          totalBytes: bytes,
          chunks: 1
        }
      }));

      return result;

    } catch (error) {
      setProcessingState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        currentOperation: 'Error'
      }));
      throw error;
    }
  }, [maxFileSize, enableWorker]);

  // Execute operation via worker
  const executeOperation = useCallback(async (
    operation: string,
    payload: any,
    options: any = {}
  ): Promise<any> => {
    if (!enableWorker || !workerRef.current) {
      throw new Error('Worker not available');
    }

    setProcessingState(prev => ({
      ...prev,
      isLoading: true,
      progress: 0,
      error: null,
      currentOperation: `Running ${operation}...`
    }));

    try {
      const result = await workerRef.current.execute(
        operation,
        payload,
        options,
        (progress: number) => {
          setProcessingState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      setProcessingState(prev => ({
        ...prev,
        isLoading: false,
        progress: 100,
        currentOperation: 'Complete'
      }));

      return result;

    } catch (error) {
      setProcessingState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        currentOperation: 'Error'
      }));
      throw error;
    }
  }, [enableWorker]);

  // Cancel current processing
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setProcessingState(prev => ({
      ...prev,
      isLoading: false,
      currentOperation: 'Cancelled'
    }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (enableWorker) {
        terminateJsonWorker();
      }
    };
  }, [enableWorker]);

  // Calculate estimates
  const estimatedLines = jsonData 
    ? largeJsonHandler.estimateLineCount(JSON.stringify(jsonData))
    : 0;
    
  const estimatedSizeMB = jsonData
    ? largeJsonHandler.getSizeMB(JSON.stringify(jsonData))
    : 0;

  return {
    // State
    jsonData,
    previewData,
    processingState,
    
    // Actions
    processFile,
    processJsonString,
    executeOperation,
    cancelProcessing,
    
    // Utilities
    isLargeFile,
    estimatedLines,
    estimatedSizeMB
  };
}