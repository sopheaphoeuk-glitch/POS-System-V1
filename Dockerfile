🧩 STEP 4: Paste Dockerfile Content (Node.js App)
✅ Use this standard Dockerfile (Cloud Run compatible)
# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Cloud Run uses PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
