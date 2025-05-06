import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtworksTable } from './artworks-table';
import { getArtworks, getSession } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ArtworksPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
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
