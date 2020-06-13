--! Previous: sha1:a5b467005f4aac03bd42c4bb617c6da98693efc8
--! Hash: sha1:66d9820a4962c5133513777967d6382ae4c01604

-- Enter migration here

-- add level column
alter table app_public.user_pets drop column if exists level cascade;
alter table app_public.user_pets add column level integer not null default 1;
COMMENT ON COLUMN app_public.user_pets.level IS 'The level of the pet.';

-- add experience column

alter table app_public.user_pets drop column if exists experience cascade;
alter table app_public.user_pets add column experience integer not null default 1;
COMMENT ON COLUMN app_public.user_pets.experience IS 'The experience of the pet.';

-- add slug column

alter table app_public.user_pets drop column if exists slug cascade;
alter table app_public.user_pets add column slug public.citext NOT NULL;
COMMENT ON COLUMN app_public.user_pets.slug IS 'The url for the pet.';

-- create pet function

drop function if exists app_public.create_pet(pet_name text, slug public.citext) cascade;

CREATE FUNCTION app_public.create_pet(pet_name text, slug public.citext) RETURNS app_public.user_pets
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

REVOKE ALL ON FUNCTION app_public.create_pet(pet_name text, slug public.citext) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_pet(pet_name text, slug public.citext) TO graphile_starter_visitor;
