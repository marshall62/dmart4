import { eq } from 'drizzle-orm';
import { db, artworks, tags, artworksToTags } from 'lib/db';
import { getTagsData } from 'lib/localdata_artworks';

export const dynamic = 'force-dynamic';


async function getWork(mongoId: string) {
    const works = await db.select().from(artworks).where(eq(artworks.mongo_id,mongoId));
    const work = works[0]
    return work.id;   
}

export async function GET() {

  let record: Record<string, string[]> = await getTagsData()
  for (const [tag, idList] of Object.entries(record)) {
    const tagIds = await db.insert(tags).values({name: tag}).returning({insertedId: tags.id}); // put tag as a row in tags table
    const tagId = tagIds[0].insertedId;
    // need ID from above row so that I can then create rows in a join table
    // that go from the ID to each id in the idList (which are ids of the artworks)
    idList.forEach(async (mongoId: string) => {
        // const artworkId = await db.query.artworks.findOne({
        //     where: eq(artworks.mongo_id, mongoId)
        //   });
        const artworkId = await getWork(mongoId);
        // console.log(`Found artwork ${artworkId} for mongoId ${mongoId}`);
        console.log(`Inserting join ${tagId} ${typeof(tagId)} ${artworkId} ${typeof(artworkId)}`);
        const rec = {tagId: tagId, artworkId:artworkId}
        console.log("record", rec);
        const res = await db.insert(artworksToTags).values(rec)

    });
    
  }

  return Response.json({
    message: ' tags are set up.' 
  });
}
