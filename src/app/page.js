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
  const isList = blog.type == "list";
  if (isList) {
    return (
      <Card className="w-full sm:max-w-[450px]">
        <div className="flex flex-col gap-2">
          <Image
            src={blog.image}
            alt={blog.name}
            width={170}
            height={100}
            className="w-auto"
          />
          <div className="p-4 flex flex-col items-between justify-between min-h-[150px]">
            <div>
              <div className="font-bold text-[36px] cursor-pointer tracking-tighter hover:underline">
                {blog.title}
              </div>
              <div className="text-sm mt-2">{blog.excerpt?.slice(0, 70)}</div>
            </div>

            <div className="flex justify-between">
              <div className="text-sm">By: Darko Nikodinovski</div>
              <div className="text-sm">4 days ago</div>
              {/* <div className="text-sm">2 comments</div> */}
            </div>
          </div>
        </div>
      </Card>
    );
  }
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
        <div className="flex flex-col items-between justify-between min-h-[180px]">
          <div>
            <div className="font-bold text-[18px] sm:text-[24px] cursor-pointer min-h-[55px] tracking-tighter hover:underline">
              {isList ? `${blog.title}` : `5 Anime Like ${blog.anime}`}
            </div>
            <div className="text-sm mt-2">{blog.excerpt?.slice(0, 70)}...</div>
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
  const {
    homeBlogs,
    fetchBlogsHome,
    fetchMoreBlogs,
    blogsLoading,
    listsBlogs,
  } = MobxStore;
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
        {/* <h2 className="text-4xl font-bold mb-4">
            Blogs ({homeBlogs?.length})
          </h2> */}

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

        <h2 className="text-4xl font-bold mb-4 mt-8">Top Lists</h2>
        <div className="flex flex-wrap gap-4">
          {listsBlogs.map((blog) => {
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

        <h2 className="text-4xl font-bold mb-4 mt-24">
          Anime Like This Originals
        </h2>
        <div className="flex flex-wrap gap-4">
          {homeBlogs.map((blog) => {
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
