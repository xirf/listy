import type { Database } from '../types/database'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
    pool: new Pool({
        database: process.env.PG_DATABASE,
        host: process.env.PG_HOST,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT || "5432"),
        max: parseInt(process.env.PG_POOL || "10"),
    })
})

export const db = new Kysely<Database>({
    dialect,
})  