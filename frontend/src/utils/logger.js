// Create a browser-friendly logger
const createBrowserLogger = () => {
  const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  const logger = {
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
    info: (...args) => console.info(...args),
    debug: (...args) => console.debug(...args),
    log: (...args) => console.log(...args),
  };

  // Add timestamp and formatting
  Object.keys(logger).forEach(level => {
    const originalMethod = logger[level];
    logger[level] = (...args) => {
      const timestamp = new Date().toISOString();
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return arg;
      });
      originalMethod(`[${timestamp}] [${level.toUpperCase()}]:`, ...formattedArgs);
    };
  });

  return logger;
};

const logger = createBrowserLogger();

export default logger; 