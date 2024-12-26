import type {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely';

export interface UserTable {
    telegram_id: string;
    limit: number | null;
    total_spending: number;
    reset_at: ColumnType<Date>;
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface ItemTable {
    id: Generated<number>;
    transaction_id: number;
    item: string;
    item_count: number;
    price: number;
}

export interface DiscountTable {
    id: Generated<number>;
    transaction_id: number;
    description: string;
    amount: number;
}

export interface TransactionTable {
    id: Generated<number>;
    user_id: string;
    total_price_before_discount: ColumnType<number | undefined>;
    total_price_after_discount: ColumnType<number | undefined>;
    store_name: ColumnType<string | undefined>;
    discount_amount: ColumnType<number | undefined>;
    transaction_date: ColumnType<Date, string | undefined, never>;
    currency: ColumnType<string | undefined>;
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface HistoryTable {
    id: Generated<number>;
    telegram_id: string;
    message: string;
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface ChecksumTable {
    id: Generated<number>;
    checksum: string;
    user_id: string;
}

export interface Database {
    users: UserTable;
    items: ItemTable;
    discounts: DiscountTable;
    transactions: TransactionTable;
    history: HistoryTable;
    checksum: ChecksumTable;
}

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

export type History = Selectable<HistoryTable>;
export type NewHistory = Insertable<HistoryTable>;
export type HistoryUpdate = Updateable<HistoryTable>;

export type Checksum = Selectable<ChecksumTable>;
export type NewChecksum = Insertable<ChecksumTable>;
export type ChecksumUpdate = Updateable<ChecksumTable>;