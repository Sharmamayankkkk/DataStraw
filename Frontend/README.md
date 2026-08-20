# Frontend UI - Datastraw SupportDesk

This is the React frontend for the Datastraw SupportDesk application. It provides a sleek, modern, and dark-themed dashboard for managing customer support tickets, team notes, and file attachments.

## Architecture
- **Stateless Authentication**: The frontend does not utilize the Supabase JS SDK. Instead, it securely stores the backend-issued session token in standard HTML5 `localStorage` and automatically injects it into all outgoing requests via an Axios interceptor.
- **File Uploads**: The frontend securely wraps file attachments into `FormData` payloads and POSTs them to the Express Backend API for proxying. There is no direct connection between this frontend and Supabase.
- **Design System**: Built with a "premium dark mode" aesthetic using Tailwind CSS and Lucide React icons.

## Tech Stack
- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (`react-router-dom`)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **i18n**: `react-i18next`

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the `Frontend` directory to point the frontend to your local Express backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   > **Security Note:** Do not place any Supabase keys in this file. The frontend strictly uses your backend as its single source of truth.

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.
