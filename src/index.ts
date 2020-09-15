

import 'reflect-metadata';
import './schemas';
import { loggerShutdown, emitter} from './helpers/env';
import { setAmqpService } from './services/amqp.service';
import { logger } from './config/logging.config';

logger.info('Start the actualize data worker');

setAmqpService();

process.on('SIGINT', (signal: string) => {
  logger.info(`Caught interrupt signal ${signal}. Close the app`);
  loggerShutdown(0);
});


emitter.on('critical', (err: Error) => {
  logger.fatal(`Got critical error: ${err.message}`);
  loggerShutdown(1);
});
