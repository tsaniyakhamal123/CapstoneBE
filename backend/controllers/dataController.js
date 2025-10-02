const Data = require('../models/Data');

const postData = async (req, res, next) => {
  try {
    const body = req.body;
    // Fungsi untuk normalisasi data
    const normalizeData = (data) => {
      const { voltage, current, force, power, timestamp } = data;

      if (
        voltage == null ||
        current == null ||
        force == null ||
        power == null
      ) {
        throw new Error('Missing required fields');
      }

      return {
        voltage,
        current,
        force,
        power,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      };
    };

    
    if (Array.isArray(body)) {
      // Multiple data
      const formattedData = body.map((item) => normalizeData(item.data));
      const inserted = await Data.insertMany(formattedData);

      return res.status(201).json({
        message: 'Banyak data masuk, King',
        data: inserted
      });
    } else if (typeof body === 'object' && body.data) {
      // Single data
      const singleData = normalizeData(body.data);
      const inserted = await Data.create(singleData);

      return res.status(201).json({
        message: 'Data dah masuk, King',
        data: inserted
      });
    } else {
      return res.status(400).json({ message: 'Invalid data format' });
    }
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

//dashboard
// 1. Total Energy
const getTotalEnergy = async (req, res, next) => {
  try {
    const data = await Data.find();
    const totalEnergy = data.reduce((sum, d) => sum + d.power * (5/3600), 0); // 5s assumed interval
    res.json({ totalEnergy });
  } catch (error) {
    next(error);
  }
};

// 2. Current Voltage (latest)
const getCurrentVoltage = async (req, res, next) => {
  try {
    const latest = await Data.findOne().sort({ timestamp: -1 });
    if (!latest) return res.status(404).json({ message: "No data found" });

    res.json({
      voltage: latest.voltage,
      current: latest.current,
      timestamp: latest.timestamp
    });
  } catch (error) {
    next(error);
  }
};

// 3. Energy Generation (24 hours)
const getEnergyGeneration24h = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const data = await Data.find({ timestamp: { $gte: since } });

    const grouped = {};
    data.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      grouped[hour] = (grouped[hour] || 0) + d.power * (5/3600);
    });

    res.json(grouped);
  } catch (error) {
    next(error);
  }
};

// 4. Voltage Output (24 hours)
const getVoltageOutput24h = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const data = await Data.find({ timestamp: { $gte: since } });

    const grouped = {};
    data.forEach(d => {
      const hour = new Date(d.timestamp).getHours();
      grouped[hour] = grouped[hour] || [];
      grouped[hour].push(d.voltage);
    });

    const avgVoltage = {};
    for (const hour in grouped) {
      const values = grouped[hour];
      avgVoltage[hour] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    res.json(avgVoltage);
  } catch (error) {
    next(error);
  }
};

// 5. Energy Storage (alias total energy)
const getEnergyStorage = async (req, res, next) => {
  try {
    const data = await Data.find();
    const energy = data.reduce((sum, d) => sum + d.power * (5/3600), 0);
    res.json({ estimatedStorage: energy });
  } catch (error) {
    next(error);
  }
};

// 6. Peak Generation
const getPeakGeneration = async (req, res, next) => {
  try {
    const peak = await Data.findOne().sort({ power: -1 });
    if (!peak) return res.status(404).json({ message: "No data found" });

    res.json({
      peakPower: peak.power,
      timestamp: peak.timestamp
    });
  } catch (error) {
    next(error);
  }
};

// 7. Average Voltage
const getAverageVoltage = async (req, res, next) => {
  try {
    const result = await Data.aggregate([
      { $group: { _id: null, avgVoltage: { $avg: "$voltage" } } }
    ]);

    if (!result.length) return res.status(404).json({ message: "No data to average." });
    res.json({ averageVoltage: result[0].avgVoltage });
  } catch (error) {
    next(error);
  }
};



//yang ini history
// 1. Total Energy (last 7 & 30 days)
// Total energy for TODAY
const getTotalEnergyToday = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const data = await Data.find({ timestamp: { $gte: startOfToday } });
    const totalEnergy = data.reduce((sum, d) => sum + d.power * (5/3600), 0);

    res.json({ totalEnergyToday: totalEnergy });
  } catch (error) {
    next(error);
  }
};

// 🔹 Total energy for LAST 7 DAYS
const getTotalEnergyLast7Days = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const data = await Data.find({ timestamp: { $gte: since } });

    const totalEnergy = data.reduce((sum, d) => sum + d.power * (5/3600), 0);
    res.json({ totalEnergyLast7Days: totalEnergy });
  } catch (error) {
    next(error);
  }
};

