# Railway Deployment Guide for TTravel Hospitality

## Issues Found and Fixed

### 1. Server Binding Issue
**Problem**: Server was binding to `localhost` instead of `0.0.0.0`
**Fix**: Changed server binding to `0.0.0.0` in `server/index.ts`

### 2. Database Configuration
**Problem**: Application was hardcoded to use in-memory storage
**Fix**: Updated `server/db.ts` to use real Neon database when `DATABASE_URL` is provided

### 3. Static File Serving
**Problem**: Build outputs to `dist/public` but production server expects files in `dist`
**Solution**: Created build script and Dockerfile to handle this

## Deployment Steps for Railway

### Step 1: Database Setup
1. Add a PostgreSQL database to your Railway project
2. Railway will automatically provide `DATABASE_URL` environment variable
3. Run database migrations: `npm run db:push`

### Step 2: Environment Variables
Set these environment variables in Railway:
```
NODE_ENV=production
DATABASE_URL=(automatically provided by Railway)
SESSION_SECRET=your-secure-session-secret
```

### Step 3: Build Configuration
Railway should use the provided `Dockerfile` for deployment, which:
- Installs dependencies
- Builds the frontend and backend
- Moves static files to correct location
- Starts the production server

### Step 4: Deploy
1. Connect your GitHub repository to Railway
2. Railway will automatically detect and use the Dockerfile
3. Deploy the application

## Alternative Build Method
If you prefer manual building:
```bash
# Run the production build script
./build-for-production.sh

# Or manually:
npm run build
cp -r dist/public/* dist/
rm -rf dist/public
```

## Troubleshooting

### 404 Error on Root Path
- Ensure static files are in `dist/` directory (not `dist/public/`)
- Check that `NODE_ENV=production` is set
- Verify the build completed successfully

### Database Connection Issues
- Confirm `DATABASE_URL` is set in Railway environment
- Run `npm run db:push` to ensure database schema is up to date
- Check Railway database logs for connection errors

### Port Issues
- Railway automatically sets the `PORT` environment variable
- Application listens on `0.0.0.0:PORT` for Railway compatibility

## Development vs Production
- **Development**: Uses in-memory storage, Vite dev server
- **Production**: Uses PostgreSQL database, serves static files from `dist/`

The application automatically detects the environment and configures itself accordingly.