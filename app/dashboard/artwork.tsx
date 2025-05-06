import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';


export function Artwork({ artwork }: { artwork: SelectArtwork }) {

  const router = useRouter();

  const editLink = "dashboard/add-artwork?id=" + artwork.id;
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt="Artwork image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={artwork.thumbnail_image_url}
          width="64"
        />
      </TableCell>
      <TableCell className="font-medium">{artwork.title}</TableCell>
      <TableCell>
          {artwork.year}
      </TableCell>
      <TableCell className="hidden md:table-cell">{artwork.price ? `$${artwork.price}` : ''}</TableCell>
      <TableCell className="hidden md:table-cell">{artwork.width} x {artwork.height}</TableCell>
      <TableCell className="hidden md:table-cell">{artwork.media}</TableCell>
      <TableCell className="hidden md:table-cell">{artwork.category_name}</TableCell>
      <TableCell className="hidden md:table-cell">{artwork.is_active}</TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex justify-between">
          <Link href={editLink}><Image width="25" height="25" alt="Edit" src="/icons8-pencil-50.png"/></Link>
          <Link href="#" onClick={async () => {
            if (confirm("Are you sure?")) {
              const response = await fetch('/api/artworks?id=' + artwork.id, {
                method: 'DELETE',
              });
              if (response.ok) {
                router.refresh(); // current page is reloaded so that deleted item gone
              }
              else if (response.status === 401) {
                alert("Not authorized");
                router.push('/login');
              }
            }
          }
          }>
            <Image width="25" height="25" alt="Edit" src="/icons8-trash-50.png"/>
          </Link>
        </div>
      </TableCell>

    </TableRow>
  );
}
