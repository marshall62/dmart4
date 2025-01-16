import { artworks, db, deleteArtworkById, getArtwork, getArtworks, SelectArtwork, updateArtwork } from "@/lib/db";
import { list, head, del, put, ListBlobResult, HeadBlobResult } from '@vercel/blob';

/* Uploads an image file to the vercel blob storage */
async function uploadImage(filename: string, file: any) {
  const upload = await put(filename, file, {access: 'public', contentType: 'image/jpeg'});
  return upload;
}

function intOrNull (v:FormDataEntryValue | null): number | null {
  return v ? parseInt(v) : null;
}

function floatOrNull (v:FormDataEntryValue | null): number | null {
  return v ? parseFloat(v) : null;
}

function strOrNull (v: FormDataEntryValue | null): string | null {
  return v ? v.toString() : null;
}

export async function POST(request: Request) {
  const form = await request.formData();
  console.log("Form data recieved in POST as", form);
  const artId = form.get('id');
  if (artId) {
    console.log("updating artwork not yet allowed", artId);
    return Response.json({
      id: artId
    });
  }
  let file = form.has('imageFile') ? form.get('imageFile') as File : null;
  const thumbnail = form.has('thumbnailFile') ? form.get('thumbnailFile') as File : null;
  const midsize = form.has('midsizeFile') ? form.get('midsizeFile') as File : null;
  let blobMetadata = null;
  if (file) {
      console.log("File is ", file);
      const imageData = await file.arrayBuffer();
      blobMetadata = await uploadImage(file.name, imageData);
      console.log("Created blob ", blobMetadata.url);
  }
  let thumbnailMetadata = null;
  if (thumbnail) {
    const imageData = await thumbnail.arrayBuffer();
    thumbnailMetadata = await uploadImage(thumbnail.name, imageData);
      console.log("Created thumbnail blob ", thumbnailMetadata.url);
  }

  let midsizeMetadata = null;
  if (midsize) {
    const imageData = await midsize.arrayBuffer();
    midsizeMetadata = await uploadImage(midsize.name, imageData);
      console.log("Created midsize blob ", midsizeMetadata.url);
  }
  
  let rec: any =   {
      title: form.get('title'),
      year: intOrNull(form.get('year')) ,
      width: floatOrNull(form.get('width')),
      height: floatOrNull(form.get('height')),
      filename: form.get('filename') || null,
      media: strOrNull(form.get('media')),
      mongo_id: null,
      image_url: blobMetadata ? blobMetadata.url : null,
      midsize_image_url: midsizeMetadata ? midsizeMetadata.url : null,
      thumbnail_image_url: thumbnailMetadata ? thumbnailMetadata.url : null,
      category_name: strOrNull(form.get('category_name')),
      is_active: true,
      is_sold: false,
      owner: 'me',
      price: floatOrNull(form.get('price')) 
    };
    console.log("Adding record to db ", rec);
    const artworkIds = await db.insert(artworks).values([rec]).returning({insertedId: artworks.id});
    const artworkId = artworkIds[0].insertedId;
    return Response.json({
      id: artworkId
    });
}

export async function GET(request: Request) {
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const id = urlParams.get('id')
    if (id) {
        console.log("looking for artwork", id);
        const artwork = await getArtwork(parseInt(id));
        console.log("found it", artwork);
        return Response.json(artwork);
    }
}

async function deleteBlob (url: string) {
  await del(url);
}

export async function DELETE(request: Request) {
  const urlParams = new URLSearchParams(new URL(request.url).search);
  const artworkId = urlParams.get('id') as string;
  const id = parseInt(artworkId);
  const artwork: SelectArtwork = await getArtwork(id);
  if (artwork) {
    console.log(`Removing image urls \n${artwork.image_url} \n${artwork.thumbnail_image_url} \n${artwork.midsize_image_url}` )
    if (artwork.image_url) await deleteBlob(artwork.image_url);
    if (artwork.thumbnail_image_url) await deleteBlob(artwork.thumbnail_image_url);
    if (artwork.midsize_image_url) await deleteBlob(artwork.midsize_image_url);

    console.log("Removing artwork record", artwork)
    deleteArtworkById(id);
    return Response.json({});
  }
}
