import {
    getMovieDetails,
    getMovieCredits,
    getMovieExternalIds,
} from "~/server/externalServices/tmdb";
import MovieDetailPage from "./MovieDetailPage";
import { currentUser } from "@clerk/nextjs/server";

export default async function MoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const movieId = Number(id);
    const details = await getMovieDetails(movieId);
    const credits = await getMovieCredits(movieId);
    const externalIds = await getMovieExternalIds(movieId);

    // Clerk server-side user fetch
    const user = await currentUser();
    const currentUserId = user!.privateMetadata.internalUserId;

    if (!details) {
        return (
            <div className="flex h-64 items-center justify-center">
                <span className="text-lg text-[var(--ctp-red)]">
                    Failed to load movie data
                </span>
            </div>
        );
    }

    return (
        <MovieDetailPage
            details={details}
            credits={credits}
            externalIds={externalIds}
            currentUserId={currentUserId}
        />
    );
}
