-- Seed data for PolyForm 3D Store

-- Insert default settings
INSERT INTO settings (key, value) VALUES
    ('storeName', 'PolyForm 3D'),
    ('smtpHost', 'smtp.gmail.com'),
    ('smtpUser', 'admin@polyform.com'),
    ('smtpPass', ''),
    ('adminEmail', 'admin@polyform.com')
ON CONFLICT (key) DO NOTHING;

-- Insert initial products with real 3D printing focus
INSERT INTO products (name, description, price, category, image_url, model_url, gallery, stock) VALUES
(
    'Voron StealthBurner Toolhead',
    'Premium CNC-machined aluminum toolhead for Voron 3D printers. Features integrated part cooling, LED mounting points, and optimized airflow design. Compatible with E3D V6 and Dragon hotends. Includes mounting hardware and detailed assembly instructions.',
    89.99,
    'Printer Parts',
    'https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=1200", "https://images.unsplash.com/photo-1615858079603-2415d3159082?q=80&w=1200", "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=1200"]'::jsonb,
    25
),
(
    'Articulated Dragon - Print-in-Place',
    'Stunning articulated dragon model with 45+ moving joints. No assembly required - prints fully articulated! Recommended materials: PLA Silk or PETG. Print time: ~18 hours at 0.2mm layer height. Perfect desk companion or gift.',
    24.99,
    'Toys & Figurines',
    'https://images.unsplash.com/photo-1615858079603-2415d3159082?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1615858079603-2415d3159082?q=80&w=1200", "https://images.unsplash.com/photo-1596496181963-c40d6c54780b?q=80&w=1200"]'::jsonb,
    50
),
(
    'Geometric Succulent Planter Set',
    'Modern low-poly planter collection (set of 3). Features integrated drainage system and removable saucer. Dimensions: Small (8cm), Medium (12cm), Large (16cm). Recommended material: Matte PLA or PETG for outdoor use. Food-safe coating available.',
    34.99,
    'Home & Garden',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=1200", "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=1200", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200"]'::jsonb,
    30
),
(
    'Cyberpunk Helmet - Cosplay Grade',
    'Full-scale wearable helmet inspired by cyberpunk aesthetics. Multi-part design optimized for FDM printing. Includes LED mounting channels and ventilation. Raw print ready for post-processing. Print time: ~60 hours. Material: ABS or ASA recommended.',
    149.99,
    'Cosplay & Props',
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1200", "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=1200"]'::jsonb,
    15
),
(
    'Modular Gridfinity Storage System',
    'Complete gridfinity-compatible storage solution. Includes 12 baseplate modules and 24 assorted bins. Perfect for workshop organization. Stackable, modular, and infinitely expandable. Print in PETG for durability.',
    45.00,
    'Organization',
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200"]'::jsonb,
    40
),
(
    'Flexi Rex - Articulated Dinosaur',
    'Adorable flexi T-Rex with full articulation. Print-in-place design requires no supports. Great for kids and collectors. Recommended: Rainbow PLA or Silk filament. Print time: ~8 hours. Size: 15cm long.',
    18.99,
    'Toys & Figurines',
    'https://images.unsplash.com/photo-1551817958-11e0f7bbea0a?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1551817958-11e0f7bbea0a?q=80&w=1200", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1200"]'::jsonb,
    100
),
(
    'Lithophane Moon Lamp',
    'Stunning 15cm diameter moon lamp with realistic lunar surface. Includes LED base with USB power. Custom lithophane technology reveals craters and maria. Print in white PLA at 0.12mm for best detail. Includes assembly guide.',
    56.99,
    'Lighting',
    'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=1200", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200"]'::jsonb,
    20
),
(
    'Customizable Cable Management Kit',
    'Professional cable management solution. Includes cable clips, channels, and organizers. Adhesive-backed for easy installation. Set of 50 pieces in various sizes. Perfect for desk setups and home theaters.',
    22.50,
    'Organization',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    NULL,
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200", "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200"]'::jsonb,
    75
)
ON CONFLICT DO NOTHING;
