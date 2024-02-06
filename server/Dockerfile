# client/Dockerfile

FROM node:20

WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .

# Build the app
# RUN ...

EXPOSE 4000

CMD [ "npm", "start" ]
