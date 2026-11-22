import 'dotenv/config';
import { Client } from 'pg';

const source = process.env.DIRECT_URL;
if (!source) {
  console.log('DIRECT_URL не найден в .env');
  process.exit(1);
}

const u = new URL(source);
const projectRef = decodeURIComponent(u.username).split('.')[1];
if (!projectRef) {
  console.log('Не удалось определить ref проекта из DIRECT_URL');
  process.exit(1);
}

const host = `db.${projectRef}.supabase.co`;
console.log(`Подключаюсь напрямую к ${host}:5432`);

const client = new Client({
  host,
  port: 5432,
  user: 'postgres',
  password: decodeURIComponent(u.password),
  database: 'postgres',
  ssl: { rejectUnauthorized: false }, // только для этого диагностического теста
  keepAlive: true,
});

const startedAt = Date.now();
const elapsed = () => ((Date.now() - startedAt) / 1000).toFixed(1);

client.on('error', (e) => console.log(`[${elapsed()}s] client error event: ${e.message}`));

try {
  await client.connect();
} catch (e) {
  console.log(`[${elapsed()}s] не удалось подключиться: ${e.code || ''} ${e.message}`);
  process.exit(1);
}
console.log(`[${elapsed()}s] connected`);

let i = 0;
while (Date.now() - startedAt < 60000) {
  i++;
  const t0 = Date.now();
  try {
    await client.query('select 1');
    if (i <= 8 || i % 20 === 0) {
      console.log(`[${elapsed()}s] query #${i} ok (${Date.now() - t0} ms)`);
    }
  } catch (e) {
    console.log(`[${elapsed()}s] query #${i} FAILED after ${Date.now() - t0} ms: ${e.message}`);
    break;
  }
  await new Promise((r) => setTimeout(r, 1000));
}

await client.end().catch(() => {});
console.log(`[${elapsed()}s] done`);