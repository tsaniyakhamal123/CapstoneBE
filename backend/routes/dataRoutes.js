const express = require('express');
const router = express.Router();
const { postData, getAllData, getAverageData, getTotalEnergy, getCurrentVoltage, getEnergyGeneration24h, getVoltageOutput24h, getEnergyStorage, getPeakGeneration, getAverageVoltage, 
    getTotalEnergyToday, getTotalEnergyLast7Days, getTotalEnergyLast30Days, getDailyEnergyLast7Days, getWeeklyEnergy, getBestPerformanceDay, getAverageDailyOutput, getRecentActivity,
    getRealtimeVoltage, getRealtimeCurrent, getRealtimePower, getRealtimeTemperature, getVoltageOutputStream, getPowerGenerationStream, getRawDataStream
} = require('../controllers/dataController');

router.post('/', postData);    // ini karena cuma post sm get doang ga kutambah apa2 ya
router.get('/', getAllData);  
router.get('/avg', getAverageData); 

//api dashboard
router.get('/total-energy', getTotalEnergy);
router.get('/current-voltage', getCurrentVoltage);
router.get('/energy-generation-24h', getEnergyGeneration24h);
router.get('/voltage-output-24h', getVoltageOutput24h);
router.get('/energy-storage', getEnergyStorage);
router.get('/peak-generation', getPeakGeneration);
router.get('/average-voltage', getAverageVoltage);


//api history
router.get('/totalenergytoday', getTotalEnergyToday);
router.get('/totalenergy-7days', getTotalEnergyLast7Days);
router.get('/totalenergy-30days', getTotalEnergyLast30Days);
router.get('/daily-energy-7days', getDailyEnergyLast7Days);
router.get('/weekly-energy', getWeeklyEnergy);
router.get('/best-performance', getBestPerformanceDay);
router.get('/average-daily-output', getAverageDailyOutput);
router.get('/recent-activity', getRecentActivity);


//api streaming data
router.get('/stream/voltage', getRealtimeVoltage);
router.get('/stream/current', getRealtimeCurrent);
router.get('/stream/power', getRealtimePower);
router.get('/stream/temperature', getRealtimeTemperature);
router.get('/stream/voltage-output', getVoltageOutputStream);
router.get('/stream/power-generation', getPowerGenerationStream);
router.get('/stream/raw', getRawDataStream);

module.exports = router;
