const express = require('express');
const { connect } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post('/init-player', async (req, res) => {
  try {
    const { telegramId, username } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId is required' });
    }

    const client = await connect();

    // 1. Ищем игрока по telegram_id
    let result = await client.query(
      'SELECT * FROM players WHERE telegram_id = $1',
      [telegramId]
    );

    let player;

    // 2. Если нет — создаём
    if (result.rows.length === 0) {
      result = await client.query(
        `INSERT INTO players (telegram_id, username, coins, created_at)
         VALUES ($1, $2, 0, NOW())
         RETURNING *`,
        [telegramId, username || null]
      );
    }

    player = result.rows[0];

    // 3. Загружаем инвентарь игрока
    const invResult = await client.query(
      `SELECT i.id AS item_id,
              i.code,
              i.name,
              i.level,
              i.rarity,
              COALESCE(inv.quantity, 0) AS quantity
       FROM items i
       LEFT JOIN inventories inv
         ON inv.item_id = i.id AND inv.player_id = $1
       ORDER BY i.level, i.id`,
      [player.id]
    );

    const inventory = invResult.rows.map(row => ({
  itemId: row.item_id,
  code: row.code,
  name: row.name,
  level: row.level,
  rarity: row.rarity,
  quantity: row.quantity,
}));

res.json({ player, inventory });
} catch (err) {
  console.error('init-player error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
});



app.listen(PORT, () => {
  console.log(`Alch Guild backend listening on port ${PORT}`);
});
