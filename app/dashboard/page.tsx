import { File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtworksTable } from './artworks-table';
import { getArtworks } from '@/lib/db';
import Link from 'next/link';


export default async function ArtworksPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const artworks = await getArtworks();



  return (
    <div>
      <div className="flex items-center">

        <div className="ml-10 flex  gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Link href="dashboard/add-artwork">Add art</Link>

        </div>
      </div>
      <div>
        <ArtworksTable artworks={artworks}/>
      </div>
    </div>
  );
}
