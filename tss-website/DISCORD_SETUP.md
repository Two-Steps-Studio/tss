# Discord Integration Setup Guide

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/integrations/discord/callback
```

## Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to "OAuth2" → "General"
4. Copy "Client ID" to `DISCORD_CLIENT_ID`
5. Copy "Client Secret" to `DISCORD_CLIENT_SECRET`
6. Add redirect URI: `http://localhost:3000/api/integrations/discord/callback`
7. For production, add your production redirect URI
8. Enable required scopes: `identify`, `email`

## Database Setup

Run the migration script in Supabase SQL Editor:

```sql
-- src/db/user-integrations-schema.sql
```

This creates the `user_integrations` table with proper RLS policies.

## API Endpoints

### GET /api/integrations
Fetch all integrations for current user

### GET /api/integrations/discord/connect
Initiate Discord OAuth flow
- Returns Discord authorization URL
- Checks if Discord is already connected

### GET /api/integrations/discord/callback
Handle Discord OAuth callback
- Exchanges code for access token
- Fetches Discord user data
- Creates or updates integration
- Prevents duplicate Discord connections

### POST /api/integrations/discord/disconnect
Disconnect Discord account
- Removes integration from database

### POST /api/integrations/discord/sync
Sync Discord data
- Fetches fresh Discord user data
- Updates integration with latest info

## Security Features

- RLS policies ensure users can only access their own integrations
- Duplicate Discord account prevention
- OAuth state verification
- Token expiration handling
- Proper error handling and user feedback

## Testing

1. Start development server
2. Go to `/ustawienia`
3. Click "Połącz Discord"
4. Authorize Discord app
5. Verify connection in settings
6. Test sync and disconnect functions
