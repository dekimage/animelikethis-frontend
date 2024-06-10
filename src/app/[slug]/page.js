import { notFound } from "next/navigation";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Bookmark,
  ChevronRight,
  Flame,
  MessageCircle,
  Share,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import StarRating from "@/components/customcomponents/StarRating";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { fetchBlogAndAnimeDetails } from "../functions/fetchBlogAndAndAnimeDetails";
import { BlogCard } from "../page";
import MobxStore from "@/mobx";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const blogData = await fetchBlogAndAnimeDetails(slug);

  if (!blogData) {
    return notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: `Anime Like ${blogData.anime}`,
    description: blogData.excerpt,
    image: blogData.image,
    author: {
      "@type": "Person",
      name: "Your Name",
    },
    publisher: {
      "@type": "Organization",
      name: "anime Like This",
      logo: {
        "@type": "ImageObject",
        url: "https://animelikethis.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://animelikethis.com/recommendation/${blogData.slug}`,
    },
    datePublished: blogData.createdAt
      ? blogData.createdAt?.toDate()?.toISOString()
      : "",
    dateModified: blogData.updatedAt
      ? blogData.updatedAt?.toDate()?.toISOString()
      : "",
  };

  return {
    title: `${blogData.anime} | Anime Like This`,
    description: blogData.excerpt,
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
      shortcut: "/favicon.ico",
    },
    openGraph: {
      type: "article",
      title: `Anime Like ${blogData.anime}`,
      description: blogData.excerpt,
      url: `https://animelikethis.com/${blogData.slug}`,
      images: [
        {
          url: blogData.image,
          alt: `Anime Like ${blogData.anime}`,
        },
      ],
      site_name: "Anime Like This",
    },
    twitter: {
      card: "summary_large_image",
      title: `Anime Like ${blogData.anime}`,
      description: blogData.excerpt,
      images: [
        {
          url: blogData.image,
          alt: `Anime Like ${blogData.anime}`,
        },
      ],
    },
    jsonLd: structuredData, // JSON-LD structured data
  };
}

export async function generateStaticParams() {
  const blogsCollectionRef = collection(db, "blogs");
  const snapshot = await getDocs(blogsCollectionRef);
  return snapshot.docs.map((doc) => ({
    slug: doc.data().slug,
  }));
}

export const TitleDescription = ({ title, description, seeMore, button }) => {
  return (
    <div className="flex items-center justify-between mb-4 w-full">
      <div className="space-y-1 mr-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {button && button}
      {seeMore && (
        <Link href={`/slug/${seeMore}`}>
          <div className="flex items-center cursor-pointer opacity-70 text-sm font-bold hover:border-b-2">
            See all <ChevronRight size={16} />
          </div>
        </Link>
      )}
    </div>
  );
};

const LineWithCircle = ({ number }) => {
  return (
    <div className="relative w-full flex items-center">
      <div className="absolute w-full h-[3px] bg-primary" />
      <div className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-full">
        <div className="flex text-4xl items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-lg font-bold">
          {number}
        </div>
      </div>
    </div>
  );
};

const splitByBr = (content) => {
  return content.split("<br><br>").map((chunk, index) => (
    <p key={index} className="flex mb-4">
      <span className="mr-1">{index + 1}.</span> <Markdown>{chunk}</Markdown>
    </p>
  ));
};

const BlogContent = ({ content }) => {
  return (
    <div style={{ lineHeight: "29px" }} className="text-[18px] my-6 mx-2 ml-4">
      {splitByBr(content)}
    </div>
  );
};

