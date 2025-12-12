-- Migration script to add profile_picture_url column to users table
-- Run this if the column doesn't exist yet

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

