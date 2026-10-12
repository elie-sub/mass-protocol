-- Login relay for the installed iPhone app: the magic link opens in Safari, which does not share storage with
-- the home-screen app. Safari drops the new session here under a one-time random nonce that only the app knows;
-- the app picks it up and the row is deleted. RLS on, no policies: only the server (service role) touches it.
create table public.auth_handoffs (
  nonce text primary key check (length(nonce) >= 32),
  access_token text not null,
  refresh_token text not null,
  created_at timestamptz not null default now()
);
alter table public.auth_handoffs enable row level security;
