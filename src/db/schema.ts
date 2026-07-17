/**
 * bakingsoda — data model
 * ------------------------------------------------------------------
 * The core idea of this schema is the PROVENANCE GRAPH:
 *
 *   items (inspiration in)  →  projects (the work)  →  artifacts (output out)
 *
 * Everything else — ingredients, tags, events, profiles — hangs off
 * that spine. If you understand these tables, you understand the app.
 *
 * Conventions used here:
 *  - Every table has a text `id` (nanoid generated in app code) rather
 *    than serial ints. Ids never leak information and are safe in URLs.
 *  - Timestamps are `timestamptz` (UTC). The timeline slider and
 *    "dates tracked automatically" both fall out of these for free.
 *  - Enums are pgEnum so the database rejects invalid states, not just
 *    the TypeScript compiler.
 *  - Fork-ability is pre-planned via nullable `forkedFrom*` columns.
 *    We don't build forking in v1, but the graph can already express it.
 */
import {
  pgTable,
  pgEnum,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums — the vocabulary of the app                                   */
/* ------------------------------------------------------------------ */

/** Project lifecycle. The names are product copy, on purpose. */
export const projectStatus = pgEnum("project_status", [
  "fermenting", // backburner — quietly improving while ignored
  "in_the_oven", // actively building
  "fully_baked", // finished
  "flat", // orphaned — it just didn't rise, no shame
]);

/** Everything defaults to private. Public is an explicit choice. */
export const visibility = pgEnum("visibility", ["private", "public"]);

/** What kind of thing a saved inspiration is. Drives card rendering. */
export const itemKind = pgEnum("item_kind", [
  "tweet",
  "pin",
  "video",
  "article",
  "paper",
  "figma",
  "image",
  "pdf",
  "repo",
  "other",
]);

/** What kind of thing a shipped artifact is. */
export const artifactKind = pgEnum("artifact_kind", [
  "tweet_thread",
  "repo",
  "blog_post",
  "video",
  "demo",
  "other",
]);

/** Ingredient categories shown on the recipe strip. */
export const ingredientKind = pgEnum("ingredient_kind", [
  "tool", // figma, react, claude api…
  "font", // syne, inter…
  "color", // hex values, rendered as swatches
  "library", // tone.js, drizzle…
]);

/** How a project's inspiration wall is arranged (user-authored). */
export const arrangement = pgEnum("arrangement", ["collage", "sequence"]);

/** Hero media slot on a project page. */
export const coverKind = pgEnum("cover_kind", ["image", "video", "demo"]);

/* ------------------------------------------------------------------ */
/* users — one row per account, doubles as the public profile          */
/* ------------------------------------------------------------------ */
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    /** URL identity: bakingsoda.dev/@handle */
    handle: text("handle").notNull(),
    name: text("name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    /** Which projects are spotlighted on the profile, ordered. */
    spotlightProjectIds: text("spotlight_project_ids").array(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_handle_idx").on(t.handle)],
);

/* ------------------------------------------------------------------ */
/* items — a saved piece of inspiration (the input side of the graph)  */
/* ------------------------------------------------------------------ */
export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    kind: itemKind("kind").notNull().default("other"),
    /** Unfurled metadata — filled by the capture pipeline (ADR-0004). */
    title: text("title"),
    description: text("description"),
    authorHandle: text("author_handle"), // e.g. @sailorhg
    sourcePlatform: text("source_platform"), // twitter, pinterest, arxiv…
    imageUrl: text("image_url"),
    visibility: visibility("visibility").notNull().default("private"),
    /** Fork pre-plan: set when a user saves someone else's public item. */
    forkedFromItemId: text("forked_from_item_id"),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // The board is always "this user's items, newest first" — one index
    // serves the hot path.
    index("items_user_saved_idx").on(t.userId, t.savedAt),
  ],
);

