'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Artwork } from './artwork';
import { SelectArtwork } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function ArtworksTable({
  artworks,
  offset=0,
  totalProducts
}: {
    artworks: SelectArtwork[];
  offset?: number;
  totalProducts?: number;
}) {

  totalProducts = artworks.length;
  const router = useRouter();
  const artworksPerPage = 5;

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artworks</CardTitle>
        <CardDescription>
          Manage My Art
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href="dashboard/add-artwork">Add art</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="hidden md:table-cell">Price</TableHead>
              <TableHead className="hidden md:table-cell">
                w x h
              </TableHead>
              <TableHead className="hidden md:table-cell">Media</TableHead>
              <TableHead>
                Category
              </TableHead>
              <TableHead>
                Active
              </TableHead>
              <TableHead>
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks.map((artwork:SelectArtwork) => (
              <Artwork key={artwork.id} artwork={artwork} />
            ))}
          </TableBody>
        </Table>
        <div className='flex justify-end'>
          <Button variant="outline" asChild>
            <Link href="dashboard/add-artwork">Add art</Link>
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.min(offset - artworksPerPage, totalProducts) + 1}-{offset}
            </strong>{' '}
            of <strong>{totalProducts}</strong> products
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === artworksPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + artworksPerPage > totalProducts}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
