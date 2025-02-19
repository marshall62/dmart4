import { db, artworks, tags } from 'lib/db';
import { getLocalData } from 'lib/localdata_artworks';

export const dynamic = 'force-dynamic';

async function addTestRecord() {
  let rec: any =   {
    title: "Lennart",
    year: 1993,
    width: 3,
    height: 4.92,
    media: "pencil",
    mongo_id: "62142459b05007b009f13536",
    image_url: "david_marshall_72.jpg",
    category_name: 'cat 3',
    is_active: true,
    is_sold: true,
    owner: 'me',
    price: 393.54
  };
  // rec = {media: "what the fuck", mongo_uuid: "jjj"}
  await db.insert(artworks).values(rec);
}

export async function GET() {

  // addTestRecord()
  // return Response.json({ message: "loaded"});
  let records = await getLocalData()
  let r1 = records[0]
  let title = r1.title;
  // console.log("First record is ", r1)
  records.forEach(async (r) => {
    console.log("record:", r);
    await db.insert(artworks).values(r);
    console.log("done");
  })
  const len = records.length;
  // await db.insert(artworks).values(records)
  return Response.json({
    message: ' DB is set up.' + ` ${title} ${len} records`
  });
}

