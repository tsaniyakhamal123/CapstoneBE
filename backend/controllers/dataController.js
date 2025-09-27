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

module.exports = { postData, getAllData };
