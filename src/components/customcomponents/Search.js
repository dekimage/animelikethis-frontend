import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";
import { Input } from "../ui/input";
import { db } from "@/firebase";
import logoImg from "../../assets/animelogo.png";
import Link from "next/link";
import { BlogCard } from "@/app/page";
import { Cross, Search, X } from "lucide-react";
import { Button } from "../ui/button";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const fetchAnimeDetails = async (malId) => {
  const animeRef = doc(db, "animes", malId.toString());
  const animeDoc = await getDoc(animeRef);
  if (animeDoc.exists()) {
    return { id: animeDoc.id, ...animeDoc.data() };
  }
  return null;
};

const searchBlogs = async (searchTerm) => {
  const titleCasedTerm = toTitleCase(searchTerm);
  const blogsCollectionRef = collection(db, "blogs");
  const q = query(
    blogsCollectionRef,
    where("anime", ">=", titleCasedTerm),
    where("anime", "<=", titleCasedTerm + "\uf8ff")
  );
  const querySnapshot = await getDocs(q);

  const results = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const blog = { id: doc.id, ...doc.data() };

      if (blog.malId) {
        const animeDetails = await fetchAnimeDetails(blog.malId);
        if (animeDetails) {
          blog.animeDetails = animeDetails;
        }
      }
      return blog;
    })
  );

  console.log(results);
  return results;
};

const AnimeSearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (term.length >= 3) {
        const searchResults = await searchBlogs(term);
        setResults(searchResults);
      }
    }, 500),
    []
  );

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  return (
    <section className="flex justify-center items-center flex-col gap-8">
      <Image src={logoImg} alt="Anime Like This" width={500} height={500} />
      <div className="text-[38px] sm:text-[60px] text-center">
        Find the next anime to watch
      </div>

      <Input
        type="text"
        placeholder="Search for anime"
        className="w-full max-w-[650px]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div>
        {searchTerm.length < 3 && searchTerm.length > 0 && (
          <div className="text-red-500">
            Type at least 3 letters to start searching...
          </div>
        )}
        {searchTerm.length > 3 && results.length == 0 && (
          <div className="text-red-500">
            No Results Found for &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
      {searchTerm.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setSearchTerm("")}
          className="mt-2"
        >
          Clear Search
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}

      <div className="flex flex-wrap gap-4">
        {results.map((blog) => {
          return (
            <Link
              href={`/${blog.slug}`}
              key={blog.id}
              className="mb-4 w-[400px]"
            >
              <BlogCard blog={blog} />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default AnimeSearchComponent;
