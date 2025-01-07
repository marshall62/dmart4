import { artworks, db, deleteArtworkById, getArtwork, getArtworks, SelectArtwork, updateArtwork } from "@/lib/db";
import { list, head, del, put, ListBlobResult, HeadBlobResult } from '@vercel/blob';

/* Uploads an image file to the vercel blob storage */
async function uploadImage(filename: string, file: any) {
  const upload = await put(filename, file, {access: 'public'});
  return upload;
}

function intOrNull (formData, field) {
  return formData[field] ? parseInt(formData[field]) : null;
}

function floatOrNull (formData, field) {
  return formData[field] ? parseFloat(formData[field]) : null;
}

function strOrNull (formData, field) {
  return formData[field] ? formData[field] : null;
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
  let blobMetadata = null;
  if (file) {
      const imageData = await file.arrayBuffer();
      blobMetadata = await uploadImage(file.name, imageData);
      console.log("Created blob ", blobMetadata.url);
  }
  
  let rec: any =   {
      title: form.get('title'),
      year: intOrNull(form, 'year') ,
      width: intOrNull(form,'width'),
      height: intOrNull(form, 'height'),
      filename: file ? file.name : null,
      media: strOrNull(form,'media'),
      mongo_id: null,
      image_url: blobMetadata ? blobMetadata.url : null,
      category_name: strOrNull(form,'category_name'),
      is_active: true,
      is_sold: false,
      owner: 'me',
      price: floatOrNull(form, 'price') 
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
    console.log("Removing blob", artwork.image_url)
    if (artwork.image_url) await deleteBlob(artwork.image_url);
    console.log("Removing artwork record", artwork)
    deleteArtworkById(id);
    return Response.json({});
  }
}
