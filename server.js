require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('MONGODB_URI must be set.');
  process.exitCode = 1;
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
      process.exitCode = 1;
    });
}
