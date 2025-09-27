const express = require('express');
const router = express.Router();
const { postData, getAllData, getAverageData } = require('../controllers/dataController');

router.post('/', postData);    // ini karena cuma post sm get doang ga kutambah apa2 ya
router.get('/', getAllData);  
router.get('/avg', getAverageData); 

module.exports = router;
