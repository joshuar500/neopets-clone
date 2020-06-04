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

-- drop table if exists app_public.user_feed_posts;
-- drop table if exists app_public.posts;
-- drop table if exists app_public.topics;

-- create table app_public.topics (
--   title            text not null primary key
-- );
-- alter table app_public.topics enable row level security;

-- create table app_public.posts (
--   id               serial primary key,
--   author_id        int default app_public.current_user_id() references app_public.users(id) on delete set null,
--   headline         text not null check (char_length(headline) < 280),
--   body             text,
--   topic            text not null references app_public.topics on delete restrict,
--   created_at       timestamptz not null default now(),
--   updated_at       timestamptz not null default now()
-- );
-- alter table app_public.posts enable row level security;
-- create index on app_public.posts (author_id);

-- create trigger _100_timestamps before insert or update on app_public.posts for each row execute procedure app_private.tg__timestamps();

-- grant
--   select,
--   insert (headline, body, topic),
--   update (headline, body, topic),
--   delete
-- on app_public.posts to :DATABASE_VISITOR;

-- create policy select_all on app_public.posts for select using (true);
-- create policy manage_own on app_public.posts for all using (author_id = app_public.current_user_id());
-- create policy manage_as_admin on app_public.posts for all using (exists (select 1 from app_public.users where is_admin is true and id = app_public.current_user_id()));

-- comment on table app_public.posts is 'A forum post written by a `User`.';
-- comment on column app_public.posts.id is 'The primary key for the `Post`.';
-- comment on column app_public.posts.headline is 'The title written by the `User`.';
-- comment on column app_public.posts.author_id is 'The id of the author `User`.';
-- comment on column app_public.posts.topic is 'The `Topic` this has been posted in.';
-- comment on column app_public.posts.body is 'The main body text of our `Post`.';
-- comment on column app_public.posts.created_at is 'The time this `Post` was created.';
-- comment on column app_public.posts.updated_at is 'The time this `Post` was last modified (or created).';

-- create table app_public.user_feed_posts (
--   id               serial primary key,
--   user_id          int not null references app_public.users on delete cascade,
--   post_id          int not null references app_public.posts on delete cascade,
--   created_at       timestamptz not null default now()
-- );
-- alter table app_public.user_feed_posts enable row level security;
-- create index on app_public.user_feed_posts (user_id);
-- create index on app_public.user_feed_posts (post_id);

-- grant select on app_public.user_feed_posts to :DATABASE_VISITOR;

-- create policy select_own on app_public.user_feed_posts for select using (user_id = app_public.current_user_id());

-- comment on table app_public.user_feed_posts is 'A feed of `Post`s relevant to a particular `User`.';
-- comment on column app_public.user_feed_posts.id is 'An identifier for this entry in the feed.';
-- comment on column app_public.user_feed_posts.created_at is 'The time this feed item was added.';


drop function if exists app_public.create_pet(pet_name text);
drop function if exists app_public.feed_pet(pet_id int);

drop table if exists app_public.user_pets;

create table app_public.user_pets (
  id                  serial primary key,
  pet_name            text not null,
  user_id             uuid NOT NULL,
  created_at          timestamptz not null default now(),
  last_fed            timestamptz not null default now()
);
alter table app_public.user_pets enable row level security;

grant
  select,
  insert (pet_name),
  update (last_fed),
  delete
on app_public.user_pets to :DATABASE_VISITOR;

create policy select_all on app_public.user_pets for select using (true);
create policy manage_own on app_public.user_pets for all using (user_id = app_public.current_user_id());

comment on table app_public.user_pets is 'A pet owned by a `User`.';
comment on column app_public.user_pets.id is 'The primary key for the `Pet`.';
comment on column app_public.user_pets.user_id is 'The owner id is the `User`.';
comment on column app_public.user_pets.pet_name is 'The name of the `Pet`.';
comment on column app_public.user_pets.created_at is 'The timestamp for when the pet was born.';
comment on column app_public.user_pets.last_fed is 'The timestamp for when the pet was last fed.';

-- create_pet --

CREATE FUNCTION app_public.create_pet(pet_name text) RETURNS app_public.user_pets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_pet app_public.user_pets;
begin
  insert into app_public.user_pets (pet_name, user_id) values (pet_name, app_public.current_user_id()) returning * into v_pet;
  return v_pet;
end;
$$;

REVOKE ALL ON FUNCTION app_public.create_pet(pet_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_pet(pet_name text) TO graphile_starter_visitor;

-- create index for users_pets --

CREATE INDEX users_pets_user_id_idx ON app_public.user_pets USING btree (user_id);

ALTER TABLE ONLY app_public.user_pets
    ADD CONSTRAINT users_pets_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id);


-- feed_pet --

CREATE FUNCTION app_public.feed_pet(pet_id int) RETURNS app_public.user_pets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_pet app_public.user_pets;
begin
  update app_public.user_pets
  set
    last_fed = now()
  where id = pet_id;
  select * into v_pet from app_public.user_pets where id = pet_id;
  return v_pet;
end;
$$;

REVOKE ALL ON FUNCTION app_public.create_pet(pet_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_pet(pet_name text) TO graphile_starter_visitor;
