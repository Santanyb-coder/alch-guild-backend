require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DATABASE_HOST_IP, // IP из nslookup
  port: 5432,
  user: 'postgres',
  password: 'D5pWLvx@F+LqX6f',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function connect() {
  if (client._connected) return client;

  await client.connect();
  client._connected = true;
  return client;
}

module.exports = { client, connect };
