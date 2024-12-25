import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('history')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('telegram_id', 'varchar', (col) => col.references('users.telegram_id').onDelete('cascade').notNull())
		.addColumn('message', 'text', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('history').execute();
}
