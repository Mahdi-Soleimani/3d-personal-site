CREATE TABLE IF NOT EXISTS consultation_requests (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'primary_admin',
  username_hash TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Seed initial admin / admin credentials if not already present
-- Default credentials: username 'admin', password 'admin'
-- Salt: dd4042caeebc34f7e9efdf1460024119
-- Hash: 13bce811533a0f7d0e84c4538e0c16d19521c9e164c01a07b77a61d56b8ce5a6
INSERT INTO admin_credentials (id, username_hash, password_hash, salt, updated_at)
VALUES (
  'primary_admin',
  '13bce811533a0f7d0e84c4538e0c16d19521c9e164c01a07b77a61d56b8ce5a6',
  '13bce811533a0f7d0e84c4538e0c16d19521c9e164c01a07b77a61d56b8ce5a6',
  'dd4042caeebc34f7e9efdf1460024119',
  now()
)
ON CONFLICT (id) DO NOTHING;
