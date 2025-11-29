const { connect } = require('./db');

async function main() {
  console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
  const client = await connect();
  const res = await client.query('SELECT NOW()');
  console.log('DB time:', res.rows[0]);
}

main().catch(console.error);
