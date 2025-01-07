import { put } from "@vercel/blob";
import fs from 'fs';

function readImageToBuffer(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


async function uploadImage(filename:string) {
    const buffer = await readImageToBuffer('david_marshall_1.jpg');
    const upload = await put(filename, buffer, {access: 'public'});
    console.log("Upload result", upload)
}

