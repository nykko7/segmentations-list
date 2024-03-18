CREATE TABLE IF NOT EXISTS "segmentations-list_key" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(15) NOT NULL,
	"hashed_password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "segmentations-list_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "segmentations-list_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"lastName" varchar(255),
	"email" varchar(255) NOT NULL,
	"roles" json DEFAULT '["RADIOLOGIST"]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "segmentations-list_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_idx" ON "segmentations-list_session" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "segmentations-list_user" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "segmentations-list_post" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "segmentations-list_session" ADD CONSTRAINT "segmentations-list_session_user_id_segmentations-list_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "segmentations-list_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