/* ------------------------------------------------------------------ */
/* projects — the work itself (the middle of the graph)                */
/* ------------------------------------------------------------------ */
export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** URL identity: /projects/uncorked */
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: projectStatus("status").notNull().default("fermenting"),
    visibility: visibility("visibility").notNull().default("private"),
    /** Hero media: an image, a video, or an embedded live demo. */
    coverKind: coverKind("cover_kind"),
    coverUrl: text("cover_url"),
    /** "how i made it" — markdown, user-edited, later draftable by AI. */
    howIMadeIt: text("how_i_made_it"),
    /** How the inspiration wall renders (user's authored arrangement). */
    arrangement: arrangement("arrangement").notNull().default("collage"),
    /**
     * Dates are DERIVED (first linked item → last artifact), then cached
     * here so list views never need aggregate queries. Recomputed on
     * write, not read. Nobody types dates; nobody tracks hours.
     */
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    forkedFromProjectId: text("forked_from_project_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("projects_user_slug_idx").on(t.userId, t.slug)],
);

/* ------------------------------------------------------------------ */
/* project_items — the edge that makes this a graph, not two lists     */
/* ------------------------------------------------------------------ */
/**
 * Many-to-many on purpose: one tweet can inspire three projects, and
 * that's exactly the kind of connection the obsidian-style graph view
 * (post-MVP) will want to draw.
 */
export const projectItems = pgTable(
  "project_items",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    /** User-controlled ordering within the arrangement. */
    position: integer("position").notNull().default(0),
    /** Optional caption when arrangement = "sequence". */
    caption: text("caption"),
    linkedAt: timestamp("linked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("project_items_pk").on(t.projectId, t.itemId),
    index("project_items_item_idx").on(t.itemId), // reverse traversal
  ],
);

/* ------------------------------------------------------------------ */
/* artifacts — what you shipped (the output side of the graph)         */
/* ------------------------------------------------------------------ */
export const artifacts = pgTable(
  "artifacts",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    kind: artifactKind("kind").notNull().default("other"),
    /** Same unfurl treatment as items — artifacts get preview cards too. */
    title: text("title"),
    description: text("description"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("artifacts_project_idx").on(t.projectId)],
);

/* ------------------------------------------------------------------ */
/* ingredients — the recipe strip                                      */
/* ------------------------------------------------------------------ */
export const ingredients = pgTable(
  "ingredients",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: ingredientKind("kind").notNull(),
    /** "figma", "syne", "#7FB5A8", "tone.js" — rendering depends on kind. */
    value: text("value").notNull(),
    /** True when the extractor suggested it rather than the user. */
    autoExtracted: boolean("auto_extracted").notNull().default(false),
    /**
     * Auto-extracted ingredients start unconfirmed and render with the
     * ✓ keep / ✕ affordance. User-added ingredients are born confirmed.
     */
    confirmed: boolean("confirmed").notNull().default(true),
  },
  (t) => [index("ingredients_project_idx").on(t.projectId)],
);

/* ------------------------------------------------------------------ */
/* events — the project timeline                                       */
/* ------------------------------------------------------------------ */
/**
 * One row per notable moment ("wind-chime trigger working"). Feeds:
 *  1. the timeline inside "how i made it"
 *  2. the future AI draft ("draft this from my timeline")
 *  3. the post-MVP taste-over-time slider
 */
export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    note: text("note").notNull(),
    /** Optional link (commit, tweet, figma file) backing the moment. */
    url: text("url"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("events_project_time_idx").on(t.projectId, t.occurredAt)],
);

/* ------------------------------------------------------------------ */
/* tags — one flexible taxonomy, applied to items and projects         */
/* ------------------------------------------------------------------ */
export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // stored lowercase, no '#'
  },
  (t) => [uniqueIndex("tags_user_name_idx").on(t.userId, t.name)],
);

export const itemTags = pgTable(
  "item_tags",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("item_tags_pk").on(t.itemId, t.tagId)],
);

export const projectTags = pgTable(
  "project_tags",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("project_tags_pk").on(t.projectId, t.tagId)],
);
