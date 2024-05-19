"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaRedo, FaStar } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { MdClose } from "react-icons/md";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { IoIosArrowBack } from "react-icons/io";
import { MdOutlineMusicNote, MdOutlineMusicOff } from "react-icons/md";

import { observer } from "mobx-react";
import MobxStore from "@/mobx";

import {
  Bookmark,
  ChevronRight,
  MessageCircle,
  Minus,
  Share,
} from "lucide-react";

import Link from "next/link";
import { anime } from "./dummyData";
import Image from "next/image";
import StarRating from "@/components/customcomponents/StarRating";
import Markdown from "react-markdown";

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

const AnimePage = observer(() => {
  const { title, id, creator, img, synopsis, date, recomendedAnimes } = anime;
  return (
    <div className="m-4 sm:mx-8">
      <section className="flex">
        <div className=" w-[750px]">
          {/* bg-red-100 */}
          <div className="text-[32px] font-bold uppercase mb-2 ">{title}</div>
          <Image src={img} alt={title} width={750} height={750} />
          <div className="flex w-full items-center p-2 text-sm gap-4 justify-between">
            <div>
              <div>
                By: <span className="italic font-bold">{creator}</span>
                <span className="ml-1">-</span>{" "}
                <span className="text-gray-400">Updated {date}</span>
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

        <div className=" w-[300px] flex justify-center p-8 pr-0">
          {/* bg-yellow-100 */}
          <div className="flex gap-1 justify-center flex-col">
            <div className="flex items-center mb-6 gap-2">
              <div className="bg-primary w-[18px] h-[18px] rounded"></div>
              <div className="font-bold text-xl">RELATED</div>
            </div>

            <div className="flex gap-2 mb-4">
              <Image
                src={img}
                alt={title}
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
                src={img}
                alt={title}
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
                src={img}
                alt={title}
                width={100}
                height={50}
                className="w-auto"
              />
              <div className="font-bold text-[16px] cursor-pointer h-[75px] tracking-tighter">
                8 Best Manga to Read If You Love Oshi no Ko
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-24 flex">
        <div className=" w-[750px]">
          {/* bg-red-100 */}
          <div>
            {recomendedAnimes.map((anime, i) => {
              return (
                <div key={i} className="">
                  <LineWithCircle number={5} />
                  <div className="text-center text-[32px] font-bold mt-10">
                    {anime.name}
                  </div>
                  <div className="my-1 text-center text-lg text-gray-500 font-bold">
                    {anime.english}
                  </div>
                  <div className="my-4">
                    <Image
                      src={anime.img}
                      alt={anime.name}
                      width={750}
                      height={750}
                    />
                  </div>
                  {/* MYANIME LIST BOX */}
                  <div className="flex border p-2 rounded flex-col">
                    <div className="flex my-2 border-b pb-2">
                      <div className="text-md font-bold mr-2">Genres:</div>
                      <div className="flex gap-2">
                        {anime.genres.map((genre, i) => {
                          return <Badge key={i}>{genre}</Badge>;
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex my-2 border-b">
                        <div className="text-md font-bold w-1/2">Type:</div>
                        <div className="text-md w-1/2 text-gray-400">
                          {anime.type}
                        </div>
                      </div>
                      <div className="flex my-2 border-b">
                        <div className="text-md font-bold w-1/2">Aired:</div>
                        <div className="text-md w-1/2 text-gray-400">
                          {anime.aired}
                        </div>
                      </div>
                      <div className="flex my-2 border-b">
                        <div className="text-md font-bold w-1/2">Studios:</div>
                        <div className="text-md w-1/2 text-gray-400">
                          {anime.studios}
                        </div>
                      </div>
                      <div className="flex my-2">
                        <div className="text-md font-bold w-1/2">
                          MyAnimeList Score:
                        </div>
                        <div className="text-md w-1/2 text-gray-400 flex items-center gap-2">
                          <StarRating score={anime.score / 2} />
                          <div className="text-md w-1/2 text-gray-400">
                            {anime.score}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SYNOPSIS */}
                  <div
                    style={{ lineHeight: "29px" }}
                    className="text-[18px] my-4"
                  >
                    {anime.synopsis.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-[2000px]  w-[300px] flex justify-center p-8 pr-0">
          {/* bg-yellow-100 */}
        </div>
      </section>
    </div>
  );
});

export default AnimePage;
