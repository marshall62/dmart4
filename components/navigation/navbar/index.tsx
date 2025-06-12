import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
            {/* Desktop Navigation */}
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
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
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
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center">
              <Button
                variant="outline"
                className="text-black border-gray-300 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {/* Hamburger Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </Button>
            </div>
            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="absolute top-20 left-0 w-full bg-gray-200 md:hidden">
                <ul className="flex flex-col items-center gap-y-4 py-4">
                  <li>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/all-artworks" onClick={() => setIsMobileMenuOpen(false)}>
                      All Work
                    </Link>
                  </li>
                  <li>
                    <Link href="/recent-artworks" onClick={() => setIsMobileMenuOpen(false)}>
                      Recent Work
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>
                      By Category
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                      About Me
                    </Link>
                  </li>
                  {/* Mobile Search Form */}
                  <form onSubmit={handleSearch} className="flex flex-col items-center gap-2">
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
                </ul>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default Navbar;