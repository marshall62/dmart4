import fsPromises from 'fs/promises';
import path from 'path'

export async function getLocalData(): Promise<{
  title: string,
  media: string,
  price: number,
  tags: string[],
  height: number,
  width: number,
  year: number,
  mongo_id: string,
  image_url: string,
  category_name: string,
  is_active: boolean,
}[]> {
  // Get the path of the json file
  const filePath = path.join(process.cwd(), 'json/artworks.json');
  // Read the json file
  const jsonData = await fsPromises.readFile(filePath);
  // Parse data as json
  const objectData = JSON.parse(jsonData.toString());

  return objectData
}

export async function readImageFile (filename:string) {
    // Get the path of the json file
    const filePath = path.join(process.cwd(), `images/${filename}`);
    // Read the file
    const data = await fsPromises.readFile(filePath);
    return data
}

export async function getTagsData(): Promise<{a:string}> {
  // Get the path of the json file
  const filePath = path.join(process.cwd(), 'json/tags.json');
  // Read the json file
  const jsonData = await fsPromises.readFile(filePath);
  // Parse data as json
  const objectData = JSON.parse(jsonData.toString());

  return objectData
}