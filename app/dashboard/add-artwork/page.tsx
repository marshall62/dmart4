"use client"
import Form from 'next/form'
import { Jimp } from "jimp";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react'

type Artwork = {
    id?: number | null;
    title?: string | null
    year?: number | null
    width?: number | null
    height?: number | null
    media?: string | null
    category_name?: string | null
    filename?: string | null
    price?: number | null
    imageFile?: File | null
    thumbnailFile?: File | null
    midsizeFile?: File | null
}


export default function AddArtwork () {

    const [formData, setFormData] = useState<Artwork>({});
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState(null);
    const [artwork, setArtwork] = useState({id: "", title: "", year:"", price:"", width:"", height:"", media:"", category_name:"", imageFile:null, filename:""});
    const searchParams = useSearchParams();
    const id = searchParams.get('id')
    const router = useRouter();

    useEffect( () => {
        const doLoad = async () => {
           const x =  await fetch('/api/artworks?id=' + id);
           const aw = await x.json()
           for (const [k,v] of Object.entries(aw)) {
            if (v === null) {
                aw[k] = "";
            }
           }
           setArtwork(aw)
           setThumbnail(aw.thumbnail_image_url)
        }
        if (id) {
            doLoad().catch(console.log)     
        }
      }, [id])

    const navigateToServerPage = () => {
      router.push('/dashboard'); // go back to the dashboard
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        console.log(`changed ${name} to ${value}`, event.target)
        setArtwork((prevArtwork) => ({ ...prevArtwork, [name]: value}))
        //setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
      };
    
    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        const file:File = files[0] as File;
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            console.log("In the onload with e as", e);
          const data = e.target?.result;
    
          if (!data || !(data instanceof ArrayBuffer)) {
            return;
          }
    
          // Manipulate images uploaded directly from the website.
          const image = await Jimp.fromBuffer(data);
          image.resize({w: 800});
          const upload_midsize = await image.getBuffer("image/jpeg")
          image.resize({w: 150});
          const preview_thumb = await image.getBase64("image/jpeg")
          const upload_thumb = await image.getBuffer("image/jpeg")
          setThumbnail(preview_thumb);
          const imageFile = new Blob([data], { type: 'image/jpeg' });
          const thumbnailFile = new Blob([upload_thumb], { type: 'image/jpeg' })
          const midsizeFile = new Blob([upload_midsize], { type: 'image/jpeg' })
          setArtwork((prevArtwork) => ({...prevArtwork, filename: file.name, thumbnailFile, imageFile, midsizeFile}))

        };
        reader.readAsArrayBuffer(file);
        setImageFile(file);
        // setArtwork((prevArtwork) => ({...prevArtwork, imageFile: file}))
        // setThumbnail(URL.createObjectURL(file));

    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("submitting artwork", artwork);
        const fd = new FormData();
        for (let field in artwork) {
            fd.append(field, artwork[field])
        }

        if (!imageFile) {
            fd.delete('imageFile')
            fd.delete('thumbnailFile')
            fd.delete('midsizeFile')
        }

        const response = await fetch('/api/artworks', {
            method: 'POST',
            body: fd,
            });
        
        const result = await response.json();
        console.log("result is ", result);
        navigateToServerPage();
           
    };

    return (<div className="ml-4"> 
        <p className="font-bold">
            Provide details of the artwork
        </p>
        <form className="mt-6" onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={artwork['id']}/>
            <div className="mb-5">
                <label htmlFor="title"className=' bold mb-3'>Title</label>
                <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-9/12 block" 
                id="title" value={artwork['title']} name="title"  type="text" onChange={handleChange}></input>
            </div>
            <div className="flex">
                <div>
                    <div className="mb-5">
                        <label htmlFor="year"className=' bold mb-3'>Year</label>
                        <input 
                            className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" 
                            id="year" name="year" value={artwork['year']} type="text" 
                            onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="width"className=' bold mb-3'>Width</label>
                        <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" id="width" 
                        name="width" value={artwork['width']} type="text" onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="title"className=' bold mb-3'>Height</label>
                        <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" id="height" 
                        name="height" value={artwork['height']} type="text" onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="price"className=' bold mb-3'>Price</label>
                        <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" id="price" 
                        name="price" value={ artwork['price']} type="text" onChange={handleChange}></input>
                    </div>
                </div>
                <div className="ml-10">
                    <label className="block" htmlFor="fileInput">Image file</label>
                    <input id="fileInput" onChange={handleImageFileChange} value="" name="imageFile" type="file"></input>
                    {thumbnail ?
                        <div className="mt-4">{artwork.filename} <img src={thumbnail} /></div> : <div/>}
                </div>
            </div>
            <div className="flex">
                <div className="mb-5">
                    <label htmlFor="media"className=' bold mb-3'>Media</label>
                    <select name="media" className="ml-5 border border-2 border-solid" value={artwork['media']} onChange={handleChange}>
                        <option>Select One</option>
                        <option value="oil on canvas">oil on canvas</option>
                        <option value="oil on paper">oil on paper</option>
                        <option value="oil on muslin panel">oil on muslin panel</option>
                        <option value="oil on panel">oil on panel</option>
                        <option value="charcoal">charcoal</option>
                        <option value="pencil">pencil</option>
                    </select>
                </div>
                <div className="ml-5 mb-5">
                    <label htmlFor="category_name"className=' bold mb-3'>Category</label>
                    <select name="category_name" className="ml-5 border border-2 border-solid" value={artwork['category']} onChange={handleChange}> 
                        <option>Select One</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Landscape">Landscape</option>
                        <option value="Still Life">Still life</option>
                        <option value="Drawings">Drawings</option>
                        <option value="New England Patriots">New England Patriots</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-space-between">
                <button className="px-4 py-2 border border-solid border-2" onClick={navigateToServerPage} type="button">Cancel</button>
                <button className="ml-8 px-4 py-2 border border-solid border-2" type="submit">Submit</button>
            </div>
            
           
        </form>
    </div>);
}