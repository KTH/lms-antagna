# LMS Antagna

Do a daily synchronization of people enrolled as "antagna" to Canvas LMS.

## Configure the app

See `.env.in` to get information about the environmental variables needed.

- In development environments you can copy that file to `.env` and follow the instructions on the file itself.

## Contribution guide

The app is divided in the following components (each in one directory):

- `app.js` starts the application and all the components
- `lib` contains all the logic needed in the app
- `cron` manages the periodical task
- `server` contains an express server. This server is only used to dump information about the status of the app.

💡 Quick tip: run `npx madge app.js --image graph.svg` in the root of this project to get a cool overview on how everything is related
