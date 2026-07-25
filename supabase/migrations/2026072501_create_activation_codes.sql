/*
  # Activation Codes Table
  Used to verify Etsy purchases and claim Tapdex cards.

  1. New Table: activation_codes
    - code (text, PK) — unique activation code (e.g. "TDX-A1B2C3")
    - etsy_order_id (text) — reference to Etsy order
    - status (text) — 'unused' | 'claimed'
    - claimed_by (uuid, FK → auth.users) — who claimed it
    - claimed_at (timestamptz)
    - card_url_id (text) — the profile card_url_id to link to, set at claim time
    - created_at (timestamptz, default now())

  2. Security (RLS)
    - SELECT: authenticated users can read unused codes (to verify)
    - UPDATE: authenticated users can claim an unused code
    - Service role: full access for admin operations
*/

CREATE TABLE IF NOT EXISTS activation_codes (
  code text PRIMARY KEY,
  etsy_order_id text,
  status text DEFAULT 'unused' CHECK (status IN ('unused', 'claimed')),
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  card_url_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read an unused code to check if it's valid
CREATE POLICY "Anyone can read unused codes"
  ON activation_codes FOR SELECT
  TO anon, authenticated
  USING (status = 'unused');

-- Authenticated users can claim an unused code
CREATE POLICY "Authenticated users can claim unused codes"
  ON activation_codes FOR UPDATE
  TO authenticated
  USING (status = 'unused')
  WITH CHECK (
    status = 'claimed'
    AND claimed_by = auth.uid()
    AND claimed_at IS NOT NULL
  );

-- Service role can insert codes (for admin/Etsy fulfillment)
-- No INSERT policy needed for regular users — admin-only via service_role

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes (status);
