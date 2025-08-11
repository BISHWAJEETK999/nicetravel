# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Move static files to correct location for serving
RUN if [ -d "dist/public" ]; then cp -r dist/public/* dist/ && rm -rf dist/public; fi

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]