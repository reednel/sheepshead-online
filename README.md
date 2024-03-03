# Sheepshead Online

![GitHub Release](https://img.shields.io/github/v/release/reednel/sheepshead-online) [![GitHub License](https://img.shields.io/github/license/reednel/sheepshead-online?color=purple)](https://github.com/reednel/sheepshead-online/blob/main/LICENSE) [![Repo Size](https://img.shields.io/github/repo-size/reednel/sheepshead-online)](https://github.com/reednel/sheepshead-online) ![GitHub issues](https://img.shields.io/github/issues/reednel/sheepshead-online)

A free and open source PWA for the card game Sheepshead. Or, it will be soon.

## Development Instructions

> Note: this app requires [Docker](https://www.docker.com/get-started/)

1. Fork this repository and clone it to your machine
2. Copy the `.env.template` file into the same directory, naming the copy `.env`
3. Checkout the development branch: `git checkout develop`
4. Spin up the Docker containers (this may take a few minutes): `docker compose up`
5. Inside the `app-server` container, run:
   1. `curl --location --request POST 'http://auth-server:3567/recipe/dashboard/user' --header 'rid: dashboard' --header 'api-key: supertokensapikey0123456789' --header 'Content-Type: application/json' --data-raw '{"email": "authuser@so.com", "password": "supertokenspw1"}'`
   2. `npx prisma migrate dev --name init`

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
- [SuperTokens](https://github.com/supertokens)
