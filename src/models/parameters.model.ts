

import * as mongoose from 'mongoose';
import * as log4js from 'log4js';
import { mongoDb } from '../helpers/db.connect';
import { emitter } from '../helpers/env';
import { Cabinet } from 'cabinet'

const logger: log4js.Logger = log4js.getLogger();

export class ParametersModel {
  private _cab: mongoose.Model<mongoose.Document> = mongoDb.model('Cabinet');
  private _point: mongoose.Model<mongoose.Document> = mongoDb.model('Points');
  private _notification: mongoose.Model<mongoose.Document> = mongoDb.model('Notifications')

  /**
   * Update Points collection
   * @param param
   */
  public async updateParam(param: MessageParsed): Promise<Point> {
    return this._point.findOneAndUpdate(
      {
        '_id': param.point_id,
        'parameters': {
          $elemMatch: {
            code: { $eq: param.code },
            hardware_address: { $eq: param.hardware_address }
          }
        },
      },
      {
        $set: {
          'parameters.$.state.value': param.value,
          'parameters.$.state.lastActivity': param.remote_time
        }
      },
      { new: true },
      async (err: mongoose.Error, doc: mongoose.Document) => {
        if (err) {
          logger.debug('updateParam error', err);
        }
      }).lean();
  }

  public async checkAlerts(point: Point, param: MessageParsed): Promise<void> {

    if (!point || !point.parameters) {
      return
    }

    const updatedParam: Param = point.parameters.find(
      (el: Param) => el.code === param.code && el.hardware_address === param.hardware_address);
    if (updatedParam.state.alertValues.length) {

      if (updatedParam.state.alertValues && updatedParam.state.alertValues.length) {
        updatedParam.state.alertValues.forEach((el: AlertCondition) => {
          if (el.cond === 'gt') {
            updatedParam.state.value > Number(el.value)
              ? this.sendNotice(point._id, updatedParam, el) : ''
          } else if (el.cond === 'lt') {
            updatedParam.state.value < Number(el.value)
              ? this.sendNotice(point._id, updatedParam, el) : ''
          } else {
            updatedParam.state.value === Number(el.value)
              ? this.sendNotice(point._id, updatedParam, el) : ''
          }
        })
      }
    }
  }

  private async sendNotice(pointId: string, param: Param, condition: AlertCondition): Promise<Cabinet> {
    const notice: mongoose.Document = new this._notification({
      pointId,//5e04d7e10f8a7d1650cecae9
      param,
      condition
    });
    const no: AntNotification = await notice.save()
      .then((doc: mongoose.Document) => doc.toObject());
    const cab: Cabinet = await this._cab
      .findOneAndUpdate(
        { points: { $elemMatch: { $in: [new mongoose.Types.ObjectId(pointId)], $exists: true } } },
        { $push: { notifications: no._id } },
        { new: true, upsert: true })
      .lean();
    emitter.emit('notification', notice);

    return cab;
  }
}
