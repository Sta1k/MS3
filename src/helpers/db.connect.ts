

import * as mongoose from 'mongoose';
import { getMongoConnection } from '../config/db.config';
import * as config from 'config';
import { emitter } from './env'

export const mongoDb: mongoose.Connection = getMongoConnection(
  config.get('mongo.host'),
  config.get<number>('mongo.port'),
  config.get('mongo.user'),
  config.get('mongo.password'),
  config.get('mongo.db_auth'),
  config.has('mongo.rs') ? config.get('mongo.rs') : null,
  emitter
);
