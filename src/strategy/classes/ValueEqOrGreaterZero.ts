import { injectable } from 'inversify';
import * as log4js from 'log4js';
import { RemoteDataModel } from '../../models/remoteData.model';

@injectable()
export class ValueEqualOrGreaterZero implements IStrategy {
  private _logger: log4js.Logger = log4js.getLogger();

  private _remoteDataModel: RemoteDataModel = new RemoteDataModel();

  public constructor() {
  }


  public async transform(el: MessageParsed): Promise<MessageParsed> {
    Number(Date.now()) > Number(new Date(el.remote_time).getTime())
      ? await this._remoteDataModel.addRemoteDataMQTT(el)
      : this._logger.error(`inserting data from future rejected ${JSON.stringify(el)}`);
    return Promise.resolve(el);
  }
}
