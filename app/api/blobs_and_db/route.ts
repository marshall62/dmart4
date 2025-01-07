import { getArtwork, getArtworks, updateArtwork } from "@/lib/db";
import { readImageFile } from "@/lib/localdata_artworks";
import { uploadImage } from "../blobs/route";

const PATH_TO_IMAGES = "large_images/";
const PATH_TO_MIDSIZE = "midsize_images/";
const PATH_TO_THUMBNAILS = "thumbnail_images/";

async function update_artwork_and_blobs (filePath: string, filename: string, column: string, artworkId: number) {
    try {
        const image_data = await readImageFile(filePath + filename);
        console.log("Read image file ", filePath + filename)
        const blobMetadata = await uploadImage(filename, image_data);
        console.log("Created blob ", blobMetadata.url);
        await updateArtwork(artworkId, {[column]: blobMetadata.url});
        console.log("updated artwork ", artworkId)
    } catch (exc) {
        console.log(`${exc} \nSomething went wrong while processing artwork id ${artworkId} ${filePath} ${filename}`)
    }
}

export async function GET(request: Request) {
    let artworkRows = await getArtworks();
    for (const artwork of artworkRows) {
        if (artwork.filename) {
            await update_artwork_and_blobs(PATH_TO_IMAGES, artwork.filename, "image_url",artwork.id);
            await update_artwork_and_blobs(PATH_TO_MIDSIZE, artwork.filename, "midsize_image_url", artwork.id);
            await update_artwork_and_blobs(PATH_TO_THUMBNAILS,artwork.filename, "thumbnail_image_url",artwork.id);
        }
    }
    artworkRows = await getArtworks();
    return Response.json(artworkRows);
}