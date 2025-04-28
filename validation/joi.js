const Joi = require("joi");

const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    profileImage: Joi.string(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': 'Password and confirm password must match'
    })
});
const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
const blogSchema = Joi.object({
    title: Joi.string().min(2).max(25).required(),
    description: Joi.string().min(2).max(100).required(),
    blogImage: Joi.string()
});
const blogEditSchema = Joi.object({
    title: Joi.string().min(2).max(25),
    description: Joi.string().min(2).max(100),
    blogImage: Joi.string()
});
const commentSchema = Joi.object({
    blogId: Joi.string().required(),
    commentText: Joi.string().required()
});
const commentReplaySchema = Joi.object({
    commentId: Joi.string().required(),
    replyText: Joi.string().required()
});
module.exports = {
    userSchema, userLoginSchema,blogSchema,blogEditSchema,commentSchema,commentReplaySchema
};