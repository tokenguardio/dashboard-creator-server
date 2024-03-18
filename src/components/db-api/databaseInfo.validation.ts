import Joi from 'joi';
import { ValidSchema } from '../../middleware/joiValidate';

export const getTableColumnsValidation: ValidSchema = {
  params: Joi.object({
    dbname: Joi.string().required(),
    schema: Joi.string().required(),
    table: Joi.string().required(),
  }),
};

const filterColumnSchema = Joi.object({
  columnName: Joi.string(),
  filterValue: Joi.alternatives().conditional('columnName', {
    is: Joi.exist(),
    then: Joi.alternatives()
      .try(
        Joi.string(),
        Joi.number(),
        Joi.object({
          start: Joi.string().required(),
          end: Joi.string().required(),
        }).required(),
      )
      .required(),
    otherwise: Joi.forbidden(),
  }),
}).or('columnName', 'filterValue');

export const generateChartDataValidation: ValidSchema = {
  params: Joi.object({
    dbname: Joi.string().required(),
    schema: Joi.string().required(),
    table: Joi.string().required(),
  }),
  body: Joi.object({
    dimension: Joi.string().required(),
    measures: Joi.array().items(Joi.any()).optional(),
    differential: Joi.string().allow('').optional(),
    filters: Joi.array().items(filterColumnSchema).optional(),
  }),
};
