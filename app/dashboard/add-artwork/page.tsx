"use client"
import { Jimp } from "jimp";
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import { SelectArtwork } from '@/lib/db';


export default function AddArtwork () {

    const formDataRef = useRef<FormData>(new FormData());
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [artwork, setArtwork] = useState<SelectArtwork | null>(null);
    const searchParams = useSearchParams();
    const id = searchParams.get('id')
    const router = useRouter();
    const [, setSelectedTags] = useState<string[]>([])
    const [tags, setTags] = useState<string>()
    const [, setIsActive] = useState<boolean>(true);
    const [, setSuggestedTags] = useState([])


    useEffect( () => {
        const doLoad = async () => {
            const x =  await fetch('/api/tags');
            const tags = await x.json()
            // console.log("Got tese tags", tags)
            setSuggestedTags(tags);
            const y =  await fetch('/api/tags?artworkId=' + id);
            const artworkTags = await y.json()
            setSelectedTags(artworkTags);
            let tagsCsv = "";
            if (artworkTags) {
                artworkTags.forEach((t:string) => {
                    tagsCsv += t + ",";
                });
                setTags(tagsCsv.slice(0,-1));
            }
        }
        if (id) {
            doLoad().catch(console.log);
        }
    }, [id])

    useEffect( () => {
        const doLoad = async () => {
           const x =  await fetch('/api/artworks?id=' + id);
           const aw: SelectArtwork = await x.json()
           setArtwork(aw);
           setIsActive(aw.is_active ?? true);
           setSelectedTags([])
           setThumbnail(aw.midsize_image_url ?? aw.thumbnail_image_url)
        }
        if (id) {
            doLoad().catch(console.log)     
        }
      }, [id])

    const navigateToServerPage = () => {
      router.push('/dashboard'); // go back to the dashboard
    };

    const navigateToLoginPage = () => {
        router.push('/login'); // go back to the dashboard
    };


    type HandleChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

    const handleChange = (event: HandleChangeEvent): void => {
        const { name, value } = event.target;
        setArtwork((prevArtwork) => ({ 
            ...prevArtwork, 
            [name]: value 
        } as SelectArtwork));
        formDataRef.current.set(name, value);
    };

    
    const handleAddTag = (event: React.FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        const tagsCsv: string = event.currentTarget.value;
        setTags(tagsCsv)
        // setSelectedTags([...selectedTags, event.target.value])
    }
    
    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        const file = files ? files[0] : null;
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
          const data = e.target?.result;
    
          if (!data || !(data instanceof ArrayBuffer)) {
            return;
          }
    
          // create 3 resized images off the original data
          const image1 = await Jimp.fromBuffer(data);
          const image2 = await Jimp.fromBuffer(data);
          const image3 = await Jimp.fromBuffer(data);
          const resized_large_image_buf = await image1
            .resize({w: Math.min(image1.width, 1500)})
            .getBuffer('image/jpeg', { quality: 70 })
          const resized_mid_image_buf = await image2
            .resize({w: 800})
            .getBuffer('image/jpeg', { quality: 70 });
          image3.resize({w: 150});
          const preview_thumb = await image3.getBase64("image/jpeg")
          const upload_thumb = await image3.getBuffer("image/jpeg", {quality: 50})
          setThumbnail(preview_thumb);
          const largeImageFile = new Blob([resized_large_image_buf], { type: 'image/jpeg' });
          const thumbnailFile = new Blob([upload_thumb], { type: 'image/jpeg' })
          const midsizeFile = new Blob([resized_mid_image_buf], { type: 'image/jpeg' })
          if (artwork) {
            setArtwork((prevArtwork) => ({...prevArtwork!, filename: file!.name}));
            // When a file is selected clear the URLs so they
            // dont continue to show the old artwork's URLs
            artwork.image_url = '';
            artwork.midsize_image_url = '';
            artwork.thumbnail_image_url = '';
          }

          formDataRef.current.set('filename', file.name)
          formDataRef.current.set('imageFile', largeImageFile)
          formDataRef.current.set('thumbnailFile',thumbnailFile)
          formDataRef.current.set('midsizeFile', midsizeFile)
        }
        reader.readAsArrayBuffer(file);
        setImageFile(file);
    }

    const createArtwork = async (): Promise<Response> => {
        
        const tags = tagsToList()
        tags.forEach(tag => formDataRef.current.append('tags', tag));

        const response = await fetch('/api/artworks', {
            method: 'POST',
            body: formDataRef.current,
            }); 
        return response;
    }

    const updateArtwork = async (): Promise<Response> => {
        const taglist = tagsToList()
        taglist.forEach(tag => formDataRef.current.append('tags', tag));
        formDataRef.current.append('id', `${artwork!.id}`);
        console.log("Patch data is ", formDataRef.current.get('is_active'))
        const response = await fetch('/api/artworks', {
            method: 'PATCH',
            body: formDataRef.current,
            });
        return response;
    }

    const tagsToList = () => {
        let selected = tags ? tags.split(',') : []
        selected = selected.map(x => x.trim())
        setSelectedTags(selected)
        return selected;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let response;
        if (!artwork?.id) {
            response = await createArtwork();
        }
        else {
            response = await updateArtwork();
        }
        await response.json();
        if (response.status == 200) {
            navigateToServerPage();
        }
        else if (response.status == 401) {
            navigateToLoginPage()
        }
           
    };

    // toggle the is_active value based on the artwork or else the formDataRef
    const updateIsActive = () => {
        let curValue = artwork && artwork.is_active;
        if (formDataRef.current.has('is_active')) {   
            curValue = formDataRef.current.get('is_active') === 'true';
        }
        setIsActive(!curValue);
        formDataRef.current.set('is_active', `${!curValue}`);
    }

    function checkActive(): boolean {
        let res = false;
        if (formDataRef.current.has('is_active')) {
            res = formDataRef.current.get('is_active') === 'true';
        }
        else if (artwork ) {
            res = artwork.is_active ?? false;
        }
        else res = true;
        return res;
    }


    return (<div className="ml-4"> 
        <p className="font-bold">
            Provide details of the artwork
        </p>
        <form className="mt-6" onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={artwork?.id ?? undefined}/>
            <div className="mb-5">
                <label htmlFor="title"className=' bold mb-3'>Title</label>
                <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-9/12 block" 
                id="title" value={artwork?.title ?? ''} name="title"  type="text" onChange={handleChange}></input>
            </div>
            
            <div className="flex">
                <div>
                    <div className="mb-5">
                        <label htmlFor="year"className=' bold mb-3'>Year</label>
                        <input 
                            className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" 
                            id="year" name="year" value={artwork?.year ?? ''} type="text" 
                            onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="width"className=' bold mb-3'>Width</label>
                        <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" id="width" 
                        name="width" value={artwork?.width ?? ''} type="text" onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="title"className=' bold mb-3'>Height</label>
                        <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" id="height" 
                        name="height" value={artwork?.height ?? ''} type="text" onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="price"className=' bold mb-3'>Price</label>
                        <input className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" id="price" 
                        name="price" value={ artwork?.price ?? ''} type="text" onChange={handleChange}></input>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="active"className=' bold mb-3'>Active</label>
                        <input className="form-checkbox h-5 w-5 ml-2 text-blue-600 transition duration-150 ease-in-out" id="active" 
                            name="is_active" type="checkbox" checked={checkActive()}
                            onChange={updateIsActive}>
                        </input>
                    </div>
                    
                </div>
                <div className="ml-10">
                    <label className="block" htmlFor="fileInput">Image file</label>
                    <input id="fileInput" onChange={handleImageFileChange} value="" name="imageFile" type="file"></input>
                    {thumbnail ?
                        <div className="mt-4">{imageFile ? imageFile.name : artwork!.filename} 
                        <img alt="thumbnail" src={thumbnail} className="w-[600px] h-auto object-contain" /></div> : <div/>}
                </div>
                {artwork &&
                    <div className="ml-4">
                        <label htmlFor="urls"className=' bold mb-3'>URLs</label>
                        <div id="urls">
                            <span><b>Large Image:</b> 
                            <a target="_blank" href={artwork.image_url ?? ''} 
                            className="underline text-blue-600 text-sm hover:text-blue-800 visited:text-purple-600">
                                {artwork?.image_url ?? ''}
                            </a></span>
                        </div>
                        <div className="mt-2">
                            <span><b>Midsize Image:</b> 
                            <a target="_blank" href={artwork.midsize_image_url ?? ''} 
                            className="underline text-blue-600 text-sm hover:text-blue-800 visited:text-purple-600">
                            {artwork.midsize_image_url ?? ''}</a></span>
                        </div>
                        <div className="mt-2">
                            <span><b>Thumbnail Image:</b> 
                            <a target="_blank" href={artwork.thumbnail_image_url ?? ''} 
                            className="underline text-blue-600 text-sm hover:text-blue-800 visited:text-purple-600">
                            {artwork.thumbnail_image_url}</a></span>
                        </div>
                    </div>
                }
            </div>
            <div className="flex mt-2">
            
                <div className="mb-5">
                    <label htmlFor="media"className=' bold mb-3'>Media</label>
                    <select name="media" className="ml-5 border border-2 border-solid" value={artwork?.media ?? ''} onChange={handleChange}>
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
                    <label htmlFor="category_name" className=' bold mb-3'>Category</label>
                    <select name="category_name" className="ml-5 border border-2 border-solid" value={artwork?.category_name ?? ''} onChange={handleChange}> 
                        <option>Select One</option>
                        <option value="Portrait">Portrait</option>
                        <option value="Landscape">Landscape</option>
                        <option value="Still Life">Still life</option>
                        <option value="Drawings">Drawings</option>
                        <option value="New England Patriots">New England Patriots</option>
                        <option>Other</option>
                    </select>
                </div>
                {/* className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-half block" */}

                
            </div>
            <div className="mb-5">
                <label htmlFor="tags" className="bold mb-3bold mb-3">Tags</label>
                <input id="tags" className="rounded border-solid border border-gray-800 shadow-lg px-5 py-2 w-9/12 block"
                            type="text" onInput={handleAddTag} value={tags}></input>
            </div>

            <div className="flex justify-space-between">
                <button className="px-4 py-2 border border-solid border-2" onClick={navigateToServerPage} type="button">Cancel</button>
                <button className="ml-8 px-4 py-2 border border-solid border-2" type="submit">Submit</button>
            </div>
            
           
        </form>
    </div>);


}