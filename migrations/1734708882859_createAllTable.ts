import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Create the users table
	await db.schema
		.createTable('users')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('telegram_id', 'varchar', (col) => col.notNull())
		.addColumn('username', 'varchar', (col) => col.notNull())
		.addColumn('first_name', 'varchar', (col) => col.notNull())
		.addColumn('last_name', 'varchar')
		.addColumn('limit', 'integer')
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.execute();

	// Create the transactions table
	await db.schema
		.createTable('transactions')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
		.addColumn('total_price_before_discount', 'varchar', (col) => col.notNull())
		.addColumn('total_price_after_discount', 'varchar', (col) => col.notNull())
		.addColumn('store_name', 'varchar', (col) => col.notNull())
		.addColumn('transaction_date', 'timestamp', (col) => col.notNull())
		.addColumn('currency', 'varchar(50)', (col) => col.notNull())
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.execute();

	// Create the items table
	await db.schema
		.createTable('items')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('transaction_id', 'integer', (col) => col.references('transactions.id').onDelete('cascade').notNull())
		.addColumn('item', 'varchar', (col) => col.notNull())
		.addColumn('item_count', 'integer', (col) => col.notNull())
		.addColumn('price', 'varchar', (col) => col.notNull())
		.execute();

	// Create the discounts table
	await db.schema
		.createTable('discounts')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('transaction_id', 'integer', (col) => col.references('transactions.id').onDelete('cascade').notNull())
		.addColumn('description', 'varchar', (col) => col.notNull())
		.addColumn('amount', 'varchar', (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop the discounts table
	await db.schema.dropTable('discounts').execute();

	// Drop the items table
	await db.schema.dropTable('items').execute();

	// Drop the transactions table
	await db.schema.dropTable('transactions').execute();

	// Drop the users table
	await db.schema.dropTable('users').execute();
}
