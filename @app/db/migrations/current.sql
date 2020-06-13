-- Enter migration here

-- disable the `createUserPet` that postgraphile auto generates since we're using out own createUserPet
COMMENT ON TABLE "app_public"."user_pets" IS E'@omit create\nA pet owned by a `User`.';
