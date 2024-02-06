# client/Dockerfile

FROM node:20

WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .

# Build the app
# RUN ...

EXPOSE 3000

CMD [ "npm", "start" ]
