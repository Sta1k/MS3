import * as mongoose from 'mongoose';

const Schema: typeof mongoose.Schema = mongoose.Schema;
const balanceSchema: mongoose.Schema = new Schema({
  value: {
    type: Schema.Types.Number,
    required: true,
    default: 0
  },
  updated: {
    type: Schema.Types.Date,
    required: true,
    default: Date.now()
  }
});
const cabinetSchema: mongoose.Schema = new Schema({

  name: {
    type: String,
    required: true,
    minlength: 3
  },
  status: {
    type: String,
    required: true,
    default: 'active'
  },
  address: String,
  phone: String,
  author: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Schema.Types.Date,
    required: true,
    default: Date.now()
  },
  balance: balanceSchema,
  notifications: [{type: Schema.Types.ObjectId, ref: 'Notifications', required: false}],
  owner: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
  points: [{type: Schema.Types.ObjectId, ref: 'Points', required: false}],
  users: [{type: Schema.Types.ObjectId, ref: 'Users', required: false}]
});
mongoose.model('Cabinet', cabinetSchema);