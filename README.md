# VYOMA RP Website

Starter website for `vyomarp.raznar.net:25045`.

## Features
- Dark fantasy landing page
- Minecraft Java server status polling every 30 seconds
- Whitelist application form stored in SQLite
- Staff login and application review (Pending / Approved / Rejected)

## Requirements
- Node.js 20+
- A web host that supports persistent Node.js processes and persistent disk storage

## Setup
1. Upload/extract this project to a Node.js host.
2. Copy `.env.example` to `.env` and set strong secrets:
   - `SESSION_SECRET`: long random value
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD`: staff login
   - `DISCORD_INVITE`: your permanent Discord invite
3. Run `npm install`
4. Run `npm start`
5. Open your web host URL. Staff panel: `/admin`.

The Minecraft server status endpoint uses the configured host and port. If the web host cannot make outbound connections to the Minecraft port, status may show offline.

## Important limitations / next integration
- The whitelist form stores applications for staff review; it does not automatically whitelist players in Minecraft.
- Player profiles/statistics need a server-side bridge/plugin or an existing stats API. Do not expose RCON credentials in browser JavaScript.
- Before public launch, configure HTTPS, persistent storage, rate limiting, backups, and a production session store. The default in-memory session store is for a starter deployment only.
- Configure your actual Discord invite in `DISCORD_INVITE`.
