import * as mongoose from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import 'ts-mongoose/plugin';

const measureValuesSchema: mongoose.Schema = createSchema({
    startValue: Type.number({ default: 0 }),
    endValue: Type.number({ default: 0 }),
    type: Type.string(),
    color: Type.optionalString()
});
const paramSchema: mongoose.Schema = createSchema({
    name: Type.string(),
    src: Type.string(),
    code: Type.string(),
    url: Type.optionalString(),
    multiplier: Type.optionalNumber(),
    measure: Type.optionalString(),
    state: Type.object().of({
        lastActivity: Type.date({ default: new Date(0) }),
        value: Type.number({ default: 0 }),
        measureValues: Type.object().of(measureValuesSchema),
        alertValues: Type.optionalArray().of({})
    }),
    hardware_address: Type.number()
});
const notifSchema: mongoose.Schema = createSchema({
    pointId: Type.string(),
    param: Type.object().of(paramSchema),
    condition: Type.object().of({
        cond: Type.string(),
        value: Type.number()
    })

}, { collection: 'notifications' });

mongoose.model('Notifications', notifSchema);