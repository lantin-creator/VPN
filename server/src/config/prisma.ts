import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
type PoolClientWithProcessId = import('pg').PoolClient & {
    processID?: number
}

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: {
    ca: readFileSync('./prisma/prod-ca-2021.crt', 'utf8'),
    rejectUnauthorized: true,
  },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
})

pool.on('error', (error) => {
    console.error('[PostgreSQL Pool Error]', {
        message: error.message,
        code: (error as NodeJS.ErrnoException).code,
    })
})

pool.on('connect', (client) => {
    const clientId = (client as PoolClientWithProcessId).processID

    console.log('[PG Pool] Client connected:', clientId)

    client.on('error', (error) => {
        console.error('[PG Pool] Client error:', {
            clientId,
            message: error.message,
            code: (error as NodeJS.ErrnoException).code,
        })
    })
})

pool.on('acquire', (client) => {
    console.log(
        '[PG Pool] Client acquired:',
        (client as PoolClientWithProcessId).processID
    )
})

pool.on('remove', (client) => {
    console.log(
        '[PG Pool] Client removed:',
        (client as PoolClientWithProcessId).processID
    )
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })
prisma.$queryRaw<
  Array<{ timeout: string; role: string; pid: number }>
>`
  SELECT
    current_setting('idle_in_transaction_session_timeout') AS timeout,
    current_user::text AS role,
    pg_backend_pid() AS pid
`
  .then((result) => {
    console.log('[PostgreSQL Session Settings]', result)
  })
  .catch((error) => {
    console.error('[PostgreSQL Session Settings Error]', error)
  })

export default prisma