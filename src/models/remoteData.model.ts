

import * as log4js from 'log4js';
import * as mongoose from 'mongoose';
import { injectable } from 'inversify';
import { ParametersModel } from './parameters.model';
import { mongoDb } from '../helpers/db.connect';
import { emitter } from '../helpers/env';

@injectable()
export class RemoteDataModel {

    private _logger: log4js.Logger = log4js.getLogger();
    private remoteDataModel: mongoose.Model<mongoose.Document> = mongoDb.model('Remote_data');
    private parameterModel: ParametersModel = new ParametersModel();

    public async addRemoteDataMQTT(remoteData: MessageParsed): Promise<void> {
        try {

            await this.insertRD(remoteData);

            const point: Point = await this.parameterModel.updateParam(remoteData);
            await this.parameterModel.checkAlerts(point, remoteData)
            this._logger.debug('Send to WS: ', remoteData);
            emitter.emit('ws_message', remoteData);

        } catch (err) {
            this._logger.error('Update to POINTS collection failed', err);
            throw err;
        }
    }


    /**
     * Return count of doubled elements
     * @param el
     */
    public async checkDouble(
        // tslint:disable-next-line
        el: { [key: string]: any }
    ): Promise<number> {

        return await this.remoteDataModel.find(el).count() as number;
    }

    /**
     * Check is future element exist and return it
     * @param el
     */
    public async checkFuture(
        /* tslint:disable */
        el: { [key: string]: any }
        /* tslint:enable */
    ): Promise<MessageParsed[]> | null {
        const queryForFuture: {} = {
            code: el.code,
            point_id: el.point_id,
            hardware_address: el.hardware_address,
            remote_time: { $gt: el.remote_time }
        };
        return await this.remoteDataModel.find(queryForFuture)
            .sort({ remote_time: 1 })
            .limit(1).lean() as MessageParsed[];
    }

    /**
     * Get the previous element and return it
     * @param el
     */
    public async getPrevValue(
        // tslint:disable-next-line
        el: { [key: string]: any }
    ): Promise<MessageParsed[]> {
        const queryForPrevValue: {} = {
            code: el.code,
            point_id: el.point_id,
            hardware_address: el.hardware_address,
            remote_time: { $lt: el.remote_time }
        };

        return await this.remoteDataModel.find(queryForPrevValue)
            .sort({ remote_time: -1 })
            .limit(1).lean() as MessageParsed[];
    }

    /**
     * Update the existed element and return it
     * @param query
     * @param updateDoc
     */
    public async updateObject(
        query: { [key: string]: any },
        updateDoc: { [key: string]: any }): Promise<mongoose.Document> {
        return this.remoteDataModel.findOneAndUpdate(
            query,
            { $set: updateDoc },
            { new: true },
            (err: mongoose.Error, doc: mongoose.Document) => {
                if (err) {
                    this._logger.error(err);
                }
            });
    }

    public async insertRD(remoteData: MessageParsed): Promise<mongoose.Document> {
        return this.remoteDataModel.insertMany(
            remoteData,
            (err: mongoose.Error, doc: mongoose.Document) => {
                if (err) {
                    this._logger.error(err);
                }
            });
    }
}
