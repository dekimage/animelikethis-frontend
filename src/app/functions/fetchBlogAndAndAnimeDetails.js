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
  // console.log("Fetching blog and anime details for slug:", slug);
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

    // Collect main malId and malIds from comparisons, ensure they are valid
    if (blogData.malId) {
      malIds.add(blogData.malId.toString());
    }

    if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
      blogData.comparisons.forEach((comparison) => {
        if (comparison.malId) {
          malIds.add(comparison.malId.toString());
        }
      });
    }

    // console.log("Collected malIds:", malIds);

    // Fetch the anime details for each malId
    const animeDetailsPromises = Array.from(malIds).map(async (malId) => {
      try {
        const animeRef = doc(db, "animes", malId);
        const animeDoc = await getDoc(animeRef);
        // console.log(`Fetched anime document for malId ${malId}:`, animeDoc);

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

    // console.log("Fetched anime details array:", animeDetails);

    // Create a map of malId to animeDetails for easy lookup
    const animeDetailsMap = {};
    animeDetails.forEach((detail) => {
      animeDetailsMap[detail.id] = detail;
    });

    // console.log("Mapped anime details:", animeDetailsMap);

    // Attach anime details to main blog data
    blogData.animeDetails = animeDetailsMap[blogData.malId?.toString()];

    // Attach anime details to each comparison
    if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
      blogData.comparisons = blogData.comparisons.map((comparison) => {
        return {
          ...comparison,
          animeDetails: animeDetailsMap[comparison.malId?.toString()],
        };
      });
    }

    // console.log("Final blog data with anime details:", blogData);

    if (blogData.related) {
      try {
        const relatedBlogRef = doc(db, "blogs", blogData.related);
        const relatedBlogDoc = await getDoc(relatedBlogRef);

        if (relatedBlogDoc.exists()) {
          const relatedBlogData = relatedBlogDoc.data();
          blogData.relatedBlog = {
            slug: relatedBlogData.slug,
            image: relatedBlogData.image,
            title: relatedBlogData.title,
            description: relatedBlogData.description,
            comparisonContent:
              relatedBlogData.comparisons && relatedBlogData.comparisons[0]
                ? relatedBlogData.comparisons[0].content.slice(0, 150)
                : "",
          };
        }
      } catch (relatedBlogError) {
        console.error(
          "Error fetching related blog document:",
          relatedBlogError
        );
      }
    }

    return blogData;
  } catch (error) {
    console.error("Error fetching blog and anime details:", error);
    return null;
  }
}

//   async fetchBlogAndAnimeDetails(blogId) {
//   console.log("Fetching blog and anime details for blog ID:", blogId);
//   try {
//     // Fetch the blog document
//     const blogRef = doc(db, "blogs", blogId);
//     const blogDoc = await getDoc(blogRef);
//     console.log("Fetched blog document:", blogDoc);

//     if (!blogDoc.exists()) {
//       console.log("Blog document does not exist.");
//       return null;
//     }

//     const blogData = { id: blogDoc.id, ...blogDoc.data() };
//     const malIds = new Set();

//     // Collect main malId and malIds from comparisons
//     malIds.add(blogData.malId.toString());
//     if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
//       blogData.comparisons.forEach((comparison) => {
//         malIds.add(comparison.malId.toString());
//       });
//     }

//     console.log("Collected malIds:", malIds);

//     // Fetch the anime details for each malId
//     const animeDetailsPromises = Array.from(malIds).map(async (malId) => {
//       try {
//         const animeRef = doc(db, "animes", malId);
//         const animeDoc = await getDoc(animeRef);
//         console.log(`Fetched anime document for malId ${malId}:`, animeDoc);

//         return animeDoc.exists()
//           ? { id: animeDoc.id, ...animeDoc.data() }
//           : null;
//       } catch (animeError) {
//         console.error(
//           `Error fetching anime document for malId ${malId}:`,
//           animeError
//         );
//         return null;
//       }
//     });

//     const animeDetailsArray = await Promise.all(animeDetailsPromises);
//     const animeDetails = animeDetailsArray.filter(
//       (details) => details !== null
//     );

//     console.log("Fetched anime details array:", animeDetails);

//     // Create a map of malId to animeDetails for easy lookup
//     const animeDetailsMap = {};
//     animeDetails.forEach((detail) => {
//       animeDetailsMap[detail.id] = detail;
//     });

//     console.log("Mapped anime details:", animeDetailsMap);

//     // Attach anime details to main blog data
//     blogData.animeDetails = animeDetailsMap[blogData.malId.toString()];

//     // Attach anime details to each comparison
//     if (blogData.comparisons && Array.isArray(blogData.comparisons)) {
//       blogData.comparisons = blogData.comparisons.map((comparison) => {
//         return {
//           ...comparison,
//           animeDetails: animeDetailsMap[comparison.malId.toString()],
//         };
//       });
//     }

//     console.log("Final blog data with anime details:", blogData);
//     return blogData;
//   } catch (error) {
//     console.error("Error fetching blog and anime details:", error);
//     return null;
//   }
// }
