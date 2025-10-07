FROM node:20-alpine

WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies first
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Clean up dev dependencies after build
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start command
CMD ["npm", "start"]
