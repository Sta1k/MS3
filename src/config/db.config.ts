

import * as mongoose from 'mongoose';
import * as log4js from 'log4js';
import * as events from 'events';

const logger: log4js.Logger = log4js.getLogger();

(mongoose as any).Promise = Promise;

mongoose.set('useFindAndModify', false);

export const getMongoConnection = (host: string,
                                   port: number,
                                   user: string,
                                   password: string,
                                   dbAuth: string,
                                   rsName?: string,
                                   emitter?: events.EventEmitter): mongoose.Connection => {

  logger.info(`Start initializing Connections to host: ${host} db: ${dbAuth}`);

  let connectionURL: string = `mongodb://${user}:${password}@${host.split(',').map((replicaElem: string) => {
      return replicaElem + `:${port}`;
    }
  ).join(',')}/${dbAuth}`;

  connectionURL = rsName ? connectionURL + `?replicaSet=${rsName}` : connectionURL;

  const mongoDbConnection: mongoose.Connection = mongoose.createConnection(
    connectionURL,
    {
      useNewUrlParser: true,
      useCreateIndex: true
    }
  );

  mongoDbConnection.on('error', (err: Error) => {
    logger.fatal(`Cant connect to ${host} ${dbAuth} with error ${err.message}`);
    if (emitter) {
      emitter.emit('critical', err);
    }
  });

  mongoDbConnection.on('connecting', (err: Error) => {
    logger.info(`Start connecting to ${dbAuth} on ${host} ...`);
  });

  mongoDbConnection.on('connected', (err: Error) => {
    logger.info(`Connected to ${dbAuth} on ${host}`);
  });

  return mongoDbConnection;
}
