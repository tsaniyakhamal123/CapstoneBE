const express = require('express');
const router = express.Router();
const { postData, getAllData } = require('../controllers/dataController');

router.post('/', postData);    // ini karena cuma post sm get doang ga kutambah apa2 ya
router.get('/', getAllData);   

module.exports = router;
