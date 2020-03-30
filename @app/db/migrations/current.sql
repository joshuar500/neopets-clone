/*

This project is using Graphile Migrate to manage migrations; please be aware
the Graphile Migrate works in a different way to most other migration
frameworks:

- it's "up-only" (there are no down migrations)
- the current migration (this file) is executed every time it is saved
- it requires *significant discipline* as changes made in this file will
  persist locally even after they are deleted from the file

Because during development the current migration is expected to run multiple
times, the migration has to deal with both the situation where it _has_ been
executed before, and where it _hasn't_ been executed before.

You can (and should) read more on Graphile Migrate in its repository:

  https://github.com/graphile/migrate

You can absolutely switch out Graphile Migrate for a more traditional
migration framework if you prefer.

*/

--------------------------------------------------------------------------------

/*

What follows is an example of a table that could be created after setup is
complete. To use it uncomment the statements below and save the file -
graphile-migrate will update the schema into database automagically and
PostGraphile should automatically detect these changes and reflect them
through GraphQL which you should see immediately in GraphiQL.

Note any "DROP" statements should be at the top in reverse order of creation.
The reason for reverse order is because we could have references from the
second created resource to the first created resource. So your migration
might look something like this pseudo-example:

    DROP C;
    DROP B;
    DROP A;
    CREATE A;
    CREATE B REFERENCING A;
    CREATE C REFERENCING A;

We have to DROP B before DROP A because we have references that point to A
from B.

You can uncomment the following lines one block a time and safe the file to view
the changes.

**IMPORTANT**: when you uncomment the `CREATE TABLE` statements this will not
result in the table being added to the GraphQL API, this is because we are
using `ignoreRBAC: false` so we do not expose tables until you `GRANT` the
relevant operations on them. The tables will appear when you uncomment the
`GRANT` lines.

*/


drop function if exists app_public.create_pet(pet_name text);
drop function if exists app_public.feed_pet(pet_id int);

drop table if exists app_public.users_pets;

create table app_public.users_pets (
  id                  serial primary key,
  pet_name            text not null,
  user_id             uuid NOT NULL,
  created_at          timestamptz not null default now(),
  last_fed            timestamptz not null default now()
);
alter table app_public.users_pets enable row level security;

grant
  select,
  insert (pet_name),
  update (last_fed),
  delete
on app_public.users_pets to :DATABASE_VISITOR;

create policy select_all on app_public.users_pets for select using (true);
create policy manage_own on app_public.users_pets for all using (user_id = app_public.current_user_id());

comment on table app_public.users_pets is 'A pet owned by a `User`.';
comment on column app_public.users_pets.id is 'The primary key for the `Pet`.';
comment on column app_public.users_pets.user_id is 'The owner id is the `User`.';
comment on column app_public.users_pets.pet_name is 'The name of the `Pet`.';
comment on column app_public.users_pets.created_at is 'The timestamp for when the pet was born.';
comment on column app_public.users_pets.last_fed is 'The timestamp for when the pet was last fed.';

-- create_pet --

CREATE FUNCTION app_public.create_pet(pet_name text) RETURNS app_public.users_pets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_pet app_public.users_pets;
begin
  insert into app_public.users_pets (pet_name, user_id) values (pet_name, app_public.current_user_id()) returning * into v_pet;
  return v_pet;
end;
$$;

REVOKE ALL ON FUNCTION app_public.create_pet(pet_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_pet(pet_name text) TO graphile_starter_visitor;

-- create index for users_pets --

CREATE INDEX users_pets_user_id_idx ON app_public.users_pets USING btree (user_id);

ALTER TABLE ONLY app_public.users_pets
    ADD CONSTRAINT users_pets_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id);


-- feed_pet --

CREATE FUNCTION app_public.feed_pet(pet_id int) RETURNS app_public.users_pets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_pet app_public.users_pets;
begin
  update app_public.users_pets
  set
    last_fed = now()
  where id = pet_id;
  select * into v_pet from app_public.users_pets where id = pet_id;
  return v_pet;
end;
$$;

REVOKE ALL ON FUNCTION app_public.create_pet(pet_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_pet(pet_name text) TO graphile_starter_visitor;

