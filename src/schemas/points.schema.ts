import * as mongoose from 'mongoose';
import { createSchema, Type } from 'ts-mongoose';
import 'ts-mongoose/plugin';

const measureValuesSchema: mongoose.Schema = createSchema({
  startValue: Type.number({default: 0}),
  endValue: Type.number({default: 0}),
  type: Type.string(),
  color: Type.optionalString()

});

const financeSchema: mongoose.Schema = createSchema({
  total: Type.number(),
  spent: Type.number(),
  current_day: Type.number(),
  bonuses: Type.number(),
  encashment: Type.number(),
});

const groupSchema: mongoose.Schema = createSchema({
  name: Type.string(),
  description: Type.string(),
  ids: Type.array().of(Type.string({unique: true}))
});
const paramSchema: mongoose.Schema = createSchema({
  name: Type.string(),
  src: Type.string(),
  code: Type.string(),
  isMonitored: Type.boolean(),
  measure: Type.optionalString(),
  state: Type.object().of({
    lastActivity: Type.date({default: new Date(0)}),
    value: Type.number({default: 0}),
    measureValues: Type.object().of(measureValuesSchema),
    alertValues: Type.optionalArray().of({})
  }),
  hardware_address: Type.number()
});
const pointSchema: mongoose.Schema = createSchema({
  name: Type.string({minlength: 2, maxlength: 64}),
  geolocation: Type.optionalObject().of({
    lat: Type.number({default: 0}),
    lng: Type.number({default: 0})
  }),
  groups: Type.optionalArray().of(groupSchema),
  bookmarked: Type.optionalArray().of(paramSchema),
  address: Type.string({
    minlength: 2,
    maxlength: 250
  }),
  finance: financeSchema,
  remote_key: Type.objectId({
    auto: true,
    unique: true
  }),
  users: Type.optionalArray().of(Type.string()),
  currency: Type.string(),
  parameters: Type.optionalArray().of(paramSchema)
});
mongoose.model('Points', pointSchema);
