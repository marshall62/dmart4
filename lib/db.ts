import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  varchar,
  integer,
  boolean,
  timestamp,
  pgEnum,
  serial,
  primaryKey
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';


export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  image_url: text('image_url'),
  midsize_image_url: text('midsize_image_url'),
  thumbnail_image_url: text('thumbnail_image_url'),
  filename: text('filename'),
  title: text('title').notNull(),
  media: text('media').notNull(),
  category_name: text('category_name'),
  price: numeric('price', { precision: 10, scale: 2 }),
  width: numeric('width', { precision: 10, scale: 2 }),
  height: numeric('height', { precision: 10, scale: 2 }),
  year: integer('year'),
  is_sold: boolean('is_sold'),
  is_active: boolean('is_active'),
  mongo_id: varchar('mongo_id',{ length: 30 }),
  owner: varchar('owner',{ length: 100 })
});

export const artworksRelations = relations(artworks, ({ many }) => ({
  artworksToTags: many(artworksToTags),
}));

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull()
})

export const tagsRelations = relations(tags, ({ many }) => ({
  artworksToTags: many(artworksToTags),
}));

export const artworksToTags = pgTable(
  'artwork_tag_join',
  {
    artworkId: integer('artwork_id')
      .notNull()
      .references(() => artworks.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.artworkId, t.tagId] }),
  }),
);

export const artworksToTagsRelations = relations(artworksToTags, ({ one }) => ({
  tag: one(tags, {
    fields: [artworksToTags.tagId],
    references: [tags.id],
  }),
  artwork: one(artworks, {
    fields: [artworksToTags.artworkId],
    references: [artworks.id],
  }),
}));

export type SelectArtwork = typeof artworks.$inferSelect;

// export const artworkTagJoin = pgTable('artwork_tag_join', {
//   tag_id: integer('tag_id').primaryKey(),
//   artwork_id: integer('name').primaryKey()
// })

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);
export const insertArtworksSchema = createInsertSchema(artworks);

export async function createArtwork(artwork) {
  const res = await db.insert(artworks,artwork)
}

export async function getArtworks(): Promise<SelectArtwork[]> {
  return await db.select().from(artworks).orderBy(artworks.id);
}

export async function getArtwork(id: number): Promise<SelectArtwork> {
  const rows = await db.select().from(artworks).where(eq(artworks.id, id));
  return rows[0];
}

export async function getArtworkByImageUrl(url: string): Promise<SelectArtwork> {
  const rows = await db.select().from(artworks).where(eq(artworks.image_url, url));
  return rows[0];
}

export async function updateArtwork (id: number, data) {
  await db.update(artworks).set(data).where(eq(artworks.id, id));
}

export async function deleteArtworkById(id: number) {
  await db.delete(artworks).where(eq(artworks.id, id));
}

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}
