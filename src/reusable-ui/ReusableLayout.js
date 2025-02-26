"use client";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Image from "next/image";
import logoImg from "../assets/animelogo.png";
import MobileHeader from "./MobileHeader";
import { ModeToggle } from "@/components/ui/themeButton";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const defaultLayout = [20, 80];

const ReusableLayout = ({ children }) => {
  return (
    <div>
      <div className="hidden sm:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full  items-stretch"
        >
          <ResizablePanel
            className="border-l border-gray-[#e5e7eb]"
            defaultSize={defaultLayout[1]}
            minSize={30}
            style={{ overflow: "auto" }}
          >
            <div>
              <div className="w-full h-[100px] flex justify-center items-center border-b  gap-4">
                {/* <Input
                  // type="search"
                  placeholder="Search..."
                  className="md:w-[100px] lg:w-[300px]"
                  icon={<Search size={16} />}
                /> */}
                <Link href="/">
                  <Image src={logoImg} width={90} height={90} alt="logo" />
                </Link>
                <div className="font-bold text-[40px]">ANIME LIKE THIS</div>
                <ModeToggle />

                {/* {user ? (
                  <>
                    <ModeToggle />
                    <UserNav user={user} logout={logout} />
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button>Create Free Account</Button>
                    </Link>
                  </div>
                )} */}
              </div>
              <div className="">{children}</div>
              <Footer />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="block sm:hidden">
        <MobileHeader />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default ReusableLayout;
