'use client';

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";
import './my-lightbox.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';
import { Artwork } from "../types/artwork"; // Adjusted path to match the correct location

export default function MyLightbox ({artworks}: {artworks: Artwork[]})  {
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  // const isMobile = false; // TODO:  I need to figure out how to get the media query working.  I think

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
      const z =
        {
          original: aw.image_url,
          fullscreen: aw.midsize_image_url,
          thumbnail: aw.thumbnail_image_url,
          description: `${aw.title}, ${aw.width} X ${aw.height}, ${aw.year}, ${aw.media}`
        }
      return z;

    }) :
    [];



  // When the large image changes (a slide) update the URL to include the artwork id and index
  // but preserve any existing search params (for example `term`). This prevents clearing the
  // current search when a thumbnail is selected.
  // Prefer window.location.search as the authoritative current query string to avoid
  // dropping params if useSearchParams is stale during an interaction like clicking
  // a thumbnail.
  const handleSlideChange = (index: number) => {
    if (!artworks || !artworks[index]) return;
    // Use window.location.search which reflects the current URL in the browser.
    const current = typeof window !== 'undefined' ? window.location.search : '';
    const params = new URLSearchParams(current.startsWith('?') ? current.substring(1) : current);
    params.set('artwork', artworks[index].id.toString());
    params.set('index', index.toString());
    router.push('?' + params.toString());
  };

console.log("isMobile:", isMobile);

  // const isPhoneInLandscapeMode = window.matchMedia("(orientation: landscape) and (max-width: 768px)").matches;
  return(
    <div className="image-gallery-description">
      <ImageGallery showThumbnails={!isMobile} onSlide={handleSlideChange} showIndex={true} items={images}></ImageGallery>
    </div>
  )

}

