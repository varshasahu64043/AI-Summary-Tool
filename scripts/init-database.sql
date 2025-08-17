-- Initialize the database with Prisma
-- This script will be run automatically when you execute it

-- Create tables using Prisma migrate
-- Run: npx prisma migrate dev --name init

-- Seed some sample data for testing
INSERT INTO users (id, email, password, name, createdAt, updatedAt) VALUES 
('user1', 'test@example.com', '$2a$10$example.hash.here', 'Test User', datetime('now'), datetime('now'));

INSERT INTO transcripts (id, title, content, userId, createdAt, updatedAt) VALUES 
('trans1', 'Sample Meeting Notes', 'This is a sample meeting transcript for testing purposes. We discussed project timelines, budget allocations, and team responsibilities.', 'user1', datetime('now'), datetime('now'));
