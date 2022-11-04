FROM mcr.microsoft.com/playwright:focal as BASE

WORKDIR /app

COPY package.json /package.json
COPY package-lock.json /package-lock.json
COPY index.js /index.js
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]