const AnimePage = async ({ params }) => {
  const { slug } = params;
  const blogData = await fetchBlogAndAnimeDetails(slug);

  if (!blogData) {
    notFound();
  }

  const { comparisons, name, animeDetails, anime, image, relatedBlog } =
    blogData;

  const isList = blogData?.type === "list";

  return (
    <>
      <div className="mx-2">
        <section className="mx-2 sm:mx-0 flex justify-center mt-12">
          <div className="w-full sm:w-[650px] flex flex-col justify-center items-center">
            {/* bg-red-100 */}
            <div className="text-[28px] sm:text-[44px] font-bold uppercase mb-8 text-center">
              {name}
            </div>
            <Image
              src={isList ? image : animeDetails?.main_picture?.large}
              alt={anime}
              width={400}
              height={400}
            />

            {/* <Button onClick={() => extractMalIds()}>extract ids</Button> */}
            <div className="mt-8 flex w-full items-center p-2 text-sm gap-4 justify-between">
              <div>
                <div>
                  By:{" "}
                  <span className="italic font-bold">Darko Nikodinovski</span>
                  <span className="ml-1">-</span>{" "}
                  <span className="text-gray-400">Updated 2023-06-23</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-bold gap-1 flex text-sm font-bold items-center cursor-pointer hover:text-primary">
                  <MessageCircle size={18} /> Comment
                </div>
                <div className="text-bold gap-1 flex text-sm font-bold items-center cursor-pointer hover:text-primary">
                  <Share size={18} /> Share
                </div>
                <div className="text-bold gap-1 flex text-sm font-bold items-center cursor-pointer hover:text-primary">
                  <Bookmark size={18} /> Save
                </div>
              </div>
            </div>
          </div>

          {/* <div className=" w-[300px] justify-center p-8 pr-0 hidden sm:flex">
     
            <div className="flex gap-1 justify-center flex-col">
              <div className="flex items-center mb-6 gap-2">
                <div className="bg-primary w-[18px] h-[18px] rounded"></div>
                <div className="font-bold text-xl">RELATED</div>
              </div>

              <div className="flex gap-2 mb-4">
                <Image
                  src={animeDetails?.main_picture?.medium}
                  alt={name}
                  width={100}
                  height={50}
                  className="w-auto"
                />
                <div className="font-bold text-[16px] cursor-pointer h-[75px] tracking-tighter">
                  8 Best Manga to Read If You Love Oshi no Ko
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Image
                  src={animeDetails?.main_picture?.medium}
                  alt={name}
                  width={100}
                  height={50}
                  className="w-auto"
                />
                <div className="font-bold text-[16px] cursor-pointer h-[75px] tracking-tighter">
                  8 Best Manga to Read If You Love Oshi no Ko
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Image
                  src={animeDetails?.main_picture?.medium}
                  alt={name}
                  width={100}
                  height={50}
                  className="w-auto"
                />
                <div className="font-bold text-[16px] cursor-pointer h-[75px] tracking-tighter">
                  8 Best Manga to Read If You Love Oshi no Ko
                </div>
              </div>
            </div>
          </div> */}
        </section>

        {/* <div>
        <Button onClick={() => MobxStore.fetchAnime(2904)}>FETCH API</Button>
      </div> */}
        {relatedBlog && (
          <section className="mt-24 flex justify-center w-full">
            <Link href={`/${relatedBlog.slug}`}>
              <div className="w-full rounded-lg flex sm:w-[650px] bg-gray-200 p-4 gap-4 cursor-pointer relative">
                <div className="absolute top-[-18px] left-[20px] text-[20px] font-bold tracking-widest">
                  RELATED
                </div>
                <div>
                  <Image
                    className="w-[500px]"
                    src={relatedBlog.image}
                    alt={name}
                    height={150}
                    width={250}
                  />
                </div>
                <div className="flex flex-col">
                  <div className="hover:underline text-2xl font-bold">
                    {relatedBlog.title}
                  </div>
                  <div>
                    {relatedBlog.description || relatedBlog.comparisonContent}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        <section className="mt-24 flex justify-center">
          <div className="w-full sm:w-[650px]">
            <div>
              {comparisons.map((comparison, i) => {
                const anime = comparison.animeDetails;
                const viewAll = false;

                return (
                  <div key={i} className="">
                    <LineWithCircle number={comparisons.length - i} />
                    <div className="text-center text-[32px] font-bold mt-10">
                      {anime?.name}
                    </div>
                    <div className="my-1 text-center text-4xl my-12 font-bold">
                      {anime?.title}
                    </div>
                    <div className="my-4 flex justify-center items-center">
                      <Image
                        src={anime?.main_picture?.large}
                        alt={anime?.name}
                        width={500}
                        height={500}
                      />
                    </div>
                    {/* MYANIME LIST BOX */}
                    <div className="flex border mt-12 rounded flex-col">
                      <div className="flex border-b p-2 py-4 justify-between">
                        <div className="text-md font-bold mr-2">Genres:</div>
                        <div className="flex flex-wrap gap-2">
                          {anime?.genres?.map((genre, i) => {
                            return <Badge key={i}>{genre?.name}</Badge>;
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex my-2 border-b">
                          <div className="text-md font-bold w-1/2 p-2">
                            Type:
                          </div>
                          <div className="text-md w-1/2 text-gray-400 pb-3">
                            {anime?.media_type == "tv"
                              ? "Series"
                              : anime?.media_type}
                          </div>
                        </div>
                        <div className="flex my-2 border-b">
                          <div className="text-md font-bold w-1/2 p-2">
                            Aired:
                          </div>
                          <div className="text-md w-1/2 text-gray-400 pb-3">
                            {anime?.start_date} to {anime?.end_date}
                          </div>
                        </div>
                        <div className="flex my-2 border-b">
                          <div className="text-md font-bold w-1/2 p-2 pb-3">
                            Studios:
                          </div>
                          <div className="text-md w-1/2 text-gray-400 pb-3">
                            {anime?.studios?.map((studio, i) => {
                              return <span key={i}>{studio.name}</span>;
                            })}
                          </div>
                        </div>
                        <div className="flex my-2 border-b">
                          <div className="text-md font-bold w-1/2 p-2">
                            MyAnimeList Score:
                          </div>
                          <div className="text-md w-1/2 text-gray-400 flex items-center gap-2 pb-3">
                            <StarRating score={anime?.mean / 2} />
                            <div className="text-md w-1/2 text-gray-400">
                              {anime?.mean}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex my-2">
                        <div className="text-md font-bold w-1/2 p-2">
                          Synopsis:
                        </div>
                        <div className="text-md w-1/2 text-gray-400 pb-3">
                          {anime?.synopsis
                            ?.split("\n\n")
                            .slice(0, 1)
                            .map((paragraph, index) => (
                              <p key={index} className="mb-4">
                                {paragraph.slice(0, 200) + "..."}
                              </p>
                            ))}
                        </div>
                        {viewAll && (
                          <div
                            style={{ lineHeight: "29px" }}
                            className="text-[18px] my-4"
                          >
                            {anime?.synopsis
                              ?.split("\n\n")
                              .map((paragraph, index) => (
                                <p key={index} className="mb-4">
                                  {paragraph}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {isList ? (
                      <div>
                        <BlogContent content={comparison.content} />
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-center my-12">
                          TOP 5 SIMILARITIES
                        </div>
                        <BlogContent content={comparison.similarities} />

                        <div className="text-4xl font-bold text-center my-12">
                          TOP 5 DIFFERENCES
                        </div>
                        <BlogContent content={comparison.differences} />
                      </>
                    )}

                    <div className="mb-24"></div>
                    <div className="mb-24 h-[200px] w-full border border-dashed flex justify-center items-center">
                      AD PLACEMENT SMALL
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* <div className="h-full w-full max-w-[400px] flex justify-center p-8 pr-0 bg-yellow-100 mx-8">
          
        </div> */}
        </section>
        <div className="flex flex-col gap-4 justify-center">
          {/* <div className="my-4 w-full flex gap-2 items-center">
            <Flame /> <span className="text-2xl font-bold">RECOMMENDED</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {MobxStore.listsBlogs?.map((i) => (
              <BlogCard key={i} blog={blogData} />
            ))}
          </div> */}

          <div className="my-4 w-full flex gap-2 items-center justify-center">
            <Star /> <span className="text-2xl font-bold">POPULAR</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {MobxStore.listsBlogs?.map((blog, i) => (
              <Link href={`/${blog.slug}`} key={i}>
                <BlogCard key={i} blog={blog} />
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="w-full my-12 px-4 flex justify-center items-center h-[200px] border max-w-[800px]">
            AD PLACEMENT LARGE
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimePage;

{
  /* <Head>
        <title>
          Anime Like {blogData.anime} | Recommendations and Similar Shows
        </title>
        <meta name="description" content={blogData.excerpt} />
        <meta property="og:title" content={`Anime Like ${blogData.anime}`} />
        <meta property="og:description" content={blogData.excerpt} />
        <meta property="og:image" content={blogData.image} />
        <meta
          property="og:url"
          content={`https://animelikethis.com/${blogData.slug}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Anime Like ${blogData.anime}`} />
        <meta name="twitter:description" content={blogData.excerpt} />
        <meta name="twitter:image" content={blogData.image} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`Anime Like ${blogData.anime}`} />
        <meta property="og:description" content={blogData.excerpt} />
        <meta property="og:image" content={blogData.image} />
        <meta
          property="og:url"
          content={`https://animelikethis.com/${blogData.slug}`}
        />
        <meta property="og:site_name" content="anime Like This" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head> */
}
