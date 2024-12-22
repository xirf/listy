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
    total_price_before_discount: number;
    total_price_after_discount: number;
    store_name: string;
    transaction_date: ColumnType<Date, string | undefined, never>;
    currency: string;
    created_at: ColumnType<Date, string | undefined, never>;
}

export interface Database {
    users: UserTable;
    items: ItemTable;
    discounts: DiscountTable;
    transactions: TransactionTable;
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
