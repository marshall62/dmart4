import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?term=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <>
      <div className="w-full h-20 bg-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <ul className="hidden md:flex gap-x-6 text-black">
              <li>
                <Link href="/">
                  <p>Home</p>
                </Link>
              </li>
              <li>
                <Link href="/all-artworks">
                  <p>All Work</p>
                </Link>
              </li>
              <li>
                <Link href="/recent-artworks">
                  <p>Recent Work</p>
                </Link>
              </li>
              <li>
                <Link href="/categories">
                  <p>By Category</p>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <p>About Me</p>
                </Link>
              </li>

              
            </ul>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Search
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;