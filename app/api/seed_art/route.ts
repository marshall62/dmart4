// import { db, artworks } from 'lib/db';
// import { getLocalData } from 'lib/localdata_artworks';

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ message: "Seed art endpoint - currently disabled" });
}

// async function addTestRecord() {
//   let rec: any =   {
//     title: "Lennart",
//     year: 1993,
//     width: 3,
//     height: 4.92,
//     media: "pencil",
//     mongo_id: "62142459b05007b009f13536",
//     image_url: "david_marshall_72.jpg",
//     category_name: 'cat 3',
//     is_active: true,
//     is_sold: true,
//     owner: 'me',
//     price: 393.54
//   };
//   // rec = {media: "what the fuck", mongo_uuid: "jjj"}
//   await db.insert(artworks).values(rec);
// }

// async function insertRecord (r: any) {
//   console.log("record:", r);
//   await db.insert(artworks).values(r);
//   console.log("done");
// }

// export async function GET() {

//   // addTestRecord()
//   // return Response.json({ message: "loaded"});
//   const records = await getLocalData()
//   const r1 = records[0]
//   const title = r1.title;

//   records.forEach(insertRecord)
//   const len = records.length;
//   // await db.insert(artworks).values(records)
//   return Response.json({
//     message: ' DB is set up.' + ` ${title} ${len} records`
//   });
// }
