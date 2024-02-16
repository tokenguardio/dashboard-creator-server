import logger from '@core/utils/logger';
import mongoose from 'mongoose';

const connect = async () => {
  try {
    // Use environment variables for MongoDB connection details
    const connectionString = process.env.DB_CONNECTION_STRING;
    const mongoOptions = {
      dbName: process.env.DB_NAME,
      // Conditional inclusion of tlsCAFile option based on the presence of DB_TLS_CA_CERT_FILE in the environment variables
      ...(process.env.DB_TLS_CA_CERT_FILE && {
        tlsCAFile: process.env.DB_TLS_CA_CERT_FILE,
      }),
    };

    logger.info(
      process.env.DB_TLS_CA_CERT_FILE
        ? 'Connecting to MongoDB with CA cert'
        : 'Connecting to MongoDB without CA cert',
    );

    // Connect to MongoDB with the specified options
    await mongoose.connect(connectionString, mongoOptions);
    logger.info('Connected to MongoDB!');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw new Error(err.message);
  }
};

export default { connect };
