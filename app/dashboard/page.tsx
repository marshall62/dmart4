
import { ArtworksTable } from './artworks-table';
import { getArtworks, getSession } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function ArtworksPage() {
  // Check if the user is logged in
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  else {
    const artworks = await getArtworks();
    return (  
      <div>
        <div className="flex items-center">
        </div>
        <div>
          <ArtworksTable artworks={artworks}/>
        </div>
      </div>
    );
  }
}
