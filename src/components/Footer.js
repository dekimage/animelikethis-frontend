import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Youtube } from "lucide-react";
import logoImg from "../assets/animelogo.png";
import { Separator } from "./ui/separator";

export const Footer = () => {
  return (
    <div className="bg-foreground text-background p-2 flex justify-center items-center flex-col">
      <div className="flex justify-center items-center flex-col">
        <Link href="/" className="mt-6">
          <Image src={logoImg} width={90} height={90} alt="logo" />
        </Link>
        <div className="font-bold text-[20px] mt-4">ANIME LIKE THIS</div>
      </div>
      <div className="my-2">Copyright 2024 &copy;</div>

      <div className="my-4"></div>

      <Link href="/about" className="text-lg my-1 hover:underline">
        About us
      </Link>
      <Link href="/contact" className="text-lg my-1 hover:underline">
        Contact
      </Link>
      <Link href="/terms-of-service" className="text-lg my-1 hover:underline">
        Terms of Service
      </Link>
      <Link href="/privacy-policy" className="text-lg my-1 hover:underline">
        Privacy Policy
      </Link>

      <div className="my-4"></div>
      {/* <Link href="/ads-agreement" className="text-lg my-1 hover:underline">
        Ads Agreement
      </Link>
      <Link href="/advertise-with-us" className="text-lg my-1 hover:underline">
        Advertise with us
      </Link>
      <Link href="/our-audience" className="text-lg my-1 hover:underline">
        Our Audience
      </Link> */}

      <div className="flex gap-2 mb-4">
        <Link
          href="https://www.facebook.com/ILoveAnimeX"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook />
        </Link>
        {/* <Link
          href="https://twitter.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter />
        </Link>
        <Link
          href="https://youtube.com/yourpage"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Youtube />
        </Link> */}
      </div>
    </div>
  );
};
