import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

const envName = process.argv[2] || 'DIRECT_URL';
const intervalMs = Number(process.argv[3] ?? 1000);
const useKeepAlive = process.argv[4] !== '0';
if (!process.env[envName]) {
  console.log(`Переменная ${envName} не найдена в .env`);
  process.exit(1);
}

const client = new Client({
  connectionString: (process.env[envName] || '').split('?')[0],
  ssl: {
    ca: readFileSync('./prisma/prod-ca-2021.crt', 'utf8'),
    rejectUnauthorized: true,
  },
  keepAlive: useKeepAlive,
});

const startedAt = Date.now();
const elapsed = () => ((Date.now() - startedAt) / 1000).toFixed(1);

console.log(`env=${envName} interval=${intervalMs}ms keepAlive=${useKeepAlive} node=${process.version}`);
client.on('error', (e) => console.log(`[${elapsed()}s] client error event: ${e.message}`));

await client.connect();
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
  await new Promise((r) => setTimeout(r, intervalMs));
}

await client.end().catch(() => {});
console.log(`[${elapsed()}s] done`);