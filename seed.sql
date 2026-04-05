-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Countries
INSERT INTO countries (id, name) VALUES
  (2, 'United Arab Emirates'),
  (3, 'United Kingdom')
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, name, description, country_id, location) VALUES
  (1, 'Pyramids Gate Residence', 'A luxurious residential compound located near the Great Pyramids of Giza. Features modern apartments with stunning views of the ancient wonders, landscaped gardens, swimming pools, and a private clubhouse.', 1, 'Giza, Cairo'),
  (2, 'Nile Tower', 'A prestigious high-rise tower on the banks of the Nile River. Offering premium apartments and penthouses with panoramic river views, world-class amenities, and a rooftop infinity pool.', 1, 'Zamalek, Cairo'),
  (3, 'Marina Bay Villas', 'Exclusive waterfront villas in the heart of Dubai Marina. Each villa features private pools, smart home technology, and direct marina access. Walking distance to top restaurants and retail.', 2, 'Dubai Marina, Dubai'),
  (4, 'Downtown Oasis', 'A modern mixed-use development in Downtown Dubai featuring luxury apartments with views of the Burj Khalifa. Includes retail spaces, a fitness center, and a landscaped podium garden.', 2, 'Downtown Dubai'),
  (5, 'Palm Residences', 'Beachfront apartments on the iconic Palm Jumeirah. Resort-style living with private beach access, water sports facilities, and a luxury spa.', 2, 'Palm Jumeirah, Dubai'),
  (6, 'Thames View Apartments', 'Contemporary riverside apartments in central London with stunning views of the Thames. Features include a concierge service, gym, and beautifully landscaped communal gardens.', 3, 'South Bank, London'),
  (7, 'Mayfair Heights', 'An elegant residential development in the prestigious Mayfair district. Classic British architecture meets modern luxury with high-end finishes and a private residents lounge.', 3, 'Mayfair, London'),
  (8, 'New Capital Gardens', 'A sprawling green community in Egypts New Administrative Capital. Family-friendly with parks, schools, mosques, and a commercial strip. Affordable yet modern living.', 1, 'New Administrative Capital')
ON CONFLICT (id) DO NOTHING;

-- Buildings
INSERT INTO buildings (id, name, project_id) VALUES
  (1, 'Block A', 1),
  (2, 'Block B', 1),
  (3, 'Tower 1', 2),
  (4, 'Villa Cluster 1', 3),
  (5, 'Villa Cluster 2', 3),
  (6, 'Tower A', 4),
  (7, 'Tower B', 4),
  (8, 'Beachfront Block', 5),
  (9, 'Riverside House', 6),
  (10, 'Mayfair Wing', 7),
  (11, 'Garden Block 1', 8),
  (12, 'Garden Block 2', 8)
ON CONFLICT (id) DO NOTHING;

-- Houses
INSERT INTO houses (id, building_id, price, floor,nb_bedrooms,nb_bathrooms) VALUES
  (1, 1, 150000, 1, 2, 2),
  (2, 1, 165000, 2, 3, 2),
  (3, 1, 180000, 3, 4, 3),
  (4, 2, 155000, 1, 2, 2),
  (5, 2, 170000, 2, 3, 2),
  (6, 3, 450000, 5, 5, 4),
  (7, 3, 520000, 10, 6, 5),
  (8, 3, 750000, 20, 8, 6),
  (9, 4, 2500000, 0, 10, 8),
  (10, 5, 3200000, 0, 12, 10),
  (11, 6, 800000, 8, 4, 3),
  (12, 6, 950000, 15, 5, 4),
  (13, 7, 700000, 10, 4, 3),
  (14, 7, 850000, 20, 5, 4),
  (15, 8, 600000, 1, 3, 2),
  (16, 9, 650000, 2, 2, 2),
  (17, 9, 720000, 6, 3, 3),
  (18, 10, 1200000, 4, 4, 4),
  (19, 11, 95000, 1, 1, 1),
  (20, 11, 110000, 3, 2, 2),
  (21, 12, 100000, 2, 2, 2),
  (22, 12, 120000, 4, 3, 3)
ON CONFLICT (id) DO NOTHING;
