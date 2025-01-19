const express = require('express');
const { authenticateRoom } = require('../controllers/authController');
const router = express.Router();

router.post('/login', authenticateRoom);

module.exports = router;
