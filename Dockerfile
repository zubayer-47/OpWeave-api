# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package.json yarn.lock ./

# Install yarn
RUN npm install yarn

#set yarn version
RUN yarn set version stable

# install packages
RUN yarn

# Copy the rest of the application code to the working directory
COPY . .

# build
RUN yarn build

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the app
CMD ["yarn", "prod"]
