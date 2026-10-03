# Fair-Gambling

A Node.js Express game with a WebSocket endpoint.

## Run locally

```powershell
npm install
npm start
```

Open `http://localhost:3001`.

## Deploy to Vercel

Import the GitHub repository into Vercel and use the **Other** framework preset with the repository root as the project root. No build command is needed. The page is served from `public/`, and the WebSocket function is available at `/api/ws`.

WebSocket support on Vercel Functions is currently in public beta. Player state is held in memory, so it is not guaranteed to survive function restarts or reconnecting to a different instance.
