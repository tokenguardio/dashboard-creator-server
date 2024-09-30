import Joi from 'joi';

export const triggerDagRunValidation = {
  body: Joi.object({
    dagId: Joi.string().required(),
    conf: Joi.object().optional(),
  }),
};
