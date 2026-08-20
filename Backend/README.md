# Backend API - Datastraw SupportDesk

This is the Node.js/Express backend API for the Datastraw SupportDesk application. It acts as a secure middleware and proxy between the React frontend and the Supabase Postgres database.

## Architecture & Security
- **Strict Proxy Flow**: The frontend communicates *only* with this backend. The backend securely talks to Supabase using a Service Role Key, allowing it to bypass Row Level Security (RLS) while preventing any direct public access to the database.
- **Authentication**: JWT tokens are issued upon successful login, and IP banning/rate limiting (10 attempts / 15 minutes) protects against brute force attacks. 
- **File Uploads**: Attachments are proxied through the `POST /api/upload` endpoint using `multer`, where they are buffered in memory and uploaded securely to Supabase Storage by the backend.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (`tsx` for dev environment)
- **Database Client**: `@supabase/supabase-js`
- **Security**: `express-rate-limit`, `helmet`, `cors`
- **Uploads**: `multer`

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the `Backend` directory:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   > **Note:** Do NOT use the `SUPABASE_ANON_KEY`. The Service Role Key is strictly required because the Supabase database has RLS enabled with zero public policies. Using the Anon Key will result in failed database reads/writes.

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000` and automatically reload on file changes.
