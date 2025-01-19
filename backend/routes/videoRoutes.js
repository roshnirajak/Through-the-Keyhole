const express = require('express');
const { streamVideo } = require('../controllers/videoController');
const router = express.Router();

router.get('/stream', streamVideo);

module.exports = router;