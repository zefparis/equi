# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install all dependencies (including dev dependencies for build)
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build

# ---- runtime ----
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./

# Install production dependencies only
# Note: vite and @vitejs/plugin-react are in production dependencies
RUN npm ci --production

# Add node_modules/.bin to PATH
ENV PATH="/app/node_modules/.bin:${PATH}"

# Railway will set PORT environment variable
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]
