

import { getAMQPConnection } from '../config/amqp.config';
import * as config from 'config';
import * as AMQP from 'amqp-ts';
import { emitter } from './env'

export const amqpConnection: AMQP.Connection = getAMQPConnection(
  config.get('amqp.url'),
  config.get<number>('amqp.port'),
  config.get('amqp.vhost'),
  config.get('amqp.login'),
  config.get('amqp.password'),
  emitter
);
