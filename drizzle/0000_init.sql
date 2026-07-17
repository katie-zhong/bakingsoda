CREATE TYPE "public"."arrangement" AS ENUM('collage', 'sequence');--> statement-breakpoint
CREATE TYPE "public"."artifact_kind" AS ENUM('tweet_thread', 'repo', 'blog_post', 'video', 'demo', 'other');--> statement-breakpoint
CREATE TYPE "public"."cover_kind" AS ENUM('image', 'video', 'demo');--> statement-breakpoint
CREATE TYPE "public"."ingredient_kind" AS ENUM('tool', 'font', 'color', 'library');--> statement-breakpoint
CREATE TYPE "public"."item_kind" AS ENUM('tweet', 'pin', 'video', 'article', 'paper', 'figma', 'image', 'pdf', 'repo', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('fermenting', 'in_the_oven', 'fully_baked', 'flat');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "artifacts" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"url" text NOT NULL,
	"kind" "artifact_kind" DEFAULT 'other' NOT NULL,
	"title" text,
	"description" text,
	"image_url" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"note" text NOT NULL,
	"url" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"kind" "ingredient_kind" NOT NULL,
	"value" text NOT NULL,
	"auto_extracted" boolean DEFAULT false NOT NULL,
	"confirmed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_tags" (
	"item_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"kind" "item_kind" DEFAULT 'other' NOT NULL,
	"title" text,
	"description" text,
	"author_handle" text,
	"source_platform" text,
	"image_url" text,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"forked_from_item_id" text,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_items" (
	"project_id" text NOT NULL,
	"item_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"caption" text,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tags" (
	"project_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'fermenting' NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"cover_kind" "cover_kind",
	"cover_url" text,
	"how_i_made_it" text,
	"arrangement" "arrangement" DEFAULT 'collage' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"forked_from_project_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"spotlight_project_ids" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_items" ADD CONSTRAINT "project_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_items" ADD CONSTRAINT "project_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artifacts_project_idx" ON "artifacts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "events_project_time_idx" ON "events" USING btree ("project_id","occurred_at");--> statement-breakpoint
CREATE INDEX "ingredients_project_idx" ON "ingredients" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "item_tags_pk" ON "item_tags" USING btree ("item_id","tag_id");--> statement-breakpoint
CREATE INDEX "items_user_saved_idx" ON "items" USING btree ("user_id","saved_at");--> statement-breakpoint
CREATE UNIQUE INDEX "project_items_pk" ON "project_items" USING btree ("project_id","item_id");--> statement-breakpoint
CREATE INDEX "project_items_item_idx" ON "project_items" USING btree ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_tags_pk" ON "project_tags" USING btree ("project_id","tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_user_slug_idx" ON "projects" USING btree ("user_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_name_idx" ON "tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_handle_idx" ON "users" USING btree ("handle");