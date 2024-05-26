import axios from "axios";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase"; // Adjust the import according to your project structure
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  const clientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID;

  try {
    // Fetch blog data from Firestore
    const blogRef = doc(db, "blogs", id);
    const blogDoc = await getDoc(blogRef);

    if (!blogDoc.exists()) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const blogData = blogDoc.data();

    // Extract malIds from the blog data
    const malIds = blogData.comparisons.map((comparison) => comparison.malId);

    // Fetch anime details from MyAnimeList API
    const fetchAnimeDetails = async (malId) => {
      const response = await axios.get(
        `https://api.myanimelist.net/v2/anime/${malId}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,created_at,updated_at,media_type,status,genres,num_episodes,start_season,background,studios`,
        {
          headers: {
            "X-MAL-CLIENT-ID": clientId,
          },
        }
      );

      return response.data;
    };

    const animeDetailsPromises = malIds.map(fetchAnimeDetails);
    const animeDetails = await Promise.all(animeDetailsPromises);

    // Combine blog data and anime details
    const combinedData = {
      blog: { id: blogDoc.id, ...blogData },
      animeDetails,
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: error.response?.status || 500 }
    );
  }
}
