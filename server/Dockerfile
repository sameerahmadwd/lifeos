# Step 1: Base image
FROM node:20-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the application port
EXPOSE 5000

# Step 7: Define the command to start the application
CMD ["node", "server.js"]
