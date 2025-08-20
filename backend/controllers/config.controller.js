const Config = require('../models/Config');

const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    return res.status(200).json({ config });
  } catch (error) {
    console.error('Get config error:', error);
    return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
};

const updateConfig = async (req, res) => {
  try {
    const { autoCloseEnabled, confidenceThreshold, slaHours } = req.body;

    const update = {};
    if (autoCloseEnabled !== undefined) {
      if (typeof autoCloseEnabled !== 'boolean') {
        return res.status(400).json({ message: 'autoCloseEnabled must be boolean', error: 'INVALID_INPUT' });
      }
      update.autoCloseEnabled = autoCloseEnabled;
    }

    if (confidenceThreshold !== undefined) {
      const n = Number(confidenceThreshold);
      if (Number.isNaN(n) || n < 0 || n > 1) {
        return res.status(400).json({ message: 'confidenceThreshold must be between 0 and 1', error: 'INVALID_INPUT' });
      }
      update.confidenceThreshold = n;
    }

    if (slaHours !== undefined) {
      const n = Number(slaHours);
      if (!Number.isFinite(n) || n <= 0) {
        return res.status(400).json({ message: 'slaHours must be a positive number', error: 'INVALID_INPUT' });
      }
      update.slaHours = n;
    }

    update.updatedAt = new Date();

    const config = await Config.findOneAndUpdate({}, update, { new: true, upsert: true, runValidators: true });
    return res.status(200).json({ message: 'Config updated', config });
  } catch (error) {
    console.error('Update config error:', error);
    return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
};

module.exports = { getConfig, updateConfig };
