FROM node:20

WORKDIR /server
COPY package*.json .
RUN npm install
COPY . .

# Build the app
# RUN ...

EXPOSE 4000

CMD [ "npm", "start" ]
