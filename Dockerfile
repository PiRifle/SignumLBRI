FROM node:lts-alpine
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", ".eslintrc*", ".eslintignore*", "./"]
RUN npm install --developement
COPY . .
RUN npm run build
RUN npm uninstall *
ENV NODE_ENV=production
RUN npm install --production --silent && mv node_modules ../
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
