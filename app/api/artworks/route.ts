import { checkCookieHeader } from "@/lib/auth";
import { artworks, db, deleteArtworkById, deleteTagJoinsForArtwork, getActiveArtworks, getArtwork, getArtworks, 
  getArtworksAfterDate, 
  getArtworksInCategory, 
  getArtworksThatMatch, 
  getArtworksWithLabel, 
  SelectArtwork, updateArtwork, updateArtworkTags } from "@/lib/db";
import { list, head, del, put, ListBlobResult, HeadBlobResult } from '@vercel/blob';

/* Uploads an image file to the vercel blob storage */
async function uploadImage(filename: string, file: any) {
  const upload = await put(filename, file, {access: 'public', contentType: 'image/jpeg'});
  return upload;
}

function intOrNull (v:FormDataEntryValue | null): number | null {
  return typeof v === 'string' ? parseInt(v) : null;
}

function floatOrNull (v:FormDataEntryValue | null): number | null {
  return typeof v === 'string' ? parseFloat(v) : null;
}

function strOrNull (v: FormDataEntryValue | null): string | null {
  return v ? v.toString() : null;
}
function checkAndAddField(field: string, rec: any, formData:FormData) {
  if (formData.get(field)) rec[field] = formData.get(field)
}
function checkAndAddIntField(field: string, rec: any, formData:FormData) {
  if (formData.get(field)) rec[field] = intOrNull(formData.get(field))
}
function checkAndAddFloatField(field: string, rec: any, formData:FormData) {
  if (formData.get(field)) rec[field] = floatOrNull(formData.get(field))
}
function checkAndAddBooleanField(field: string, rec: any, formData:FormData) {
  if (formData.get(field)) rec[field] = formData.get(field) === 'true'
}


function formDataToPatchRecord (formData: FormData) {
  let rec: any = {};
  checkAndAddField("title", rec, formData)
  checkAndAddIntField("year", rec, formData)
  checkAndAddFloatField("width", rec, formData)
  checkAndAddFloatField("height", rec, formData)
  checkAndAddFloatField("price", rec, formData)
  checkAndAddBooleanField("is_active", rec, formData)
  checkAndAddField("filename", rec, formData)
  checkAndAddField("media", rec, formData)
  checkAndAddField("category_name", rec, formData)
  return rec;
}

function formDataTags (formData: FormData): string[] {
  return formData.getAll('tags').filter((tag) => typeof tag === 'string') as string[];
}

function formDataToRecord (formData: FormData) {
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
  const checkResult = await checkCookieHeader(request);
  if (!checkResult) {
    return Response.json({error: "Not authorized"}, {status: 401});
  }
  const form = await request.formData();
  console.log("Updating artwork with form data", form);
  const artId = parseInt(form.get('id') as string);
  console.log('id', artId);
  form.delete('id');
  const new_data = formDataToPatchRecord(form);
  const tags = formDataTags(form);
  let file = form.has('imageFile') ? form.get('imageFile') as File : null;
  const thumbnail_file = form.has('thumbnailFile') ? form.get('thumbnailFile') as File : null;
  const midsize_file = form.has('midsizeFile') ? form.get('midsizeFile') as File : null;
  // if a file is uploaded, delete the old files from the bucket and update the 
  // db with the new metadata and filename
  console.log("new_data", new_data);
  if ( new_data.filename && file && midsize_file && thumbnail_file) {
    console.log("Updating artwork with new image files", new_data.filename);
    const artwork = await getArtwork(artId);
    if (artwork.image_url) deleteBlob(artwork.image_url!);
    if (artwork.midsize_image_url) deleteBlob(artwork.midsize_image_url!);
    if (artwork.thumbnail_image_url) deleteBlob(artwork.thumbnail_image_url!);
    const large_blob = await uploadImage(new_data.filename, file)
    const mid_blob = await uploadImage(new_data.filename, midsize_file)
    const thumb_blob = await uploadImage(new_data.filename, thumbnail_file)
    new_data['image_url'] = large_blob.url;
    new_data['midsize_image_url'] = mid_blob.url;
    new_data['thumbnail_image_url'] = thumb_blob.url;
  }
  // update the artwork's given fields
  if (Object.keys(new_data).length !== 0)
    await updateArtwork(artId, new_data);
  // TODO under present implementation, this means you cant clear the tags
  // but I want to rework tag updating anyway so that it doesnt always do a full replace everytime
  // tags are sent
  if (tags.length > 0)
    await updateArtworkTags(artId, tags);
  const artwork = await getArtwork(artId);
  
  return Response.json(artwork)
}

