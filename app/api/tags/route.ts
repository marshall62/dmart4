import { getAllTags, db, getTagsForArtwork } from "@/lib/db";

export async function GET(request: Request) {
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const artId = urlParams.get('artworkId');
    if (artId) {
        console.log(`Getting tags for ${artId}`)
        const tags = await getTagsForArtwork(artId);
        const tagNames = tags.map((t) => t.name)
        console.log("Artwork tags are", tags);
        return Response.json(tagNames);
    }
    else {
        const tags = await getAllTags();
        console.log("All tags are", tags);
        const tagNames = tags.map((t) => t.name)
        return Response.json(tagNames);
    }
}
