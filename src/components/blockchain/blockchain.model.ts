const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

// define schema
const BlockchainSchema = new Schema({
  id: { type: String, default: uuidv4, required: true, unique: true },
  name: { type: String, required: true },
  network: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, required: true },
  active: { type: Boolean, required: true },
  growthindex: { type: Boolean, required: true },
  dappgrowth: { type: Boolean, required: true, default: false },
  database: { type: String, default: '', required: false },
}).index({ name: 1, network: 1 }, { unique: true });

const BlockchainModel = mongoose.model('Blockchain', BlockchainSchema, 'blockchain');

export {
    BlockchainModel,
}
