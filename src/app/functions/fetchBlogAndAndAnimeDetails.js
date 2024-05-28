import { db } from "@/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  updateDoc,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export async function fetchBlogAndAnimeDetails(slug) {
  console.log("Fetching blog and anime details for slug:", slug);
  try {
    // Fetch the blog document using the slug
    const blogsCollectionRef = collection(db, "blogs");
    const q = query(blogsCollectionRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("Blog document does not exist.");
      return null;
    }

    const blogDoc = querySnapshot.docs[0];
    const blogData = { id: blogDoc.id, ...blogDoc.data() };
    const malIds = new Set();

    // Collect main malId and malIds from comparisons
    malIds.add(blogData.malId.toString());
    if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
      blogData.comparisons.forEach((comparison) => {
        malIds.add(comparison.malId.toString());
      });
    }

    console.log("Collected malIds:", malIds);

    // Fetch the anime details for each malId
    const animeDetailsPromises = Array.from(malIds).map(async (malId) => {
      try {
        const animeRef = doc(db, "animes", malId);
        const animeDoc = await getDoc(animeRef);
        console.log(`Fetched anime document for malId ${malId}:`, animeDoc);

        return animeDoc.exists()
          ? { id: animeDoc.id, ...animeDoc.data() }
          : null;
      } catch (animeError) {
        console.error(
          `Error fetching anime document for malId ${malId}:`,
          animeError
        );
        return null;
      }
    });

    const animeDetailsArray = await Promise.all(animeDetailsPromises);
    const animeDetails = animeDetailsArray.filter(
      (details) => details !== null
    );

    console.log("Fetched anime details array:", animeDetails);

    // Create a map of malId to animeDetails for easy lookup
    const animeDetailsMap = {};
    animeDetails.forEach((detail) => {
      animeDetailsMap[detail.id] = detail;
    });

    console.log("Mapped anime details:", animeDetailsMap);

    // Attach anime details to main blog data
    blogData.animeDetails = animeDetailsMap[blogData.malId.toString()];

    // Attach anime details to each comparison
    if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
      blogData.comparisons = blogData.comparisons.map((comparison) => {
        return {
          ...comparison,
          animeDetails: animeDetailsMap[comparison.malId.toString()],
        };
      });
    }

    console.log("Final blog data with anime details:", blogData);
    return blogData;
  } catch (error) {
    console.error("Error fetching blog and anime details:", error);
    return null;
  }
}
