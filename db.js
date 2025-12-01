require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function connect() {
  if (client._connected) return client;
  await client.connect();
  client._connected = true;
  return client;
}

module.exports = { client, connect };
