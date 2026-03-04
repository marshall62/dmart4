-- Setup script for test database
-- Creates all tables needed for testing API handlers

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS artwork_tag_join CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pw TEXT NOT NULL
);

-- Session table
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Artworks table
CREATE TABLE artworks (
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  midsize_image_url TEXT,
  thumbnail_image_url TEXT,
  filename TEXT,
  title TEXT NOT NULL,
  media TEXT NOT NULL,
  category_name TEXT,
  price NUMERIC(10, 2),
  width NUMERIC(10, 2),
  height NUMERIC(10, 2),
  year INTEGER,
  is_sold BOOLEAN,
  is_active BOOLEAN,
  mongo_id VARCHAR(30),
  owner VARCHAR(100)
);

-- Tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- Artwork-Tag join table
CREATE TABLE artwork_tag_join (
  artwork_id INTEGER NOT NULL REFERENCES artworks(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (artwork_id, tag_id)
);
