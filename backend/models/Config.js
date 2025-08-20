const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    autoCloseEnabled: { type: Boolean, default: false },
    confidenceThreshold: { type: Number, min: 0, max: 1, default: 0.7 },
    slaHours: { type: Number, min: 1, default: 72 },
  },
  { timestamps: true }
);

const Config = mongoose.model('Config', configSchema);
module.exports = Config;
