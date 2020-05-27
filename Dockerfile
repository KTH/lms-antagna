FROM node:10-alpine
WORKDIR /usr/src/app

# We do this to avoid npm install when we're only changing code
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]
RUN npm ci --production

# Source files in root
COPY [".env.in", ".env.in"]
COPY ["app.js", "app.js"]
COPY ["logger.js", "logger.js"]

# Source files directories
COPY ["cron", "cron"]
COPY ["lib", "lib"]
COPY ["server", "server"]
COPY ["config", "config"]

EXPOSE 3000

CMD ["node", "app.js"]
