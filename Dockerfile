FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose ports (3000 for frontend, 3001 for backend)
EXPOSE 3000
EXPOSE 3001

# Use development mode - runs both servers
CMD ["npm", "start"]

