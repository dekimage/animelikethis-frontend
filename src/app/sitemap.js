import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
async function fetchBlogSlugs() {
  const blogsCollectionRef = collection(db, "blogs");
  const snapshot = await getDocs(blogsCollectionRef);
  return snapshot.docs.map((doc) => ({
    url: `https://animelikethis.com/${doc.data().slug}`,
    // lastModified: doc.data().updatedAt.toDate().toISOString(),
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly",
    priority: 1,
  }));
}

export default async function sitemap() {
  const blogUrls = await fetchBlogSlugs();

  return [
    {
      url: "https://animelikethis.com",
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://animelikethis.com/about",
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://animelikethis.com/contact",
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://animelikethis.com/terms-of-service",
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://animelikethis.com/privacy-policy",
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...blogUrls, // Include dynamic blog URLs
  ];
}
