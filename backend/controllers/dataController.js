const Data = require('../models/Data');

const postData = async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const { voltage, current, force, power } = data;

    const newData = await Data.create({ voltage, current, force, power });

    res.status(201).json({
      message: 'Data dah masuk, King',
      data: newData
    });
  } catch (error) {
    next(error);
  }
};


const getAllData = async (req, res, next) => {
  try {
    const data = await Data.find().sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getAverageData = async (req, res, next) => {
  try {
    const result = await Data.aggregate([
      {
        $group: {
          _id: null,
          avgVoltage: { $avg: "$voltage" },
          avgCurrent: { $avg: "$current" },
          avgForce: { $avg: "$force" },
          avgPower: { $avg: "$power" }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No data available to average." });
    }

    res.json({
      average: {
        voltage: result[0].avgVoltage,
        current: result[0].avgCurrent,
        force: result[0].avgForce,
        power: result[0].avgPower
      }
    });
  } catch (error) {
    next(error);
  }
};


module.exports = { postData, getAllData, getAverageData };
