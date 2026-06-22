-- AlterTable: change user_profiles foreign key from RESTRICT to CASCADE
ALTER TABLE "identity"."user_profiles"
DROP CONSTRAINT "user_profiles_user_id_fkey";

ALTER TABLE "identity"."user_profiles"
ADD CONSTRAINT "user_profiles_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
