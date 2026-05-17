const express = require('express');
const cors = require('cors');

const searchRouter      = require('./routes/search');
const restaurantsRouter = require('./routes/restaurants');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/search',      searchRouter);
app.use('/api/restaurants', restaurantsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
