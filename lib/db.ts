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

export async function createArtwork(artwork: any) {
  const artworkIds = await db.insert(artworks).values([artwork]).returning({insertedId: artworks.id});
  const artworkId = artworkIds[0].insertedId;
  return artworkId;
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

export async function createTag (name: string): tags {
  const tagIds = await db.insert(tags).values({name}).returning({insertedId: tags.id})
  const tagId = tagIds[0].insertedId;
  return tagId;
}

export async function deleteArtworkTags (id: number) {
  await db.delete(artworksToTags).where(eq(artworksToTags.artworkId,id));
}

export async function updateArtworkTags (artId: number, tags: string[]) {
  // currently, we delete all the tags of the artwork and then replace
  // them
  await deleteArtworkTags(artId);
  let artworkTags = [];
  for (let name of tags) {
    const existing = await getTagByName(name);
    // if theres an existing tag, use it; o/w create a new one
    if (existing) {
      artworkTags.push({artworkId:artId, tagId:existing.id})
    }
    else {
      const id = await createTag(name);
      artworkTags.push({artworkId:artId, tagId:id})
    }
  }
  console.log("Adding these tags back to artwork", artworkTags)
  if (artworkTags.length > 0) {
    await db.insert(artworksToTags).values(artworkTags)
  }
}


export async function getTagByName (name: string) {
  const tagRows = await db.select().from(tags).where(eq(tags.name, name))
  console.log("got these tag rows", tagRows);
  return (tagRows && tagRows.length > 0) ?
     tagRows[0]
     :
     null
}

export async function deleteArtworkById(id: number) {
  await db.delete(artworks).where(eq(artworks.id, id));
}

export async function getAllTags() {
  return await db.select().from(tags).orderBy(tags.id);
}

export async function getTagsForArtwork(artworkId: number) {
  const rows = await db.select()
  .from(artworksToTags)
  .leftJoin(tags, eq(artworksToTags.tagId, tags.id))
  .leftJoin(artworks, eq(artworksToTags.artworkId, artworks.id))
  .where(eq(artworks.id, artworkId))
  return rows.map(r => r.tags);

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
