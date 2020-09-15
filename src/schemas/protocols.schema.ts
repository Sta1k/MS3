import * as mongoose from 'mongoose';

const Schema: typeof mongoose.Schema = mongoose.Schema;
const protocolsSchema: mongoose.Schema = new Schema({
  code: String,
  i18n:
    {
      ua: String,
      ru: String,
      en: String
    },
  report: Array,
  type: Number
}, {collection: 'protocol_codes'});
mongoose.model('Protocol_codes', protocolsSchema);