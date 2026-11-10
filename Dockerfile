# Tahap Builder (Multi-stage)
FROM node:20.11.1-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Tahap Runtime
FROM node:20.11.1-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app ./
EXPOSE 3000
CMD ["node", "server.js"]