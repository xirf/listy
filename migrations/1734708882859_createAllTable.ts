import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {

	await db.schema
		.createTable('users')
		.addColumn('telegram_id', 'varchar', (col) => col.primaryKey())
		.addColumn('limit', 'integer')
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.execute();

	await db.schema
		.createTable('transactions')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('user_id', 'varchar', (col) => col.references('users.telegram_id').onDelete('cascade').notNull())
		.addColumn('total_price_before_discount', 'decimal', (col) => col.notNull())
		.addColumn('total_price_after_discount', 'decimal', (col) => col.notNull())
		.addColumn('discount_amount', 'decimal', (col) => col.notNull())
		.addColumn('store_name', 'varchar')
		.addColumn('transaction_date', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.addColumn('currency', 'varchar(50)', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.execute();

	await db.schema
		.createTable('items')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('transaction_id', 'integer', (col) => col.references('transactions.id').onDelete('cascade').notNull())
		.addColumn('item', 'varchar', (col) => col.notNull())
		.addColumn('item_count', 'integer', (col) => col.notNull())
		.addColumn('price', 'decimal', (col) => col.notNull())
		.execute();

	await db.schema
		.createTable('discounts')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('transaction_id', 'integer', (col) => col.references('transactions.id').onDelete('cascade').notNull())
		.addColumn('description', 'varchar', (col) => col.notNull())
		.addColumn('amount', 'decimal', (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {

	await db.schema.dropTable('discounts').execute();
	await db.schema.dropTable('items').execute();
	await db.schema.dropTable('transactions').execute();
	await db.schema.dropTable('users').execute();
}