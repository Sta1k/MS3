

import * as AMQP from 'amqp-ts';
import { amqpConnection } from '../helpers/amqp.connect';
import * as log4js from 'log4js';
import * as config from 'config';
import { emitter } from "../helpers/env";
import { RemoteDataTransformer, strategyContainer } from "../strategy/checkData.middleware";
import { TYPES } from "../strategy/types";
import * as JSON5 from 'json5';
import { tNumber, tObject, tString, tAny, Validator } from 'runtime-validator';

const logger: log4js.Logger = log4js.getLogger();
const strategy: RemoteDataTransformer = strategyContainer.get<RemoteDataTransformer>(TYPES.Provider);


export const setAmqpService = async () => {
  try {
    // Bind a queue to MS1 exchanger
    const remoteDataAMQPQueue: AMQP.Queue = amqpConnection.declareQueue(config.get('amqp.rd.queue.name'), {prefetch: 1});
    await remoteDataAMQPQueue.bind(amqpConnection.declareExchange(config.get('amqp.rd.exchanger.name'),
      config.get('amqp.rd.exchanger.type'),
      {
        durable: config.get('amqp.rd.exchanger.options.durable')
      }),
      config.has('amqp.rd.queue.pattern') ? config.get('amqp.rd.queue.pattern') : ''
    );

    // Init exchanger for websocket broadcasting
    const wsAMQPExchange: AMQP.Exchange = amqpConnection.declareExchange(config.get('amqp.websocket.exchanger.name'),
      config.get('amqp.websocket.exchanger.type'),
      {
        durable: config.get('amqp.websocket.exchanger.options.durable')
      }
    );

    emitter.on('ws_message', (data: MessageParsed) => {
      wsAMQPExchange.send(new AMQP.Message(data), config.get('amqp.websocket.exchanger.routing_keys.save_data'));
      logger.debug(`Sent "${JSON.stringify(data)}" to WS`);
    });

    emitter.on('notification', (data: AntNotification) => {
      logger.info(`Set amqp notification to exchange ${config.get('amqp.websocket.exchanger')}`);
      wsAMQPExchange.send(new AMQP.Message(data), config.get('amqp.websocket.exchanger.routing_keys.notice'));
      logger.debug(`Sent Notice "${JSON.stringify(data)}" to WS`);
    });

    remoteDataAMQPQueue.activateConsumer(async (message: AMQP.Message) => {
      try {

        logger.debug(`Got message from AMQP with content type is '${message.properties.contentType}'`);

        if (!(message.properties.contentType == "application/json5" || message.properties.contentType == "application/json")) {
          throw Error(`Message has incorrect property content_type '${message.properties.contentType}'. Is not application/json or application/json5`)
        }

        const messageObject: MessageParsed = message.properties.contentType == "application/json" ? message.getContent() : JSON5.parse(message.getContent());

        const generatePostValidator: Validator<ExpectedAMQPMessage> = tObject({
          point_id: tString(),
          hardware_address: tNumber(),
          code: tString(),
          value: tAny(),
          remote_time: tString(),
          incoming_time: tString(),
        });

        // Validate incoming message
        generatePostValidator.asException(messageObject);

        logger.debug('trying to save data to DB', messageObject);

        await strategy.transform(messageObject);
        message.ack();

      } catch (e) {
        if (e instanceof SyntaxError) {
          logger.error(`Got error during parsing data from remote: ${e.stack} for packet from AMQP`);
        } else {
          logger.error(`Got unpredictable error ${e.stack}`);
        }
        message.reject();
      }
    });

  } catch (e) {
    logger.error(`AMQP error message  ${e.stack}`);
  }
};
