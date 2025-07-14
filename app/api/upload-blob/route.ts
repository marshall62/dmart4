
import { db, artworks, tags, artworksToTags } from 'lib/db';
import { getTagsData, readImageFile } from 'lib/localdata_artworks';

export const dynamic = 'force-dynamic';

import { put } from "@vercel/blob";
import fs from 'fs';

function readImageToBuffer(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


async function uploadImage(filename: string, buffer :any) {
    // const buffer = await readImageToBuffer('david_marshall_1.jpg');
    const upload = await put(filename, buffer, {access: 'public'});
    console.log("Upload result", upload);
    return upload;
}



// use localhost:3000/api/upload_images to run this

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') as string;
    // const filename = "david_marshall_1.jpg";
    const data = await readImageFile(filename);
    const blobMetadata = await uploadImage(filename, data);
    return Response.json({
        message: ' maybe it got uploaded' ,
        url:  blobMetadata.downloadUrl,
        theurl: blobMetadata.url,
        filename: blobMetadata.pathname
    });
}