export async function POST(request: Request) {
  const checkResult = await checkCookieHeader(request);
  if (!checkResult) {
    return Response.json({error: "Not authorized"}, {status: 401});
  }
  const form = await request.formData();
  let file = form.has('imageFile') ? form.get('imageFile') as File : null;
  const thumbnail = form.has('thumbnailFile') ? form.get('thumbnailFile') as File : null;
  const midsize = form.has('midsizeFile') ? form.get('midsizeFile') as File : null;
  let blobMetadata = null;
  if (file) {
      const imageData = await file.arrayBuffer();
      blobMetadata = await uploadImage(file.name, imageData);
  }
  let thumbnailMetadata = null;
  if (thumbnail) {
    const imageData = await thumbnail.arrayBuffer();
    thumbnailMetadata = await uploadImage(thumbnail.name, imageData);
  }

  let midsizeMetadata = null;
  if (midsize) {
    const imageData = await midsize.arrayBuffer();
    midsizeMetadata = await uploadImage(midsize.name, imageData);
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
    const tags = formDataTags(form);
    if (tags.length > 0)
      await updateArtworkTags(artworkId, tags);
    return Response.json({
      id: artworkId
    });
}

export async function GET(request: Request) {
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const id = urlParams.get('id')
    const isForRecentWork = urlParams.get('recent') === 'true';
    const isForExemplars = urlParams.get('exemplars') === 'true';
    const searchTerm = urlParams.get('search');
    const category = urlParams.get('category');
    const tag = urlParams.get('tag');
    if (id) {
        console.log("looking for artwork", id);
        const artwork = await getArtwork(parseInt(id));
        console.log("found it", artwork);
        return Response.json(artwork);
    }
    else if (searchTerm) {
      console.log("looking for artwork with search term", searchTerm);
      const artworks = await getArtworksThatMatch(searchTerm);
      console.log("found them", artworks);
      return Response.json(artworks);
    }
    else if (tag) {
      console.log("looking for artworks with tag", tag);
      const artworks = await getArtworksWithLabel(tag);
      console.log("found them", artworks);
      return Response.json(artworks);
    }
    else if (category) {
      const artworks = await getArtworksInCategory(category);
      console.log("found them", artworks);
      return Response.json(artworks);
    }
    else if (isForRecentWork) {
      const artworks = await getArtworksAfterDate(2020);
      console.log("found them", artworks);
      return Response.json(artworks);
    }
    else if (isForExemplars) {
      console.log("looking for exemplars");
      const artworks = await getArtworksWithLabel('exemplar');
      console.log("found them", artworks);
      return Response.json(artworks);
    }
    else {
        console.log("looking for all artworks");
        const artworks = await getActiveArtworks();
        console.log("found them", artworks);
        return Response.json(artworks);
    }
}

async function deleteBlob (url: string) {
  console.log("Deleting blob " + url);
  await del(url);
}

export async function DELETE(request: Request) {
  const checkResult = await checkCookieHeader(request);
  if (!checkResult) {
    return Response.json({error: "Not authorized"}, {status: 401});
  }
  const urlParams = new URLSearchParams(new URL(request.url).search);
  const artworkId = urlParams.get('id') as string;
  const id = parseInt(artworkId);
  const artwork: SelectArtwork = await getArtwork(id);
  if (artwork) {
    if (artwork.image_url) await deleteBlob(artwork.image_url);
    if (artwork.thumbnail_image_url) await deleteBlob(artwork.thumbnail_image_url);
    if (artwork.midsize_image_url) await deleteBlob(artwork.midsize_image_url);
    await deleteTagJoinsForArtwork(id);
    await deleteArtworkById(id);
    return Response.json({});
  }
}
