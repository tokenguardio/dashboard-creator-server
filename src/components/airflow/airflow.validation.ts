import Joi from 'joi';

export const triggerDagRunValidation = {
  body: Joi.object({
    dagId: Joi.string().required(),
    conf: Joi.object().optional(),
  }),
};

export const checkDagRunStatusQueryValidation = {
  params: Joi.object({
    dagId: Joi.string().required(),
  }),
  query: Joi.object({
    dagRunId: Joi.string().required(),
  }),
};
