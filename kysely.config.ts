import {
	DummyDriver,
	PostgresAdapter,
	PostgresIntrospector,
	PostgresQueryCompiler,
} from 'kysely'
import { defineConfig } from 'kysely-ctl'
import { db } from "./src/database/index.ts"

export default defineConfig({
	kysely: db,
	migrations: {
		migrationFolder: './migrations',
	}
})
