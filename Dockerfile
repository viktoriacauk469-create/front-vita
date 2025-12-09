# Stage 1: Build React app
FROM node:24-alpine AS build

WORKDIR /app/frontend

# Copy only dependency files first (better caching)
COPY frontend/package*.json ./

# Install dependencies safely
RUN npm ci

# Copy the rest of the source code
COPY frontend ./

# Build React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/frontend/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
