enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

const currentLevel = process.env.LOG_LEVEL 
  ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] 
  : LogLevel.INFO;

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: Record<string, any>;
}

function formatLog(level: string, message: string, data?: Record<string, any>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data })
  };
}

export const logger = {
  debug: (message: string, data?: Record<string, any>) => {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(JSON.stringify(formatLog('DEBUG', message, data)));
    }
  },
  
  info: (message: string, data?: Record<string, any>) => {
    if (currentLevel <= LogLevel.INFO) {
      console.info(JSON.stringify(formatLog('INFO', message, data)));
    }
  },
  
  warn: (message: string, data?: Record<string, any>) => {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(JSON.stringify(formatLog('WARN', message, data)));
    }
  },
  
  error: (message: string, error?: unknown) => {
    if (currentLevel <= LogLevel.ERROR) {
      const errorData = error instanceof Error 
        ? { error: error.message, stack: error.stack }
        : { error };
      
      console.error(JSON.stringify(formatLog('ERROR', message, errorData)));
    }
  }
};