'use client';

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import './my-lightbox.css';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { Artwork } from "../types/artwork"; // Adjusted path to match the correct location

export default function MyLightbox ({artworks}: {artworks: Artwork[]})  {
  const router = useRouter();
//   const isMobile = useMediaQuery({ maxHeight: 600 });
  const isMobile = false; // TODO:  I need to figure out how to get the media query working.  I think

  console.log('Is this running on the client?', typeof window !== 'undefined');

  // TODO:  Currently the state var artworkIndex is off because
  // I want to use it to initialize the ImageGallery to load up the
  // at the artworkIndex instead of the default of 0.  This supports doing something
  // like reloading a page or coming to the app with a full URL including an index. The startIndex attribute
  // of ImageGallery doesn't do this as I expect.  I'd instead have to 
  // call the slideToIndex method which requires using refs according to the doc at
  // https://www.npmjs.com/package/react-image-gallery

  // const [, setArtworkId] = useState(searchParams ? 
  //   searchParams.get('artwork')
  //   : '');
  // const [artworkIndex, setArtworkIndex] = useState(searchParams.get('index') 
  //   || 0);

  const images = artworks ? 
    artworks.map(aw => {
      let z =
        {
          original: aw.image_url,
          fullscreen: aw.midsize_image_url,
          thumbnail: aw.thumbnail_image_url,
          description: `${aw.title}, ${aw.width} X ${aw.height}, ${aw.year}, ${aw.media}`
        }
      return z;

    }) :
    [];



  // When the large image changes (a slide) update the URL in the location box to have 
  // the index and the id of the artwork.  As of now, I don't use index.  The id can be used in a 
  // search lookup.  So if someone sends me a link of an artwork they like, I can grab the 
  // id from the url and put it in the search box to find the artwork.   
  const handleSlideChange = (index:number) => {
    const url = "?artwork=" + artworks[index].id.toString() + "&index=" + index;
    router.push(url);

  }

console.log("isMobile:", isMobile);

  // const isPhoneInLandscapeMode = window.matchMedia("(orientation: landscape) and (max-width: 768px)").matches;
  return(
    <>
      <ImageGallery className="image-gallery-description" showThumbnails={!isMobile} onSlide={handleSlideChange} showIndex={true} items={images}></ImageGallery>
     
    </>
  )

}

