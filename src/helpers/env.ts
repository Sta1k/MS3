
import * as log4js from 'log4js';
import * as process from "process";
import * as events from 'events';


export const emitter: events.EventEmitter = new events.EventEmitter();

/**
 * Shutdown logger without errors
 * @param code
 */
export const loggerShutdown: Function = (code: number) => {
  log4js.shutdown(() => {
    process.exit(code);
  });
};
