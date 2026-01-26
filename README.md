# Xyon3D Store

A modern, full-stack 3D printing e-commerce platform with PostgreSQL database, built for Docker deployment on Coolify.

**Note**: This project uses `docker-compose.yaml` (not .yml) for Coolify compatibility.

## Features

- 🛍️ **Product Catalog** - Browse 3D printing products with categories and search
- 🛒 **Shopping Cart** - Add items, adjust quantities, and checkout
- ❤️ **Wishlist** - Save favorite products for later
- 👤 **User Profiles** - Track orders and saved items
- 🔐 **Admin Panel** - Manage products, orders, and settings
- 📦 **Order Management** - Track order status (pending, shipped, delivered)
- 🎨 **Responsive Design** - Optimized for mobile and desktop
- 🗄️ **PostgreSQL Database** - Persistent data storage
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15
- **Deployment**: Docker, Coolify
- **AI**: Google Gemini API (product descriptions)

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up -d db
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run Development Server**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run dev:server
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Production Deployment (Coolify)

See [COOLIFY_DEPLOY.md](./COOLIFY_DEPLOY.md) for detailed deployment instructions.

Quick steps:
```bash
# Build and start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

## Project Structure

```
polyform-3d-store/
├── server/                 # Backend Express API
│   ├── index.js           # Main server file
│   └── db/                # Database files
│       ├── schema.sql     # Database schema
│       └── seed.sql       # Initial data
├── services/              # Frontend services
│   ├── api.ts            # API client
│   └── gemini.ts         # AI integration
├── components/            # React components
│   └── Navbar.tsx        # Navigation component
├── App.tsx               # Main React application
├── types.ts              # TypeScript definitions
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
└── package.json          # Dependencies
```

## Admin Panel

Access the admin panel by:
1. Click the logo 10 times
2. Enter password: `admin`

Admin features:
- **Products**: Add, edit, delete products
- **Orders**: View and update order status
- **Settings**: Configure store settings
- **System**: View analytics and deployment info

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

## Database Schema

- **products** - Product catalog
- **orders** - Customer orders
- **settings** - Store configuration
- **wishlist** - User wishlists

See `server/db/schema.sql` for complete schema.

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_api_key
```

## Development

### Adding New Products

Products can be added via:
1. Admin panel UI
2. Direct database insertion
3. API POST request

### Customizing Design

- Colors: Edit TailwindCSS config in `index.html`
- Components: Modify React components in `App.tsx` and `components/`
- Styles: Update CSS classes (using TailwindCSS)

## Troubleshooting

### Database Connection Failed
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify network connectivity

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 20+)

### API 404 Errors
- Ensure backend server is running
- Check API_BASE_URL in `services/api.ts`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
