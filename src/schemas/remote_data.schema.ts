import * as mongoose from 'mongoose';

const Schema: typeof mongoose.Schema = mongoose.Schema;
const remoteDataSchema: mongoose.Schema = new Schema({
  point_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  incoming_time: {
    type: Date,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  hardware_address: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => Number.isInteger(value),
      message: '{VALUE} is not an integer!'
    }
  },
  growth: {
    type: Number,
    required: false
  },
  remote_time: {
    type: Date,
    required: true
  }
}, { collection: 'remote_data' });

mongoose.model('Remote_data', remoteDataSchema);
