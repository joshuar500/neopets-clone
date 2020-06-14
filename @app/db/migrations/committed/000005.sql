--! Previous: sha1:e8f7256d2e9e4bdd93edda1f553af9cd7b0da936
--! Hash: sha1:b2c693d7ca076465ecbdfdfce591bb07047eac06

-- Enter migration here

drop function if exists app_public.create_pet(pet_name text, slug public.citext) cascade;
drop function if exists app_public.create_user_pet(pet_name text, slug public.citext) cascade;


CREATE FUNCTION app_public.create_user_pet(pet_name text, slug public.citext) RETURNS app_public.user_pets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_pet app_public.user_pets;
begin
  insert into app_public.user_pets (pet_name, user_id, slug) values (pet_name, app_public.current_user_id(), slug) returning * into v_pet;
  return v_pet;
end;
$$;

REVOKE ALL ON FUNCTION app_public.create_user_pet(pet_name text, slug public.citext) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_user_pet(pet_name text, slug public.citext) TO graphile_starter_visitor;

alter table app_public.user_pets enable row level security;

grant
  select,
  insert (pet_name, slug),
  update (last_fed, level, experience),
  delete
on app_public.user_pets to :DATABASE_VISITOR;
