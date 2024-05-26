"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ShieldAlert } from "lucide-react";
import Image from "next/image";
import MobxStore from "@/mobx";
import Link from "next/link";

const AllBlogsPage = observer(() => {
  useEffect(() => {
    MobxStore.fetchBlogsHome();
  }, []);

  const handleShowMore = () => {
    MobxStore.fetchMoreBlogs();
  };

  console.log({ blogs: MobxStore.homeBlogs });
  return (
    <div className="p-4">
      <div>
        <div className="">
          <h2 className="text-4xl font-bold mb-4">
            Blogs ({MobxStore.homeBlogs.length})
          </h2>
        </div>
        <div className="flex flex-wrap gap-4">
          {MobxStore.homeBlogs.map((blog) => (
            <Link
              href={`/recommendation/${blog.id}`}
              key={blog.id}
              className="p-4 mb-4 border rounded-lg flex flex-col gap-3
              w-[250px]"
            >
              <div className="text-2xl font-bold">{blog.anime}</div>
              <p className="font-bold text-sm">MAL ID: {blog.malId}</p>
              <div>
                <h3 className="text-lg font-bold">Anime Details</h3>
                {blog.animeDetails ? (
                  <div>
                    <p>{blog.animeDetails.title}</p>
                    <Image
                      width={150}
                      height={200}
                      src={blog.animeDetails.main_picture.large}
                      alt={blog.animeDetails.title}
                    />
                    <p>
                      <strong>Score:</strong> {blog.animeDetails.mean}
                    </p>
                    <p>
                      <strong>Genres:</strong>{" "}
                      {blog.animeDetails.genres
                        .map((genre) => genre.name)
                        .join(", ")}
                    </p>
                  </div>
                ) : (
                  <p>No anime details available</p>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          {/* <button
            onClick={() => handleShowMore()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Show More
          </button> */}
        </div>
      </div>
    </div>
  );
});

export default AllBlogsPage;
