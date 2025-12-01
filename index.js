const express = require('express');
const { connect } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// чтобы Express умел читать JSON из тела запросов
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const client = await connect();
    const result = await client.query('SELECT NOW() AS now');
    const now = result.rows[0].now;

    res.json({
      status: 'ok',
      dbTime: now,
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'error',
      message: 'DB connection failed',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Alch Guild backend listening on port ${PORT}`);
});
