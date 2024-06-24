import Joi from 'joi';

const getAllBlockchainsValidation = {
  query: Joi.object({
    active: Joi.boolean().default(true),
    growthindex: Joi.boolean(),
    dappgrowth: Joi.boolean(),
  }),
};

const getBlockchainBySlugValidation = {
  params: Joi.object({
    slug: Joi.string().required(),
  }),
};

export { getAllBlockchainsValidation, getBlockchainBySlugValidation };

