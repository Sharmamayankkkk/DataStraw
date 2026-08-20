CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  note_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ==============================================================================
-- NEW FEATURES & MODIFICATIONS
-- The original schema above was provided by the HR department and is kept INTACT and UNCHANGED.
-- The following ALTER TABLE statements add new columns required for the 
-- latest features (Priority, Assignee, and Pinning).
-- ==============================================================================

ALTER TABLE tickets ADD COLUMN priority text NOT NULL DEFAULT 'Low' CHECK (priority IN ('Low', 'Med', 'High', 'Urgent'));
ALTER TABLE tickets ADD COLUMN assignee text NOT NULL DEFAULT 'Unassigned';
ALTER TABLE tickets ADD COLUMN is_pinned BOOLEAN DEFAULT false;

-- ==============================================================================
-- IP address logs for login attempts attack - BRUTEFORCE PREVENTION!
-- ==============================================================================

CREATE TABLE login_attempts (
  ip_address text PRIMARY KEY,
  attempts int DEFAULT 0,
  is_banned boolean DEFAULT false,
  last_attempt_at timestamp with time zone DEFAULT now()
);

-- ==============================================================================
-- FILE ATTACHMENTS & STORAGE BUCKET
-- ==============================================================================

-- 1. Add attachment tracking columns to tables
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}';

-- 2. Create the attachments bucket with restrictions (5MB size limit, specific MIME types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments', 
  'attachments', 
  true, 
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/webp',
    'application/pdf', 
    'text/csv', 
    'text/plain', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Set up Storage Security Policies (RLS) for the attachments bucket
-- Allow anyone to read the public files
CREATE POLICY "Allow public viewing of attachments"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'attachments' );

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'attachments' );

-- Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates to attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'attachments' );

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes of attachments"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'attachments' );

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ON DATABASE TABLES
-- ==============================================================================

-- Enable RLS on all tables to lock them down from direct public API access.
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
