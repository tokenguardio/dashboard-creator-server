import Joi from 'joi';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.localhost.env' });
// All env variables used by the app should be defined in this file.

// To define new env:
// 1. Add env variable to .localhost.env file;
// 2. Provide validation rules for your env in envsSchema;
// 3. Make it visible outside of this module in export section;
// 4. Access your env variable only via config file.
// Do not use process.env object outside of this file.

const envsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'integration', 'development')
      .required(),
    PORT: Joi.number().default(8080),
    API_KEY_TOKEN: Joi.string().required(),
    API_BASE_URL: Joi.string().required(),
    MONGODB_URL: Joi.string().required(),
    MONGODB_DB_NAME: Joi.string().required(),
    DEPLOYMENT_MODE: Joi.string().valid('docker', 'kubernetes').required(),
    CLIENT_URL: Joi.string().required(),
    DB_TLS_CA_CERT_FILE: Joi.string().optional(),
    INDEXER_DB_HOST: Joi.string().required(),
    INDEXER_DB_NAME: Joi.string().required(),
    INDEXER_DB_USER: Joi.string().required(),
    INDEXER_DB_PASS: Joi.string().required(),
    INDEXER_DB_PORT: Joi.string().required(),
  })
  .unknown(true);

const { value: envVars, error } = envsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(
    `Config validation error: ${error.message}. \n
     This app requires env variables to work properly. If you run app locally use docker-compose`,
  );
}

// map env vars and make it visible outside module
export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  xApiKey: envVars.API_KEY_TOKEN,
  dbApiUrl: envVars.API_BASE_URL,
  mongoUrl: envVars.MONGODB_URL,
  mongoDbName: envVars.MONGODB_DB_NAME,
  deploymentMode: envVars.DEPLOYMENT_MODE,
  clientUrl: envVars.CLIENT_URL,
  tgServerUrl: envVars.TG_SERVER_URL,
  tgClientUrl: envVars.TG_CLIENT_URL,
  tlsCAFile: envVars.DB_TLS_CA_CERT_FILE,
  indexerDbHost: envVars.INDEXER_DB_HOST,
  indexerDbName: envVars.INDEXER_DB_NAME,
  indexerDbUser: envVars.INDEXER_DB_USER,
  indexerDbPass: envVars.INDEXER_DB_PASS,
  indexerDbPort: envVars.INDEXER_DB_PORT,
};
