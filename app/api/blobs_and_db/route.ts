// import { getArtworks, updateArtwork } from "@/lib/db";
// import { readImageFile } from "@/lib/localdata_artworks";
// import { uploadImage } from "../blobs/route";

export async function GET(request: Request) {
    console.log(request);
    // let artworkRows = await getArtworks();
    // console.log("DISABLED TO PREVENT ACCIDENTS!!!!")
    // return Response.json("DISABLED TO PREVENT ACCIDENTS")
    // for (const artwork of artworkRows) {
    //     if (artwork.filename) {
    //         await update_artwork_and_blobs(PATH_TO_IMAGES, artwork.filename, "image_url",artwork.id);
    //         await update_artwork_and_blobs(PATH_TO_MIDSIZE, artwork.filename, "midsize_image_url", artwork.id);
    //         await update_artwork_and_blobs(PATH_TO_THUMBNAILS,artwork.filename, "thumbnail_image_url",artwork.id);
    //     }
    // }
    // artworkRows = await getArtworks();
    // return Response.json(artworkRows);
}