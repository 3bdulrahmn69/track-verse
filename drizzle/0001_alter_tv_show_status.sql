-- Alter the tv_show_status enum to replace 'dropped' with 'stopped_watching'
ALTER TYPE "public"."tv_show_status" RENAME VALUE 'dropped' TO 'stopped_watching';