-- Upflow database schema (PostgreSQL)
-- This mirrors the SQLAlchemy models in backend/app/models.py.
-- Run with: psql -U upflow -d upflow -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE visibility_enum AS ENUM ('private', 'public');
CREATE TYPE access_role_enum AS ENUM ('owner', 'editor', 'viewer');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'login',
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE trusted_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    label VARCHAR(120),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    last_used_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    content BYTEA NOT NULL,
    content_size INTEGER NOT NULL DEFAULT 0,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    visibility visibility_enum NOT NULL DEFAULT 'private',
    is_scanned_safe BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE file_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    role access_role_enum NOT NULL DEFAULT 'viewer',
    invited_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE upload_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    detail TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_files_slug ON files(slug);
CREATE INDEX idx_folders_owner ON folders(owner_id);
CREATE INDEX idx_file_access_file ON file_access(file_id);
CREATE INDEX idx_upload_logs_user ON upload_logs(user_id);
CREATE INDEX idx_verification_codes_user ON verification_codes(user_id);
CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id);