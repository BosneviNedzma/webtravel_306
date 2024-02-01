import { connect } from 'mongoose';

import dotenv from 'dotenv';
import app from './app.mjs';

dotenv.config({ path: './config.env' }); 

process.on('uncaughtException', (error) => {
  console.log('Error');
  console.log(error);
  process.exit(1);
});

const databaseConnectionString = process.env.DATABASE_CONNECTION_STRING.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
).replace('<dbname>', process.env.DATABASE_NAME);

connect(databaseConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('DB connection succesful!'))
  .catch((error) => console.log(error));

const port = process.env.PORT || 6969;

const server = app.listen(port, () => {
  console.log(`The server is running in port ${port} !`);
});

process.on('unhandledRejection', (error) => {
  console.log(error);

  console.log('Unhandled promise rejections!!! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
