# PolyForm 3D Store - Coolify Deployment Guide

## Prerequisites

- Coolify instance running
- GitHub repository with your code
- Domain or subdomain configured in Coolify

## Step 1: Prepare Environment Variables

In Coolify, configure the following environment variables:

```env
# Database Configuration
DB_USER=polyform_user
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
DB_NAME=polyform_db

# Application
PORT=3000
NODE_ENV=production

# Admin Credentials (IMPORTANT: Change these!)
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD

# Security
SESSION_SECRET=CHANGE_THIS_RANDOM_SECRET_KEY_MINIMUM_32_CHARS

# Gemini AI (Optional - for product description generation)
GEMINI_API_KEY=your_gemini_api_key_here

# SMTP Configuration (Configurable from admin panel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@polyform3d.com
```

> [!IMPORTANT]
> **Security**: Make sure to change `ADMIN_PASSWORD`, `DB_PASSWORD`, and `SESSION_SECRET` to strong, unique values before deploying to production!

## Step 2: Configure Coolify Project

1. **Create New Resource** in Coolify
   - Select "Docker Compose" as the resource type
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Port: `3000`

3. **Add PostgreSQL Database**
   - In Coolify, add a PostgreSQL 15 database service
   - Use the credentials from your environment variables
   - Ensure the database is in the same network as your app

4. **Configure Persistent Volumes**
   The docker-compose.yml includes three persistent volumes:
   - `postgres_data` - Database storage (automatic)
   - `uploads_data` - User uploaded images and files
   - `app_data` - Application data

   These volumes are automatically created by Docker Compose and will persist across deployments.

> [!TIP]
> **Backups**: Set up automatic backups for the `postgres_data` volume in Coolify to prevent data loss.

## Step 3: Deploy

1. Push your code to GitHub
2. In Coolify, click "Deploy"
3. Monitor the build logs
4. Once deployed, access your application via the configured domain

## Step 4: Initialize Database

The database schema and seed data will be automatically applied on first run via the `schema.sql` and `seed.sql` files mounted in docker-compose.yml.

## Step 5: Verify Deployment

1. Visit your application URL
2. Check that products load correctly
3. Test adding items to cart
4. **Access admin panel**: 
   - Click the logo 10 times
   - Enter the password you set in `ADMIN_PASSWORD` environment variable
5. Verify order management works
6. Test SMTP configuration in admin settings panel

> [!NOTE]
> **PWA Installation**: After deployment, users can install the app on their devices. On mobile, look for "Add to Home Screen" option. On desktop (Chrome/Edge), look for the install icon in the address bar.

## Troubleshooting

### Database Connection Issues
- Check that DATABASE_URL is correctly set
- Verify PostgreSQL service is running
- Check network configuration between app and database

### Build Failures
- Ensure all dependencies are in package.json
- Check Node.js version compatibility (requires Node 20+)
- Review build logs for specific errors

### API Errors
- Check that backend server is running on port 3000
- Verify CORS configuration if accessing from different domain
- Check database migrations ran successfully

## Production Optimizations

1. **Enable HTTPS** in Coolify settings
2. **Configure CDN** for static assets
3. **Set up monitoring** for database and application
4. **Enable automatic backups** for PostgreSQL
5. **Configure resource limits** (CPU/Memory) based on traffic

## Updating the Application

1. Push changes to GitHub
2. Coolify will automatically rebuild and redeploy
3. Database migrations will run automatically if schema changes

## Support

For issues specific to:
- **Coolify**: Check Coolify documentation
- **PostgreSQL**: Review database logs in Coolify
- **Application**: Check application logs in Coolify dashboard
