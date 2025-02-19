import { readImageFile } from '@/lib/localdata_artworks';
import { updateArtwork, getArtworkByImageUrl, SelectArtwork, getArtwork } from 'lib/db';
import { list, head, del, put, ListBlobResult, HeadBlobResult } from '@vercel/blob';

type imageSize = "large" | "midsize" | "thumbnail";
type imageField = "image_url" | "midsize_image_url" | "thumbnail_image_url";

// type BlobMetadata = {
//     size: number;
//     uploadedAt: Date;
//     pathname: string;
//     contentType: string
//     contentDisposition: string;
//     url: string;
//     downloadUrl: string;
//     cacheControl: string;
//   }

// type Blob =  {
//     size: number;
//     uploadedAt: Date;
//     pathname: string;
//     url: string;
//     downloadUrl: string;
//   }
 
export async function GET(request: Request) {
    // with a ?url parameter it will return the single blob that matches the url
    // otherwise it returns all
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const blobUrl = urlParams.get('url');
    if (blobUrl) {
        try {
            const blobDetails = await getBlob(blobUrl!);  
            return Response.json(blobDetails);
        }
        catch (Exception ) {
            return Response.json({ error: 'Not found' }, { status: 404 });
        }
    }
    const { blobs } = await getBlobs(); 
    return Response.json({count: blobs.length, blobs});
}

/* Uploads an image file to the vercel blob storage */
export async function uploadImage(filename: string, file: any) {
    const upload = await put(filename, file, {access: 'public'});
    return upload;
}

async function getBlob (url: string): Promise<HeadBlobResult> {
    const blobDetails = await head(url!);   
    return blobDetails;
}

async function getBlobs (): Promise<ListBlobResult> {
    const blobs = await list();   
    return blobs;
}

async function deleteBlob (url: string) {
    await del(url);
}


// TODO files can now be uploaded correctly from local disk using Postman app.  
// It should update the db row with the filename of the uploaded image.   
// BUT I don't want to do that just yet because those image names are already populated
// from the mongo data.  Once I have all the existing db rows populated with the image_url
// of the blob in vercel, THEN I can make new uploads set the filename value.

// TODO Do we want to see if the backend js can create the thumb and midsize from the large image?
// or continue doing 3 uploads?

// Do I want to continue using github as a repo of images? Just for master images
// Do I want to use python tools to resize images and mess with the folders ? NO
// store master images in github.  My admin tool will take an upload image and will resize it into 3 
// versions -thumb, midsize, large - and will make 3 calls to my blobs POST endpoint to create 3 blobs
// in the vercel blobs bucket.  All will have the same filename.  Each upload call will set the correct
// field in the artwork table to the blob.  Each one can set the artworks filename (all 3 will be the same
// name) .   If a subsequent request is sent to set a different image for this artwork 3 new images
// will upload and the artworks filename will be changed 3 times (all 3 the same).  In this situation,
// we'd want to purge the previous 3 from blob store based on the URLs in the artwork.  
// TODO
// The filename in the artwork is really only there so I know what filename in the github repo is associated
// with a given artwork in the db.  It doesn't really perform any other function.

//  The workflow in the dashboard is to create an artwork in two steps
//    - details such as title, size, date
//    - uploading an image (which becomes 3 uploads)
// Part of the reason for this is that its not a simple form with a file.  The file needs to be turned into
// 3 files in the browser which makes me concerned that we're not just submitting a form anymore.  So
// easy stuff can be submitted to an artworks endpoint that will create or patch it but the
// file uploads happen separately and go through this API
//  This means we can use a PATCH request for the image uploads because the artwork exists
//  and we are merely patching it with images.  In the case that there were previously existing
// images, we delete the blobs.  No need for the POST endpoint


// Story 2: Rework the PATCH endpoint so it takes a size parameter.   This will replace the blob url
// for the given size in the artwork and will delete the old blob from the blob store. Overwrite the filename
// with the filename of the upload file (This is on the assumption that 3 files are being uploaded by the 
// admin tool to patch in 3 new images all having the same filename 

// TODO Test that patch works for the initial installation of images into an artwork

// Create api method for creating a new artwork record and patching it.

// Story 3: Modify the fileupload section of the dashboard so that when a file is uploaded we create 3 variants
// of it and upload each to the backend via the PATCH  

// e.g. POST localhost:3000/api/blobs   filename: "david_marshall_2.jpg" artworkId: 7
// export async function POST(request) {
//     const form = await request.formData();
//     const file = form.get('file') as File;
//     const blobFilename = file.name; // if using some kind of client-side image resizer, it will be be a nameless blob
//     const size: imageSize = form.get('size')
//     let filename = form.get('filename') as string;
//     // prefer the explicitly provided filename if given
//     filename = filename || blobFilename;
//     const artworkId = form.get('artworkId');
//     const id = parseInt(artworkId);
//     // const data = await readImageFile(filename);
//     const blobMetadata = await uploadImage(filename, file);
//     const field = artworkImageFieldName(size);
//     await updateArtwork(id, {filename, [field]: blobMetadata.url});
//     return Response.json({
//         message: 'Image uploaded' ,
//         url:  blobMetadata.url,
//         filename
//     }, {status: 201});
// }

// Upload a new image to an existing artwork that has images set.
export async function PATCH(request) {
    const form = await request.formData();
    const file = form.get('file') as File;
    const blobFilename = file.name; // if using some kind of client-side image resizer, it will be be a nameless blob
    const size: imageSize = form.get('size')
    let filename = form.get('filename') as string;
    // prefer the explicitly provided filename if given
    filename = filename || blobFilename;
    const artworkId = form.get('artworkId');
    const id = parseInt(artworkId);
    const artwork: SelectArtwork = await getArtwork(id);
    
    const field = artworkImageFieldName(size);
    // delete the old image from the blob store so we don't have a buildup of junk
    if (artwork[field]) {
        const url: string = artwork[field] as string;
        await deleteBlob(url);
    }
    // upload the image to the blob store and update the artwork row
    const data = await readImageFile(filename);
    const blobMetadata = await uploadImage(filename, data);
    await updateArtwork(id, {filename, [field]: blobMetadata.url});
    return Response.json({
        message: 'Image uploaded' ,
        url:  blobMetadata.url,
        filename
    }, );
}

function artworkImageFieldName (size: imageSize ): keyof SelectArtwork {
    if (["midsize", "thumbnail"].includes(size)) {
        return `${size}_image_url` as imageField;
    }
    return "image_url" as imageField;
}


export async function DELETE(request: Request) {
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const all = urlParams.get('all');
    if (all) {
        const allBlobs = await getBlobs();
        console.log("Delete all is currently disabled to prevent accidents")
        // for (const blob of allBlobs['blobs']) {
        //     const url = blob.url;
        //     await deleteBlob(url);
        // }
    }
    else {
        const urlToDelete = urlParams.get('url') as string;
        await deleteBlob(urlToDelete);
        // remove the image_url from the artworks row with this url
        const artwork: SelectArtwork = await getArtworkByImageUrl(urlToDelete);  
        if (artwork) await updateArtwork(artwork.id, {image_url: null});
        return new Response();
}
  }