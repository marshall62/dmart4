import { artworks, db, deleteArtworkById, getArtwork, getArtworks, SelectArtwork, updateArtwork } from "@/lib/db";
import { list, head, del, put, ListBlobResult, HeadBlobResult } from '@vercel/blob';

/* Uploads an image file to the vercel blob storage */
async function uploadImage(filename: string, file: any) {
  console.log("Uploading image " + filename)
  const upload = await put(filename, file, {access: 'public', contentType: 'image/jpeg'});
  console.log("Blob is ", upload)
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
function checkAndAddField(field: string, rec: any, formData) {
  if (formData.get(field)) rec[field] = formData.get(field)
}
function checkAndAddIntField(field: string, rec: any, formData) {
  if (formData.get(field)) rec[field] = intOrNull(formData.get(field))
}
function checkAndAddFloatField(field: string, rec: any, formData) {
  if (formData.get(field)) rec[field] = floatOrNull(formData.get(field))
}

function formDataToPatchRecord (formData) {
  let rec: any = {};
  checkAndAddField("title", rec, formData)
  checkAndAddIntField("year", rec, formData)
  checkAndAddFloatField("width", rec, formData)
  checkAndAddFloatField("height", rec, formData)
  checkAndAddFloatField("price", rec, formData)
  checkAndAddField("filename", rec, formData)
  checkAndAddField("media", rec, formData)
  checkAndAddField("category_name", rec, formData)
  return rec;
}

function formDataToRecord (formData) {
  let rec: any =   {
    title: formData.get('title'),
    year: intOrNull(formData.get('year')) ,
    width: floatOrNull(formData.get('width')),
    height: floatOrNull(formData.get('height')),
    filename: formData.get('filename') || null,
    media: strOrNull(formData.get('media')),
    mongo_id: null,
    category_name: strOrNull(formData.get('category_name')),
    is_active: true,
    is_sold: false,
    owner: 'me',
    price: floatOrNull(formData.get('price')) 
  };
  return rec;
}

export async function PATCH(request: Request) {
  const form = await request.formData();
  console.log("Form data recieved in PATCH as", form);
  const artId = parseInt(form.get('id') as string);
  form.delete('id');
  const new_data = formDataToPatchRecord(form);
  let file = form.has('imageFile') ? form.get('imageFile') as File : null;
  const thumbnail_file = form.has('thumbnailFile') ? form.get('thumbnailFile') as File : null;
  const midsize_file = form.has('midsizeFile') ? form.get('midsizeFile') as File : null;
  // if a file is uploaded, delete the old files from the bucket and update the 
  // db with the new metadata and filename
  if (new_data.filename && file && midsize_file && thumbnail_file) {
    const artwork = await getArtwork(artId);
    if (artwork.image_url) deleteBlob(artwork.image_url!);
    if (artwork.midsize_image_url) deleteBlob(artwork.midsize_image_url!);
    if (artwork.thumbnail_image_url) deleteBlob(artwork.thumbnail_image_url!);
    const large_blob = await uploadImage(new_data.filename, file)
    const mid_blob = await uploadImage(new_data.filename, midsize_file)
    const thumb_blob = await uploadImage(new_data.filename, thumbnail_file)
    // TODO This works fine:  UI resize of large and midsize is resulting in too big files
    new_data['image_url'] = large_blob.url;
    new_data['midsize_image_url'] = mid_blob.url;
    new_data['thumbnail_image_url'] = thumb_blob.url;
  }
  // update the artwork's given fields
  updateArtwork(artId, new_data);
  const artwork = await getArtwork(artId);
  return Response.json(artwork)
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
  console.log("Deleting blob " + url);
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
