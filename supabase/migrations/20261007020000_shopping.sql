-- Shopping lists: which weekdays Elie shops (0 = Monday), and what is already in the cart for a trip
-- (stored on the trip's first day).
alter table public.profiles add column shop_days int[] not null default '{0,3}';
alter table public.day_logs add column shopping jsonb;
