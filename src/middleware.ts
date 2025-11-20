import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
    const { isAuthenticated, sessionClaims, redirectToSignIn, } = await auth();

    if (!isAuthenticated) {
        return redirectToSignIn();
    }

    const url = req.nextUrl.pathname;
    if (url.startsWith("/api/onboarding")) {
        return NextResponse.next();
    }


    if (!sessionClaims?.onboardingComplete) {
        // Dummy call to see if we get here
        console.log("User has not completed onboarding");

        // Execute a fetch to post to the onboarding API route
        const onboardingResponse = await fetch(`${req.nextUrl.origin}/api/onboarding`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Forward the cookies for authentication
                "Cookie": req.headers.get("cookie") ?? "",
            },
        });

        const onboardingData = await onboardingResponse.json() as { success: boolean };

        if (!onboardingData.success) {
            // This is an unexpected case; not sure how to handle it yet
            // For now, just log it
            console.error("Failed to verify onboarding status");
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
