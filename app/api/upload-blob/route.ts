
import { readImageFile } from 'lib/localdata_artworks';

export const dynamic = 'force-dynamic';

import { put } from "@vercel/blob";


async function uploadImage(filename: string, buffer : Buffer<ArrayBufferLike>) {
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
