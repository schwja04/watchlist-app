# Watchlist App
This is a simple watchlist application built with Next.js. It allows users to create and manage a list of items, currently only movies, they want to watch.

## Features
- User authentication
- Add items to the watchlist
- View the list of items in the watchlist
- Remove items from the watchlist
- Responsive design for mobile and desktop
- Persistent storage
- Webhooks for real-time updates (in development)
  - The webhooks functionality will be exist a separate service that processes and event outbox and publishes events to subscribed clients.

## Technologies Used
- *Next.js* for server-side rendering and routing
- *React* for building user interfaces
- *Tailwind CSS* for styling
- *Drizzle* for database ORM
- *PostgreSQL* for persistent storage
- *Clerk.js* for authentication
- *Vercel* for deployment

## Getting Started
### Prerequisites
- Updated Node.js (v14 or higher)
- PostgreSQL database
- TMDB API Key (for movie data)
- Clerk.js account (for authentication)

### Running the Application Locally
1. Copy the `.env.example` file to `.env` and fill in the required environment variables
2. Install dependencies using `npm install`
3. Run database migrations using `npm run db:push`
4. Start the development server using `npm run dev`
