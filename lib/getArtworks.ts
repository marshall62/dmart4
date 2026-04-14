import 'server-only';

import { or, eq, ilike, gte, and, desc } from 'drizzle-orm';
import { db, artworks, artworksToTags, tags, SelectArtwork } from './db';

export async function getActiveArtworks(): Promise<SelectArtwork[]> {
  return await db
    .select()
    .from(artworks)
    .where(eq(artworks.is_active, true))
    .orderBy(artworks.id);
}

export async function getArtworks(): Promise<SelectArtwork[]> {
  return await db.select().from(artworks).orderBy(artworks.id);
}

export async function getArtworksInCategory(
  category: string,
): Promise<SelectArtwork[]> {
  console.log("getting artworks in category", category);
  const rows = await db
    .select()
    .from(artworks)
    .where(
      and(eq(artworks.is_active, true), eq(artworks.category_name, category)),
    )
    .orderBy(artworks.id);
  return rows;
}

export async function getArtworksThatMatch(
  searchTerm: string,
): Promise<SelectArtwork[]> {
  const rows = await db
    .select()
    .from(artworks)
    .where(
      and(
        eq(artworks.is_active, true),
        or(
          ilike(artworks.title, `%${searchTerm}%`),
          ilike(artworks.media, `%${searchTerm}%`),
          ilike(artworks.category_name, `%${searchTerm}%`),
        ),
      ),
    )
    .orderBy(artworks.id);
  const taggedArtworks = await getArtworksWithLabel(searchTerm);
  return rows.concat(taggedArtworks);
}

export async function getArtworksAfterDate(
  year: number,
): Promise<SelectArtwork[]> {
  return await db
    .select()
    .from(artworks)
    .where(and(eq(artworks.is_active, true), gte(artworks.year, year)))
    .orderBy(desc(artworks.year));
}

export async function getArtworksWithLabel(
  label: string,
): Promise<SelectArtwork[]> {
  const rows = await db
    .select()
    .from(artworksToTags)
    .leftJoin(tags, eq(artworksToTags.tagId, tags.id))
    .leftJoin(artworks, eq(artworksToTags.artworkId, artworks.id))
    .where(and(eq(artworks.is_active, true), eq(tags.name, label)));
  if (rows) {
    return rows.map((r) => r.artworks).filter((a): a is SelectArtwork => !!a);
  } else return [];
}

export async function getArtwork(id: number): Promise<SelectArtwork> {
  const rows = await db.select().from(artworks).where(eq(artworks.id, id));
  return rows[0];
}

export async function getTagByName(name: string) {
  const tagRows = await db.select().from(tags).where(eq(tags.name, name));
  console.log("got these tag rows", tagRows);
  return tagRows && tagRows.length > 0 ? tagRows[0] : null;
}

export async function getAllTags() {
  return await db.select().from(tags).orderBy(tags.id);
}

export async function getTagsForArtwork(artworkId: number) {
  const rows = await db
    .select()
    .from(artworksToTags)
    .leftJoin(tags, eq(artworksToTags.tagId, tags.id))
    .leftJoin(artworks, eq(artworksToTags.artworkId, artworks.id))
    .where(eq(artworks.id, artworkId));
  return rows.map((r) => r.tags);
}
