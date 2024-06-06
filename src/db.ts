import logger from '@core/utils/logger';
import config from '@config/config';
import mongoose from 'mongoose';

const connect = async () => {
  try {
    // Use configuration for the connection string and database name
    const connectionString = config.mongoUrl;
    const mongoOptions = {
      dbName: config.mongoDbName,
      // Conditionally add the tlsCAFile option if the DB_TLS_CA_CERT_FILE environment variable is provided
      ...(config.tlsCAFile && {
        tlsCAFile: config.tlsCAFile,
      }),
    };

    logger.info(
      config.tlsCAFile
        ? 'Connecting to MongoDB with CA cert'
        : 'Connecting to MongoDB without CA cert',
    );

    // Connect to MongoDB with the provided options
    await mongoose.connect(connectionString, mongoOptions);
    logger.info('Connected to MongoDB!');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw new Error(err.message);
  }
};

export default { connect };
