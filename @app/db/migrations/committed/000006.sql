--! Previous: sha1:b2c693d7ca076465ecbdfdfce591bb07047eac06
--! Hash: sha1:b2941638b2e39c36122f16011e6852cf6dccafc6

-- Enter migration here

-- disable the `createUserPet` that postgraphile auto generates since we're using out own createUserPet
COMMENT ON TABLE "app_public"."user_pets" IS E'@omit create\nA pet owned by a `User`.';
