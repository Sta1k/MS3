

import * as mongoose from 'mongoose';
import { mongoDb } from '../helpers/db.connect';
import * as log4js from 'log4js';

const logger: log4js.Logger = log4js.getLogger();

export class ProtocolsModel {
  public async getProtocolCodes(
    query: { [key: string]: any } = {},
    projection: { [key: string]: any } = {_id: 0, code: 1, type: 1}): Promise<Protocol_code[]> {
    try {
      const protocolsModel: mongoose.Model<mongoose.Document> = mongoDb.model('Protocol_codes');
      // protocolsModel.on('error', err => this._logger.error(err.message));

      return await protocolsModel.find(query, projection).lean() as Protocol_code[];
    } catch (e) {
      logger.error(e.message)
    }
  }
}
