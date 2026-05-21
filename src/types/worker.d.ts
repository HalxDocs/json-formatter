declare module '*.worker.js' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

declare module '../workers/json.worker.js' {
  class JsonWorker extends Worker {
    constructor();
  }
  export default JsonWorker;
}