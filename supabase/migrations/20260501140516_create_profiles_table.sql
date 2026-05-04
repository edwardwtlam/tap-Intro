/*
  # Create profiles table for NFC Digital Business Card

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `card_url_id` (text, unique, not null) — the URL slug for the public profile (e.g., "alex-carter")
      - `name` (text, not null) — display name
      - `title` (text) — job title
      - `company` (text) — company name
      - `bio` (text) — short biography
      - `profile_image` (text) — URL to profile picture
      - `email` (text) — contact email
      - `phone` (text) — contact phone
      - `social_links` (jsonb, default '[]') — array of social link objects [{platform, url, icon}]
      - `theme` (text, default 'dark') — card theme: 'dark', 'light', or 'gradient'
      - `accent_color` (text, default '#0ea5e9') — hex accent color
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `profiles` table
    - SELECT policy: anyone (including unauthenticated) can view profiles — public profiles are meant to be shared
    - INSERT policy: authenticated users can create their own profile
    - UPDATE policy: authenticated users can update only their own profile
    - DELETE policy: authenticated users can delete only their own profile

  3. Indexes
    - Unique index on `card_url_id` for fast URL-based lookups
    - Index on `id` for auth-based lookups

  4. Important Notes
    - The `social_links` column uses JSONB for flexible storage of social link arrays
    - `card_url_id` must be unique to ensure each profile has a distinct public URL
    - Public read access is intentional — these are business cards meant to be shared
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  card_url_id text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  title text DEFAULT '',
  company text DEFAULT '',
  bio text DEFAULT '',
  profile_image text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  social_links jsonb DEFAULT '[]'::jsonb,
  theme text DEFAULT 'dark',
  accent_color text DEFAULT '#0ea5e9',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can view profiles (business cards are meant to be shared)
CREATE POLICY "Profiles are publicly viewable"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Authenticated users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Index for fast card_url_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_card_url_id ON profiles (card_url_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
