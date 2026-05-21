export class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measures = new Map<string, number[]>();
  
  start(markName: string) {
    this.marks.set(markName, performance.now());
  }
  
  end(markName: string) {
    const start = this.marks.get(markName);
    if (!start) return null;
    
    const duration = performance.now() - start;
    
    if (!this.measures.has(markName)) {
      this.measures.set(markName, []);
    }
    this.measures.get(markName)!.push(duration);
    
    // Keep only last 100 measurements
    if (this.measures.get(markName)!.length > 100) {
      this.measures.get(markName)!.shift();
    }
    
    return { duration, start, end: performance.now() };
  }
  
  getStats(markName: string) {
    const measures = this.measures.get(markName) || [];
    if (measures.length === 0) return null;
    
    const avg = measures.reduce((a, b) => a + b, 0) / measures.length;
    const min = Math.min(...measures);
    const max = Math.max(...measures);
    
    return { avg, min, max, count: measures.length };
  }
  
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

export default PerformanceMonitor;