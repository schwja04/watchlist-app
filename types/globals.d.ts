export { }

declare global {
    interface CustomJwtSessionClaims {
        onboardingComplete?: boolean
        defaultWatchlistId: number
    }

    interface UserPublicMetadata {
        onboardingComplete?: boolean
        defaultWatchlistId: number
    }

    interface UserPrivateMetadata {
        internalUserId: number
    }
}
