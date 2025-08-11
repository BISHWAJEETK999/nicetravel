# Railway Deployment Guide for TTravel Hospitality

## Critical Fixes Applied (January 2025)

### 1. Server Binding Issue
**Problem**: Server was binding to `localhost` instead of `0.0.0.0`
**Fix**: Changed server binding to `0.0.0.0` in `server/index.ts`

### 2. Database Configuration  
**Problem**: Application was hardcoded to use in-memory storage
**Fix**: Updated `server/db.ts` to use real Neon database when `DATABASE_URL` is provided

### 3. Build Dependencies Issue
**Problem**: Railway build failing because dev dependencies (like Vite) weren't available during build
**Fix**: Updated Dockerfile and created nixpacks.toml to install all dependencies during build, then prune dev dependencies after

### 4. Static File Serving Path Issue
**Problem**: Vite builds to `dist/public` but production server expects files in `dist`
**Fix**: Added post-build step to move files from `dist/public/*` to `dist/`

## Deployment Files Created

- `Dockerfile`: Optimized for Railway Docker deployment
- `nixpacks.toml`: Configuration for Railway's Nixpacks builder (recommended)
- `railway.json`: Railway-specific deployment configuration
- `build-for-production.sh`: Manual build script for local testing

## Step-by-Step Railway Deployment

### Step 1: Database Setup
1. In Railway dashboard, add PostgreSQL database to your project
2. Railway automatically provides `DATABASE_URL` environment variable
3. Once deployed, run migrations from Railway's console: `npm run db:push`

### Step 2: Environment Variables (Required)
Set these in Railway project settings:
```
NODE_ENV=production
DATABASE_URL=(automatically provided by Railway)
SESSION_SECRET=your-secure-session-secret-here
```

### Step 3: Repository Connection
1. Connect your GitHub repository to Railway
2. Railway will detect the configuration files automatically
3. Choose Nixpacks as the builder (recommended) or Docker

### Step 4: First Deployment
1. Railway will run the build process using nixpacks.toml or Dockerfile
2. Build installs all dependencies → runs `npm run build` → moves static files → starts server
3. Application will be available at your Railway domain

## Build Process Explained

The build process now:
1. Installs ALL dependencies (including dev dependencies like Vite)
2. Runs `npm run build` to create production frontend and backend
3. Moves static files from `dist/public/` to `dist/` for proper serving
4. Removes dev dependencies to reduce bundle size
5. Starts production server with `npm start`

## Troubleshooting Guide

### Build Failures
If build fails with "Vite not found" or similar:
- Ensure nixpacks.toml or Dockerfile is in repository root
- Check that package.json includes all required devDependencies
- Verify Railway is using Nixpacks builder (not legacy buildpacks)

### 404 Errors After Successful Build
- Check Railway deploy logs for "Static files moved successfully"
- Verify `NODE_ENV=production` is set in Railway environment
- Ensure `DATABASE_URL` is provided and database is accessible

### Database Connection Issues
- Verify PostgreSQL service is running in Railway
- Check if migrations ran successfully: `npm run db:push`
- Look for database connection errors in Railway application logs

### Application Not Starting
- Check Railway application logs for startup errors
- Verify server is binding to `0.0.0.0` not `localhost`
- Ensure `PORT` environment variable is being used (Railway provides this automatically)

## Local Testing for Production Build

Before deploying to Railway, test locally:
```bash
# Build for production
npm run build

# Move static files
if [ -d "dist/public" ]; then cp -r dist/public/* dist/ && rm -rf dist/public; fi

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=your-database-url

# Start production server
npm start
```

## Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Static files are moved to correct location
- ✅ Database connection established
- ✅ Server starts on Railway-provided port
- ✅ Website loads without 404 errors
- ✅ Admin panel accessible and functional

## Environment Differences

| Environment | Database | Static Files | Builder |
|-------------|----------|--------------|---------|
| Development | In-memory | Vite dev server | N/A |
| Production | PostgreSQL | Static from `dist/` | Nixpacks/Docker |

The application automatically detects the environment and configures itself accordingly.