FROM node:18-alpine

WORKDIR /app

# Install kubectl
RUN apk add --no-cache curl ca-certificates && \
    curl -LO "https://dl.k8s.io/release/v1.30.0/bin/linux/amd64/kubectl" && \
    chmod +x kubectl && \
    mv kubectl /usr/local/bin/kubectl

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]