

import * as log4js from 'log4js';
import * as AMQP from 'amqp-ts';
import * as config from 'config';
import * as events from 'events';
// import { Exchange } from "amqp-ts";

const logger: log4js.Logger = log4js.getLogger();

let connectCounter: number = 1;

const msleep: Function = (n: number) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
};

/**
 * Blocking sleep
 * @param {number} n - Sleep time seconds
 */
const sleep: Function = (n: number) => {
  msleep(n * 1000);
};

export function getAMQPConnection(url: string,
                                  port: number,
                                  vhost: string,
                                  login: string,
                                  password: string,
                                  emitter?: events.EventEmitter): AMQP.Connection {
  const amqpConnection: AMQP.Connection = new AMQP.Connection(`amqp://${login}:${password}@${url}:${port}/${vhost}`);

  amqpConnection.on('open_connection', () => {
    logger.info(`Connection to AMQP is open`);
    connectCounter = 1;
  });

  amqpConnection.on('re_established_connection', () => {
    logger.info(`Connection to AMQP is re_established`);
  });

  amqpConnection.on('error_connection', (err: Error) => {
    logger.error(`Got message on AMQP connection ${err.message}`);
    emitter.emit('critical', err);
  });

  amqpConnection.on('trying_connect', () => {
    logger.debug(`Trying to connect to AMQP ${connectCounter} times`);

    if (connectCounter >= config.get('amqp.try_connecting_retry_times')) {
      logger.fatal(`I tried to connect ${connectCounter} times but still can't connect to AMQP.`);
      emitter.emit('critical', new Error('Cant connect to AMQP'));
    }

    sleep(config.get('amqp.sleep_time'));

    connectCounter++;
  });

  return amqpConnection;
}
