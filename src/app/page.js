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
import { Card } from "@/components/ui/card";

export const BlogCard = ({ blog }) => {
  return (
    <Card className="p-2 max-w-[450px]">
      <div className="flex gap-2">
        <Image
          src={
            blog.image ? blog.image : blog.animeDetails?.main_picture?.medium
          }
          alt={blog.name}
          width={100}
          height={50}
          className="w-auto"
        />
        <div className="flex flex-col items-between justify-between h-[180px]">
          <div className="font-bold text-[24px] cursor-pointer h-[75px] tracking-tighter hover:underline">
            5 Anime Like {blog.anime}
          </div>
          <div className="flex justify-between">
            <div className="text-sm">4 days ago</div>
            {/* <div className="text-sm">2 comments</div> */}
          </div>
        </div>
      </div>
    </Card>
  );
};

const AllBlogsPage = observer(() => {
  const { homeBlogs, fetchBlogsHome, fetchMoreBlogs, blogsLoading } = MobxStore;
  useEffect(() => {
    if (!homeBlogs || homeBlogs.length === 0) {
      fetchBlogsHome();
    }
  }, []);

  const handleShowMore = () => {
    fetchMoreBlogs();
  };

  return (
    <div className="p-4">
      <div>
        <div className="">
          <h2 className="text-4xl font-bold mb-4">
            Blogs ({homeBlogs?.length})
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
       */}
        {/* <Button onClick={() => MobxStore.updateDocuments()}>
          Add Slugs to all blogs
        </Button> */}

        {/* <Button
          onClick={() =>
            MobxStore.fetchAndSaveAnimeDetails([
              // "4139",
              // "41357",
              "23390",
              "28877",
            ])
          }
        >
          Fetch and Save Anime Details
        </Button> */}
        <div className="flex flex-wrap gap-4">
          {homeBlogs.map((blog) => {
            return (
              <Link
                href={`/${blog.slug}`}
                key={blog.id}
                className="mb-4 w-[400px]"
              >
                <BlogCard blog={blog} />
                {/* {blog.animeDetails && (
                  <Image
                    width={150}
                    height={200}
                    src={blog.animeDetails?.main_picture?.large}
                    alt={blog.animeDetails?.title}
                  />
                )}
                <div className="text-2xl font-bold hover:underline">
                  5 Anime Like {blog.anime}
                </div> */}
              </Link>
            );
          })}
        </div>
        <div className="mt-4 w-full flex justify-center items-center">
          <Button
            onClick={() => handleShowMore()}
            loading={blogsLoading}
            className="py-8 max-w-[500px] w-full"
          >
            Show More
          </Button>
        </div>
      </div>
    </div>
  );
});

export default AllBlogsPage;
