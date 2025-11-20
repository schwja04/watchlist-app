export interface TMDbMovie {
    adult: boolean;
    backdrop_path: string | null;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    // type?: string; // Only present in trending, can ignore
}

export interface TMDbMovieListResponse {
    page: number;
    results: TMDbMovie[];
    total_pages: number;
    total_results: number;
}

export interface TMDbMovieDetails extends TMDbMovie {
    genres: { id: number; name: string }[];
    runtime: number;
    release_date: string;
    tagline?: string;
    homepage?: string;
}

export interface TMDbCast {
    cast_id: number;
    character: string;
    credit_id: string;
    gender: number | null;
    id: number;
    name: string;
    order: number;
    profile_path: string | null;
}

export interface TMDbCrew {
    credit_id: string;
    department: string;
    gender: number | null;
    id: number;
    job: string;
    name: string;
    profile_path: string | null;
}

export interface TMDbCredits {
    id: number;
    cast: TMDbCast[];
    crew: TMDbCrew[];
}

export interface TMDbWatchProviders {
    id: number;
    results: Record<string, {
        link: string;
        flatrate?: {
            provider_id: number;
            provider_name: string;
            logo_path: string;
        }[];
        rent?: {
            provider_id: number;
            provider_name: string;
            logo_path: string;
        }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string }[];
    }>;
}

export interface TMDbExternalIds {
    imdb_id?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
}
