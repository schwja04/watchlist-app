"use client";
import React, { useRef, useState, useEffect } from "react";
import MovieCard from "./MovieCard";

interface Movie {
    tmdbId: number;
    posterUrl: string;
    title: string;
    watchlistId?: number;
    canEdit?: boolean;
}

interface MovieCarouselProps {
    title: string;
    movies: Movie[];
}

export default function MovieCarousel({ title, movies }: MovieCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [atStart, setAtStart] = useState(true);
    const [atEnd, setAtEnd] = useState(false);

    // Scroll by one card width
    const scrollByCard = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const card = container.querySelector(".movie-card");
        if (!card) return;
        const cardWidth = (card as HTMLElement).offsetWidth;
        container.scrollBy({
            left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, // 24px gap
            behavior: "smooth",
        });
    };

    // Update arrow visibility
    const updateArrows = () => {
        const container = scrollRef.current;
        if (!container) return;
        setAtStart(container.scrollLeft <= 0);
        setAtEnd(
            Math.ceil(container.scrollLeft + container.offsetWidth) >=
            container.scrollWidth - 1,
        );
    };

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        updateArrows();
        container.addEventListener("scroll", updateArrows);
        window.addEventListener("resize", updateArrows);
        return () => {
            container.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", updateArrows);
        };
    }, []);

    return (
        <div>
            <h2 className="mb-4 ml-6 pt-8 text-3xl font-extrabold text-[var(--ctp-lavender)] drop-shadow">
                {title}
            </h2>
            <div className="relative">
                {/* Left Arrow */}
                {!atStart && (
                    <button
                        className="bg-opacity-80 absolute top-1/2 left-2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--ctp-base)] text-3xl text-[var(--ctp-lavender)] shadow hover:bg-[var(--ctp-surface1)]"
                        style={{ pointerEvents: "auto" }}
                        onClick={() => scrollByCard("left")}
                        aria-label="Scroll left"
                    >
                        &#8592;
                    </button>
                )}
                {/* Right Arrow */}
                {!atEnd && (
                    <button
                        className="bg-opacity-80 absolute top-1/2 right-2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--ctp-base)] text-3xl text-[var(--ctp-lavender)] shadow hover:bg-[var(--ctp-surface1)]"
                        style={{ pointerEvents: "auto" }}
                        onClick={() => scrollByCard("right")}
                        aria-label="Scroll right"
                    >
                        &#8594;
                    </button>
                )}
                <div
                    ref={scrollRef}
                    className="scrollbar-hide h-80 w-full snap-x snap-proximity overflow-x-auto overflow-y-auto"
                >
                    <div className="flex h-full items-center gap-6 p-4 select-none">
                        {movies.map((movie, index) => (
                            <MovieCard
                                key={index}
                                tmdbId={movie.tmdbId}
                                posterUrl={movie.posterUrl}
                                title={movie.title}
                                watchlistId={movie.watchlistId}
                                canEdit={movie.canEdit}
                                className="movie-card"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
