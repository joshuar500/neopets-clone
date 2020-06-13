-- Enter migration here
alter table app_public.user_pets enable row level security;

grant
  select,
  insert (pet_name, slug),
  update (last_fed),
  delete
on app_public.user_pets to :DATABASE_VISITOR;

ALTER TABLE ONLY app_public.user_pets
    ADD CONSTRAINT user_pets_slug_key UNIQUE (slug);
