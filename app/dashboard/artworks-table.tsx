'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { SelectArtwork } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';

export function ArtworksTable({
  artworks,
  offset=0,
  totalProducts
}: {
    artworks: SelectArtwork[];
  offset?: number;
  totalProducts?: number;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();

  const columns: ColumnDef<SelectArtwork>[] = [
    {
      accessorKey: 'thumbnail_image_url',
      header: '',
      cell: ({ row }) => {
        const artwork = row.original;
        const editLink = "dashboard/add-artwork?id=" + artwork.id;
        return (
          <Link href={editLink}>
            <div className="relative group">
              <img
                src={row.original.thumbnail_image_url || ''}
                alt={row.original.title}
                className="w-16 h-16 object-cover rounded cursor-pointer mr-1 mb-1"
              />
              <div className="absolute left-0 top-0 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                <img
                  src={row.original.thumbnail_image_url || ''}
                  alt={row.original.title}
                  className="w-48 h-auto object-contain rounded-lg shadow-2xl border-2 border-gray-300 bg-white"
                />
              </div>
            </div>
          </Link>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Title
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'year',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Year
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('year')}</div>,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hidden md:flex"
          >
            Price
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const price = row.getValue('price') as string;
        return <div className="hidden md:table-cell">{price ? `$${price}` : ''}</div>;
      },
    },
    {
      accessorKey: 'dimensions',
      header: 'w x h',
      cell: ({ row }) => {
        const width = row.original.width;
        const height = row.original.height;
        return (
          <div className="hidden md:table-cell">
            {width && height ? `${width} x ${height}` : ''}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'media',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hidden md:flex"
          >
            Media
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => <div className="hidden md:table-cell">{row.getValue('media')}</div>,
    },
    {
      accessorKey: 'category_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Category
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('category_name')}</div>,
    },
    {
      accessorKey: 'is_active',
      header: 'Active',
      cell: ({ row }) => <div>{row.getValue('is_active') ? '✓' : '✗'}</div>,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const artwork = row.original;
        const editLink = "dashboard/add-artwork?id=" + artwork.id;
        return (
          <div className="flex gap-2">
            <Link href={editLink}>
              <Image width="25" height="25" alt="Edit" src="/icons8-pencil-50.png"/>
            </Link>
            <Link 
              href="#" 
              onClick={async (e) => {
                e.preventDefault();
                if (confirm("Are you sure?")) {
                  const response = await fetch('/api/artworks?id=' + artwork.id, {
                    method: 'DELETE',
                  });
                  if (response.ok) {
                    router.refresh();
                  } else if (response.status === 401) {
                    alert("Not authorized");
                    router.push('/login');
                  }
                }
              }}
            >
              <Image width="25" height="25" alt="Delete" src="/icons8-trash-50.png"/>
            </Link>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  const table = useReactTable({
    data: artworks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artworks</CardTitle>
        <CardDescription>
          Manage My Art
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Filter by title..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('title')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Input
              placeholder="Filter by category..."
              value={(table.getColumn('category_name')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('category_name')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <Button variant="outline" asChild>
            <Link href="dashboard/add-artwork">Add art</Link>
          </Button>
        </div>
        
        {/* Pagination controls at top */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </strong>{' '}
            of <strong>{table.getFilteredRowModel().rows.length}</strong> artworks
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </strong>{' '}
            of <strong>{table.getFilteredRowModel().rows.length}</strong> artworks
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
