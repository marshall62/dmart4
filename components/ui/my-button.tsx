
'use client'; // Mark as a client component

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const handleClick = async () => {
  alert("add artwork clicked")
  console.log("clicked ");
}

export default function MyButton({ label } : {label :string}) {
  return (
    // <button onClick={handleClick}>{label}</button>
    <Link href="/dashboard/add-artwork">Add Art</Link>
  );
}