const express = require('express');
const cors = require('cors');

const searchRouter      = require('./routes/search');
const restaurantsRouter = require('./routes/restaurants');
const geocodeRouter     = require('./routes/geocode');
const amenidadesRouter  = require('./routes/amenidades');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/search',      searchRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/geocode',     geocodeRouter);
app.use('/api/amenidades',  amenidadesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
