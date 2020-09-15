

import { Container, injectable } from 'inversify';
import { ValueEqualOrGreaterZero } from './classes/ValueEqOrGreaterZero';
import { GrowthEqualOrGreaterZero } from './classes/GrowthEqOrGreaterZero';
import { ProtocolsModel } from '../models/protocols.model';
import { TYPES } from './types';
import * as log4js from 'log4js';


class RemoteDataFormatError extends Error {
}

@injectable()
export class RemoteDataTransformer implements IProvider {

  protected valueEOGZ: ValueEqualOrGreaterZero;
  protected growthEOGZ: GrowthEqualOrGreaterZero;

  private _logger: log4js.Logger = log4js.getLogger();

  public constructor() {
    this.valueEOGZ = new ValueEqualOrGreaterZero();
    this.growthEOGZ = new GrowthEqualOrGreaterZero();
  }

  public async transform(el: MessageParsed): Promise<void> {
    try {
      // TODO: Get codes from cache - Redis
      const protocolCodes: HashMap<number> = await this.getCodes();

      // Transfrom remote_data_timestamp to ISOdate format
      if (el.incoming_time) {
        el.incoming_time = new Date(el.incoming_time);
      } else {
        throw new RemoteDataFormatError(`Remote data does not have a remote_time`);
      }

      await this.checkEl(el, protocolCodes);
    } catch (e) {
      if (e instanceof RemoteDataFormatError) {
        this._logger.error(e.message);
      } else {
        this._logger.debug('Got error on transform');
        throw e;
      }
    }
  }

  private async checkEl(el: MessageParsed, protocolCodes: HashMap<number>): Promise<MessageParsed> {

    // tslint:disable-next-line
    const type: number = protocolCodes[el.code as any];
    switch (type) {
      case 0:
        return await this.growthEOGZ.transform(el);
      case 1:
      default:
        return await this.valueEOGZ.transform(el);
    }
  }

  private async getCodes(): Promise<HashMap<number>> {
    try {
      const protocols: Protocol_code[] = await new ProtocolsModel().getProtocolCodes();
      return protocols.reduce((map: HashMap<number>, obj: Protocol_code) => {
          map[obj.code] = obj.type;
          return map;
        }, {}
      );
    } catch (e) {
      this._logger.error(e.message);
      throw e;
    }
  }
}

export const strategyContainer: Container = new Container();

strategyContainer.bind<RemoteDataTransformer>(TYPES.Provider).to(RemoteDataTransformer);
strategyContainer.bind<IStrategy>(TYPES.Value).to(ValueEqualOrGreaterZero);
strategyContainer.bind<IStrategy>(TYPES.Growth).to(GrowthEqualOrGreaterZero);
