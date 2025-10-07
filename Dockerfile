# ---- build ----
FROM node:20-alpine AS build

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --verbose

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ---- runtime ----
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files first
COPY --from=build /app/package*.json ./

# Install production dependencies
RUN npm ci --production --verbose

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

# Add node_modules/.bin to PATH
ENV PATH="/app/node_modules/.bin:${PATH}"

# Railway will set PORT environment variable
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
