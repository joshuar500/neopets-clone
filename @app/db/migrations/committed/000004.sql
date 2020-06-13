--! Previous: sha1:66d9820a4962c5133513777967d6382ae4c01604
--! Hash: sha1:e8f7256d2e9e4bdd93edda1f553af9cd7b0da936

-- Enter migration here
alter table app_public.user_pets enable row level security;

grant
  select,
  insert (pet_name, slug),
  update (last_fed),
  delete
on app_public.user_pets to :DATABASE_VISITOR;

alter table if exists app_public.user_pets drop constraint if exists user_pets_slug_key cascade;

ALTER TABLE ONLY app_public.user_pets
    ADD CONSTRAINT user_pets_slug_key UNIQUE (slug);
