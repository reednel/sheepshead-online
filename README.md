# Sheepshead Online

![GitHub Release](https://img.shields.io/github/v/release/reednel/sheepshead-online) [![GitHub License](https://img.shields.io/github/license/reednel/sheepshead-online?color=purple)](https://github.com/reednel/sheepshead-online/blob/main/LICENSE) [![Repo Size](https://img.shields.io/github/repo-size/reednel/sheepshead-online)](https://github.com/reednel/sheepshead-online) ![GitHub issues](https://img.shields.io/github/issues/reednel/sheepshead-online)

A free and open source PWA for the card game Sheepshead. Or, it will be soon.

## Development Instructions

> Note: this app requires [Docker](https://www.docker.com/get-started/)

1. Fork this repository and clone it to your machine.
2. Checkout the development branch: `git checkout develop`
3. Copy the `.env.template` file into the same directory, naming the copy `.env`.
4. Run `npm install` in both the `client/` and `server/` directories (not in root).
5. Spin up the Docker containers (this may take a few minutes): `docker compose up`
6. From the `app-server` container command line, run:
   - `curl --location --request POST 'http://auth-server:3567/recipe/dashboard/user' --header 'rid: dashboard' --header 'api-key: supertokensapikey0123456789' --header 'Content-Type: application/json' --data-raw '{"email": "authuser@so.com", "password": "supertokenspw1"}'`
     - This sets up the auth dashboard with a test admin account.
   - `npx prisma migrate dev --name init`
     - This initializes the app database according to our prisma schema.

- Access pgAdmin at `http://localhost:6432/browser/`

  - Username: `appuser@so.com`
  - Password: `apppw`
  - Connect to the database:
    1. Select "add new server"
    2. In the general tab:
       1. name: `appdb`
    3. In the connection tab:
       1. hostname: `app-db`
       2. port: `5432`
       3. maintainence database: `appdb`
       4. username: `appuser`
       5. password: `apppw`
    4. press "save"
  - The relevant information is in `Servers > appdb > Databases (2) > appdb > Schemas (1) > public`

- Access the SuperTokens auth dashboard at `http://localhost:4000/auth/dashboard/`

  - Username: `authuser@so.com`
  - Password: `supertokenspw1`

## Contributing

Users interested in expanding functionalities in Sheepshead Online are welcome to do so. Issues reports are encouraged through Github's [issue tracker](https://github.com/reednel/sheepshead-online/issues). See details on how to contribute and report issues in [CONTRIBUTING.md](CONTRIBUTING.md). All contributors are expected to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This software is licensed under the [AGPL-3.0 license](LICENSE).

## Acknowledgements

We owe a big thanks to all the projects that make Sheepshead Online run.

- [Angular](https://github.com/angular)
- [Docker](https://github.com/docker)
- [Express](https://github.com/expressjs)
- [Ionic](https://github.com/ionic-team)
- [Node](https://github.com/nodejs)
- [Postgres](https://github.com/postgres)
- [Prisma](https://github.com/prisma)
- [Redis](https://github.com/redis)
- [SocketIO](https://github.com/socketio)
- [SuperTokens](https://github.com/supertokens)
