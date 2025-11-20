import { NextResponse } from "next/server";
import {
    getMovieDetails,
    getMovieCredits,
    getMovieExternalIds,
} from "../../../../server/externalServices/tmdb";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const movieId = Number(id);
    if (!movieId) {
        return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }
    try {
        const [details, credits, externalIds] = await Promise.all([
            getMovieDetails(movieId),
            getMovieCredits(movieId),
            getMovieExternalIds(movieId),
        ]);
        return NextResponse.json({ details, credits, externalIds });
    } catch (error) {
        void error;
        return NextResponse.json(
            { error: "Failed to fetch TMDb data" },
            { status: 500 }
        );
    }
}
