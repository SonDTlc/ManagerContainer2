import Joi from 'joi';

export const createRequestSchema = Joi.object({
	type: Joi.string().valid('IMPORT','EXPORT','CONVERT').required(),
	container_no: Joi.string().min(4).max(20).required(),
	eta: Joi.date().optional()
});

export const updateRequestStatusSchema = Joi.object({
	status: Joi.string().valid('PENDING','RECEIVED','REJECTED','COMPLETED','EXPORTED','IN_YARD','LEFT_YARD').required(),
	reason: Joi.string().optional()
});

export const queryRequestSchema = Joi.object({
	type: Joi.string().optional(),
	status: Joi.string().optional(),
	page: Joi.number().integer().min(1).optional(),
	limit: Joi.number().integer().min(1).max(100).optional()
});

export const uploadDocSchema = Joi.object({
	type: Joi.string().valid('EIR','LOLO','INVOICE').required()
});
