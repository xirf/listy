import type {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';

export interface UserTable {
    id: Generated<number>; // Primary key for the user
    telegram_id: string; // Telegram user ID
    username: string; // Telegram username
    first_name: string; // User's first name
    last_name: string | null; // User's last name (optional)
    limit: number | null; // Limit for the user
    created_at: ColumnType<Date, string | undefined, never>; // Timestamp for user creation
}

export interface ItemTable {
    id: Generated<number>; // Primary key for the item
    transaction_id: number; // Foreign key to the Transaction table
    item: string;
    item_count: number;
    price: string;
}

export interface DiscountTable {
    id: Generated<number>; // Primary key for the discount
    transaction_id: number; // Foreign key to the Transaction table
    description: string;
    amount: string;
}

export interface TransactionTable {
    id: Generated<number>; // Primary key for the transaction
    user_id: number; // Foreign key to the User table
    total_price_before_discount: string;
    total_price_after_discount: string;
    store_name: string;
    transaction_date: Date;
    currency: string;
    created_at: ColumnType<Date, string | undefined, never>; // Timestamp for transaction creation
}

export interface Database {
    users: UserTable;
    items: ItemTable;
    discounts: DiscountTable;
    transactions: TransactionTable;
}

// Wrappers for specific operations
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type Item = Selectable<ItemTable>;
export type NewItem = Insertable<ItemTable>;
export type ItemUpdate = Updateable<ItemTable>;

export type Discount = Selectable<DiscountTable>;
export type NewDiscount = Insertable<DiscountTable>;
export type DiscountUpdate = Updateable<DiscountTable>;

export type Transaction = Selectable<TransactionTable>;
export type NewTransaction = Insertable<TransactionTable>;
export type TransactionUpdate = Updateable<TransactionTable>;
