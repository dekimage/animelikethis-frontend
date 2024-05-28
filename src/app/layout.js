import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import ReusableLayout from "@/reusable-ui/ReusableLayout";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AdSense } from "@/components/AdSense";

const inter = Inter({ subsets: ["latin"] });

const brico = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-brico",
});

export const metadata = {
  metadataBase: new URL("https://animelikethis.com"),
  keywords: [
    "anime like",
    "similar anime",
    "anime similar to",
    "anime like this",
    "top 5 anime like",
    "anime recommendations",
    "anime suggestions",
    "anime like my hero academia",
    "anime like attack on titan",
    "anime like naruto",
    "anime like one piece",
    "anime like demon slayer",
    "anime like tokyo ghoul",
    "anime like death note",
    "anime like black clover",
    "anime like hunter x hunter",
    "anime like sword art online",
    "anime like dragon ball z",
    "anime like bleach",
    "anime like solo leveling",
  ],
  title: "Anime Like This",
  description:
    "Get personalized anime recommendations based on what you already love. Discover new and exciting anime with Anime Like This!",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Anime Like This",
    description:
      "Get personalized anime recommendations based on what you already love. Discover new and exciting anime with Anime Like This!",
    url: "https://animelikethis.com",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <AdSense pid="ca-pub-3522825392018971" />
      </head>
      <body className={brico.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <ReusableLayout>{children}</ReusableLayout>
          <Toaster />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-LLXLLMG111" />
    </html>
  );
}
