import Joi from 'joi';
import { ValidSchema } from '../../middleware/joiValidate';

export const getTableColumnsValidation: ValidSchema = {
  params: Joi.object({
    schemaName: Joi.string().required(),
    tableName: Joi.string().required(),
  }),
};

export const generateChartDataValidation: ValidSchema = {
  params: Joi.object({
    schema: Joi.string().required(),
    table: Joi.string().required(),
  }),
  body: Joi.object({
    dimension: Joi.string().required(),
    measures: Joi.string(),
    differential: Joi.string().allow(''),
    filters: Joi.string(),
  }),
};
