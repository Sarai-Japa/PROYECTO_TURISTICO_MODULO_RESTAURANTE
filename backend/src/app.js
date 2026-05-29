const express = require('express');
const cors = require('cors');

const searchRouter      = require('./routes/search');
const restaurantsRouter = require('./routes/restaurants');
const geocodeRouter     = require('./routes/geocode');
const amenidadesRouter  = require('./routes/amenidades');
const authRouter        = require('./routes/auth');
const favoritesRouter   = require('./routes/favorites');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',        authRouter);
app.use('/api/search',      searchRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/geocode',     geocodeRouter);
app.use('/api/amenidades',  amenidadesRouter);
app.use('/api/favorites',   favoritesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
