import { injectable } from 'inversify';
import { RemoteDataModel } from '../../models/remoteData.model';
import * as log4js from 'log4js';

@injectable()
export class GrowthEqualOrGreaterZero implements IStrategy {
  private _logger: log4js.Logger = log4js.getLogger();
  private _remoteDataModel: RemoteDataModel = new RemoteDataModel();

  public constructor() {
  }

  public async transform(el: MessageParsed): Promise<MessageParsed> {
    Number(Date.now()) > Number(new Date(el.remote_time).getTime())
      ? await this.findGrowth(el).then((elt: MessageParsed) => Promise.resolve(elt))
      : this._logger.error(`inserting data from future rejected ${JSON.stringify(el)} time ${Date.now()}`);
    return Promise.resolve(el);
  }

  private async findGrowth(el: MessageParsed): Promise<MessageParsed> {
    await this._remoteDataModel.checkDouble(el)
      .then(async (result: number) => {
        result > 0
          ? this._logger.error(`duplicate element: ${JSON.stringify(el)}`)
          : await this.futureAndPrevious(el);
      });
    return Promise.resolve(el);
  }

  private async futureAndPrevious(el: MessageParsed): Promise<MessageParsed> {
    const future: MessageParsed[] = await this._remoteDataModel.checkFuture(el);
    if (future.length) {
      let grow: number = Number(future[0].value) - Number(el.value);
      if (grow < 0 || isNaN(grow)) {
        grow = 0;
      }
      try {
        await this._remoteDataModel.updateObject(future[0], { growth: grow });
      } catch (e) {
        this._logger.error(e);
      }

    }
    const prevValue: MessageParsed[] = await this._remoteDataModel.getPrevValue(el);
    let growth: number;
    prevValue.length
      ? growth = Number(el.value) - Number(prevValue[0].value)
      : growth = 0;
    if (growth < 0 || isNaN(growth)) {
      growth = 0;
    }
    el['growth'] = growth;
    await this._remoteDataModel.addRemoteDataMQTT(el);
    return Promise.resolve(el);
  }
}
