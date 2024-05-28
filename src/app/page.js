"use client";
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ShieldAlert } from "lucide-react";
import Image from "next/image";
import MobxStore from "@/mobx";
import Link from "next/link";
import { toJS } from "mobx";
import { blogsGPT } from "./blogdata";
import { Button } from "@/components/ui/button";

const AllBlogsPage = observer(() => {
  useEffect(() => {
    MobxStore.fetchBlogsHome();
  }, []);

  const handleShowMore = () => {
    MobxStore.fetchMoreBlogs();
  };

  return (
    <div className="p-4">
      <div>
        <div className="">
          <h2 className="text-4xl font-bold mb-4">
            Blogs ({MobxStore.homeBlogs.length})
          </h2>
        </div>
        {/* <Button onClick={async () => await MobxStore.addBlogsBulk(blogsGPT)}>
          Add blogs
        </Button>
        <Button
          onClick={async () =>
            await MobxStore.findMissingMalIds().then((missingMalIds) => {
              console.log("Missing MAL IDs:", missingMalIds);
            })
          }
        >
          Find missing MAL IDs
        </Button>
        <Button
          onClick={() =>
            MobxStore.fetchAndSaveAnimeDetails([
              // "4139",
              // "41357",
              // "23390",
              // "28877",
            ])
          }
        >
          Fetch and Save Anime Details
        </Button> */}
        {/* <Button onClick={() => MobxStore.updateDocuments()}>
          Add Slugs to all blogs
        </Button> */}
        <div className="flex flex-wrap gap-4">
          {MobxStore.homeBlogs.map((blog) => {
            {
              /* console.log({ blog: toJS(blog) }); */
            }
            return (
              <Link
                href={`/${blog.slug}`}
                key={blog.id}
                className="p-4 mb-4 w-[400px] border rounded-lg flex flex-col gap-3
              w-[250px]"
              >
                {blog.animeDetails && (
                  <Image
                    width={150}
                    height={200}
                    src={blog.animeDetails.main_picture.large}
                    alt={blog.animeDetails.title}
                  />
                )}
                <div className="text-2xl font-bold hover:underline">
                  5 Anime Like {blog.anime}
                </div>
              </Link>
            );
          })}
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
