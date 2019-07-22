FROM node:10-alpine

# We do this to avoid npm install when we're only changing code
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

# Source files in root
COPY ["app.js", "app.js"]
COPY ["logger.js", "logger.js"]

# Source files directories
COPY ["cron", "cron"]
COPY ["lib", "lib"]

RUN npm ci --production

EXPOSE 3001

CMD ["node", "app.js"]