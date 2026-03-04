-- Seed data for test database
-- Provides sample artworks, tags, and relationships for testing

-- Insert test user (password hash is for 'testpassword')
INSERT INTO users (id, pw) VALUES 
  (1, '$2b$10$rKZWvFkZvFQxQxQxQxQxQeO9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z');

-- Insert sample artworks
INSERT INTO artworks (id, title, media, category_name, year, width, height, price, is_active, is_sold, owner, filename, image_url, midsize_image_url, thumbnail_image_url) VALUES
  (1, 'Sunset Over Mountains', 'oil on canvas', 'Landscape', 2023, 24.0, 18.0, 500.00, true, false, 'me', 'sunset_mountains.jpg', 'https://example.com/sunset_mountains.jpg', 'https://example.com/sunset_mountains_mid.jpg', 'https://example.com/sunset_mountains_thumb.jpg'),
  (2, 'Abstract Composition', 'oil on panel', 'Still Life', 2024, 30.0, 40.0, 750.00, true, false, 'me', 'abstract_comp.jpg', 'https://example.com/abstract_comp.jpg', 'https://example.com/abstract_comp_mid.jpg', 'https://example.com/abstract_comp_thumb.jpg'),
  (3, 'Portrait Study', 'pencil', 'Portrait', 2022, 12.0, 16.0, 200.00, true, true, 'buyer1', 'portrait_study.jpg', 'https://example.com/portrait_study.jpg', 'https://example.com/portrait_study_mid.jpg', 'https://example.com/portrait_study_thumb.jpg'),
  (4, 'City Lights', 'charcoal', 'Drawings', 2024, 20.0, 24.0, 600.00, true, false, 'me', 'city_lights.jpg', 'https://example.com/city_lights.jpg', 'https://example.com/city_lights_mid.jpg', 'https://example.com/city_lights_thumb.jpg'),
  (5, 'Inactive Artwork', 'oil on paper', 'New England Patriots', 2021, 15.0, 15.0, 300.00, false, false, 'me', 'inactive.jpg', null, null, null);

-- Insert sample tags
INSERT INTO tags (id, name) VALUES
  (1, 'exemplar'),
  (2, 'featured'),
  (3, 'nature'),
  (4, 'modern'),
  (5, 'classic');

-- Insert artwork-tag relationships
INSERT INTO artwork_tag_join (artwork_id, tag_id) VALUES
  (1, 1),  -- Sunset is exemplar
  (1, 3),  -- Sunset is nature
  (2, 1),  -- Abstract is exemplar
  (2, 4),  -- Abstract is modern
  (3, 5),  -- Portrait is classic
  (4, 2),  -- City Lights is featured
  (4, 4);  -- City Lights is modern

-- Reset sequences to continue from max ID
SELECT setval('artworks_id_seq', (SELECT MAX(id) FROM artworks));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
