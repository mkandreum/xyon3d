const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // Import multer
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'image-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://polyform_user:polyform_secure_pass@localhost:5432/polyform_db',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
// Database initialization and connection test
const initDatabase = async () => {
    try {
        // 1. Test connection
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully at:', res.rows[0].now);

        // 2. Apply Schema (Idempotent: uses IF NOT EXISTS)
        console.log('🔄 Checking database schema...');
        const schemaPath = path.join(__dirname, 'db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Database schema verified/applied');

        // 3. Seed Data (Only if products table is empty)
        const productsCount = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(productsCount.rows[0].count) === 0) {
            console.log('🌱 Database empty, seeding initial data...');
            const seedPath = path.join(__dirname, 'db/seed.sql');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await pool.query(seedSql);
            console.log('✅ Database seeded successfully');
        } else {
            console.log(`ℹ️  Database contains ${productsCount.rows[0].count} products, skipping seed`);
        }

    } catch (err) {
        console.error('❌ Database initialization error:', err);
        // Don't exit process, let it try to handle requests or restart
    }
};

initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------- AUTHENTICATION --------------------

// Admin login
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (password === adminPassword) {
        res.json({ success: true, message: 'Authentication successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid password' });
    }
});

// File Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return the public URL for the file
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// -------------------- PRODUCTS --------------------

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description, price, category, image_url as "imageUrl", model_url as "modelUrl", gallery FROM products ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, name, description, price, category, image_url as "imageUrl", model_url as "modelUrl", gallery FROM products WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, modelUrl, gallery } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        const result = await pool.query(
            `INSERT INTO products (name, description, price, category, image_url, model_url, gallery) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, description, price, category, image_url as "imageUrl", model_url as "modelUrl", gallery`,
            [name, description || '', price, category, imageUrl || '', modelUrl || '', JSON.stringify(gallery || [])]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, imageUrl, modelUrl, gallery } = req.body;

        const result = await pool.query(
            `UPDATE products 
       SET name = $1, description = $2, price = $3, category = $4, image_url = $5, model_url = $6, gallery = $7
       WHERE id = $8
       RETURNING id, name, description, price, category, image_url as "imageUrl", model_url as "modelUrl", gallery`,
            [name, description, price, category, imageUrl, modelUrl, JSON.stringify(gallery || []), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully', id: result.rows[0].id });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// -------------------- ORDERS --------------------

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, customer_email as "customerEmail", total, status, items, created_at as "date" FROM orders ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerEmail, total, items } = req.body;

        if (!customerEmail || !total || !items || items.length === 0) {
            return res.status(400).json({ error: 'Customer email, total, and items are required' });
        }

        const result = await pool.query(
            `INSERT INTO orders (customer_email, total, items, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, customer_email as "customerEmail", total, status, items, created_at as "date"`,
            [customerEmail, total, JSON.stringify(items), 'pending']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'shipped', 'delivered'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be pending, shipped, or delivered' });
        }

        const result = await pool.query(
            `UPDATE orders SET status = $1 WHERE id = $2 
       RETURNING id, customer_email as "customerEmail", total, status, items, created_at as "date"`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// -------------------- SETTINGS --------------------

// Get all settings
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update settings
app.put('/api/settings', async (req, res) => {
    try {
        const settings = req.body;

        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                [key, value]
            );
        }

        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// -------------------- WISHLIST --------------------

// Get wishlist (using session ID from header or cookie)
app.get('/api/wishlist', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || 'default-session';

        const result = await pool.query(
            'SELECT product_id as "productId" FROM wishlist WHERE session_id = $1',
            [sessionId]
        );

        const productIds = result.rows.map(row => row.productId);
        res.json(productIds);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// Add to wishlist
app.post('/api/wishlist', async (req, res) => {
    try {
        const { productId } = req.body;
        const sessionId = req.headers['x-session-id'] || 'default-session';

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        await pool.query(
            'INSERT INTO wishlist (product_id, session_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [productId, sessionId]
        );

        res.status(201).json({ message: 'Added to wishlist', productId });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// Remove from wishlist
app.delete('/api/wishlist/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const sessionId = req.headers['x-session-id'] || 'default-session';

        await pool.query(
            'DELETE FROM wishlist WHERE product_id = $1 AND session_id = $2',
            [productId, sessionId]
        );

        res.json({ message: 'Removed from wishlist', productId });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// -------------------- ANALYTICS --------------------

// Get analytics/stats
app.get('/api/analytics', async (req, res) => {
    try {
        const [productsCount, ordersCount, revenue, ordersByStatus] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM products'),
            pool.query('SELECT COUNT(*) as count FROM orders'),
            pool.query('SELECT COALESCE(SUM(total), 0) as total FROM orders'),
            pool.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`)
        ]);

        res.json({
            totalProducts: parseInt(productsCount.rows[0].count),
            totalOrders: parseInt(ordersCount.rows[0].count),
            totalRevenue: parseFloat(revenue.rows[0].total),
            ordersByStatus: ordersByStatus.rows.reduce((acc, row) => {
                acc[row.status] = parseInt(row.count);
                return acc;
            }, {})
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ==================== SERVE FRONTEND ====================

// All other routes serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PolyForm 3D Store server running on port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Using default connection'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});
