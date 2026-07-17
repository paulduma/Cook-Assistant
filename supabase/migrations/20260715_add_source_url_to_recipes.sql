-- Traceability for recipes imported from an external URL (e.g. Instagram).
alter table public.recipes
  add column if not exists source_url text;
