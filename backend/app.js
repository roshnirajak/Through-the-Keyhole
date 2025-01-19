const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();

app.use(cors({
    origin: '*',
}));
app.use(bodyParser.json());

// Routes
app.get('/', (req, res)=>{
    res.status(200).json({ success: true})
});
app.use('/auth', require('./routes/authRoutes'));
app.use('/video', require('./routes/videoRoutes'));

module.exports = app;