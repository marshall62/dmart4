import fsPromises from 'fs/promises';
import path from 'path'

export async function getLocalData() {
  // Get the path of the json file
  const filePath = path.join(process.cwd(), 'json/artworks.json');
  // Read the json file
  const jsonData = await fsPromises.readFile(filePath);
  // Parse data as json
  const objectData = JSON.parse(jsonData);

  return objectData
}

export async function readImageFile (filename:string) {
    // Get the path of the json file
    const filePath = path.join(process.cwd(), `images/${filename}`);
    // Read the file
    const data = await fsPromises.readFile(filePath);
    return data
}

export async function getTagsData() {
  // Get the path of the json file
  const filePath = path.join(process.cwd(), 'json/tags.json');
  // Read the json file
  const jsonData = await fsPromises.readFile(filePath);
  // Parse data as json
  const objectData = JSON.parse(jsonData);

  return objectData
}