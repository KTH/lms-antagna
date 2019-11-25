# LMS Antagna

Periodical synchronization of people enrolled as "antagna" in the current Registration Period to the Canvas LMS.

## :wrench: Development mode

1.  Copy [the `.env.in` file][env-in] and name it as `.env`

    ```sh
    cp .env.in .env
    ```

    Open the newly created `.env` and fill it with the required data. This file will be read on startup as environmental variables.

2.  Run `npm run start:dev` to start the app in development mode

## :rocket: Production

1.  Set the environmental variables as written in [the `.env.in` file][env-in]
2.  Run `npm start`

_Keep in mind that output logs are in JSON format and could be therefore a bit unreadable without the correct tools._

## :rainbow: Contribution guide

The app is divided in the following components (each in one directory):

- `app.js` starts the application and all the components
- `lib` contains all the logic needed in the app
- `cron` manages the periodical task
- `server` contains an express server. This server is only used to dump information about the status of the app.

:bulb: Quick start: run `npx madge app.js --image graph.svg` in the root of this project to get an overview of the internal dependencies.

[env-in]: https://github.com/KTH/lms-antagna/blob/master/.env.in
