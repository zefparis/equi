FROM node:20-alpine

WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (using ci for clean install)
RUN npm ci || npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Don't prune drizzle-kit since we need it for runtime migrations
# Only remove the largest dev dependencies that we don't need
# Keep drizzle-kit, tsx for migrations and seed
# RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start command - migrations will run at startup
CMD ["npm", "run", "start:railway"]
