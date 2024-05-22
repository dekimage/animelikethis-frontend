import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  const clientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID;

  try {
    const response = await axios.get(
      `https://api.myanimelist.net/v2/anime/${id}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,created_at,updated_at,media_type,status,genres,num_episodes,start_season,background,studios`,
      {
        headers: {
          "X-MAL-CLIENT-ID": clientId,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return NextResponse.json(
      { error: "Failed to fetch anime details" },
      { status: error.response?.status || 500 }
    );
  }
}