// 🔹 Total energy for LAST 30 DAYS
const getTotalEnergyLast30Days = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const data = await Data.find({ timestamp: { $gte: since } });

    const totalEnergy = data.reduce((sum, d) => sum + d.power * (5/3600), 0);
    res.json({ totalEnergyLast30Days: totalEnergy });
  } catch (error) {
    next(error);
  }
};


// 2. Daily Energy (last 7 days) - chart
const getDailyEnergyLast7Days = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const data = await Data.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          totalEnergy: { $sum: { $multiply: ["$power", 5/3600] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// 3. Weekly Energy (last 8 weeks) - chart
const getWeeklyEnergy = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 hari kebelakang
    const data = await Data.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: { $isoWeek: "$timestamp" },
          totalEnergy: { $sum: { $multiply: ["$power", 5/3600] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// 4. Best Performance Day
const getBestPerformanceDay = async (req, res, next) => {
  try {
    const data = await Data.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          totalEnergy: { $sum: { $multiply: ["$power", 5/3600] } }
        }
      },
      { $sort: { totalEnergy: -1 } },
      { $limit: 1 }
    ]);

    res.json(data[0]);
  } catch (error) {
    next(error);
  }
};

// 5. Average Daily Output
const getAverageDailyOutput = async (req, res, next) => {
  try {
    const data = await Data.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          dailyEnergy: { $sum: { $multiply: ["$power", 5/3600] } }
        }
      },
      {
        $group: {
          _id: null,
          avgDailyEnergy: { $avg: "$dailyEnergy" }
        }
      }
    ]);

    res.json({ averageDailyOutput: data[0]?.avgDailyEnergy || 0 });
  } catch (error) {
    next(error);
  }
};

// 6. Recent Activity (last 7 days energy per day)
const getRecentActivity = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const data = await Data.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          totalEnergy: { $sum: { $multiply: ["$power", 5/3600] } }
        }
      },
      { $sort: { "_id": -1 } }
    ]);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

//Data Streaming
// Get latest 1 entry for each field (realtime streaming)
const getRealtimeVoltage = async (req, res, next) => {
  try {
    const data = await Data.findOne().sort({ timestamp: -1 });
    res.json({ voltage: data?.voltage || 0 });
  } catch (error) {
    next(error);
  }
};

const getRealtimeCurrent = async (req, res, next) => {
  try {
    const data = await Data.findOne().sort({ timestamp: -1 });
    res.json({ current: data?.current || 0 });
  } catch (error) {
    next(error);
  }
};

const getRealtimePower = async (req, res, next) => {
  try {
    const data = await Data.findOne().sort({ timestamp: -1 });
    res.json({ power: data?.power || 0 });
  } catch (error) {
    next(error);
  }
};

const getRealtimeTemperature = async (req, res, next) => {
  try {
    const data = await Data.findOne().sort({ timestamp: -1 });
    res.json({ temperature: data?.temperature || 0 });
  } catch (error) {
    next(error);
  }
};

// Voltage Output per 5 seconds (last 10 entries as example)
const getVoltageOutputStream = async (req, res, next) => {
  try {
    const data = await Data.find({})
      .sort({ timestamp: -1 })
      .limit(10); // Last 10 * 5 seconds = last 50s

    res.json(data.map(d => ({
      timestamp: d.timestamp,
      voltage: d.voltage
    })).reverse());
  } catch (error) {
    next(error);
  }
};

// Power Generation per 5 seconds (last 10 entries as example)
const getPowerGenerationStream = async (req, res, next) => {
  try {
    const data = await Data.find({})
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(data.map(d => ({
      timestamp: d.timestamp,
      power: d.power
    })).reverse());
  } catch (error) {
    next(error);
  }
};

// Raw Data Stream (no processing)
const getRawDataStream = async (req, res, next) => {
  try {
    const data = await Data.find({})
      .sort({ timestamp: -1 })
      .limit(20); // 20 data terakhir
    res.json(data.reverse());
  } catch (error) {
    next(error);
  }
};


module.exports = { postData, getAllData, getAverageData, getTotalEnergy, getCurrentVoltage, getEnergyGeneration24h, getVoltageOutput24h, getEnergyStorage, getPeakGeneration, getAverageVoltage, 
  getTotalEnergyToday, getTotalEnergyLast7Days, getTotalEnergyLast30Days, getDailyEnergyLast7Days, getWeeklyEnergy, getBestPerformanceDay, getAverageDailyOutput, getRecentActivity,
  getRealtimeVoltage, getRealtimeCurrent, getRealtimePower, getRealtimeTemperature, getVoltageOutputStream, getPowerGenerationStream, getRawDataStream  
 };
