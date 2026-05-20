-- 272-06: link a checkout/order to the Clerk customer who placed it.
-- Nullable so guest checkout (no Clerk session) still persists orders.
alter table if exists public.orders
  add column if not exists clerk_user_id text;

create index if not exists orders_clerk_user_id_idx
  on public.orders (clerk_user_id)
  where clerk_user_id is not null;
