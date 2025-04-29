const userModel = require("../model/userModel")
const blogModel = require("../model/blogModel")
const commentModel = require("../model/commentModel")
const replyCommentDb = require("../model/replyCommentModel")

const { userSchema, userLoginSchema, blogSchema, blogEditSchema, commentSchema, commentReplaySchema } = require("../validation/joi")
const commonFunction = require('../helper/files');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.userSignup = async (req, res) => {
    try {
        let { email, password, confirmPassword } = req.body;
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 0,
                message: error.details[0].message
            });
        } else {
            const exist = await userModel.exists({ email: req.body.email });
            if (exist) {
                return res.status(400).json({
                    status: 0,
                    message: "This email is already taken!"
                });
            }
            if (password != confirmPassword) {
                return res.status(400).json({ status: 0, message: 'password do not match.', })
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            let uploadedProfilePicUrl = null;
            if (req.file) {
               // console.log(req.file);
                
                uploadedProfilePicUrl = await commonFunction.uploadImage(req.file.buffer);
                //console.log(uploadedProfilePicUrl)
            }
            const newuser = new userModel({
                email,
                password: hashedPassword,
                profileImage: uploadedProfilePicUrl || ""

            });
            const saveduser = await newuser.save();
            return res.status(200).json({
                status: 1,
                message: "Users Signup sucessfully",
            });
        }
    } catch (err) {
        console.log("signup error=================>", err);

        return res.status(500).json({
            status: 0,
            message: err.toString(),
        });
    }
};

exports.userlogin = async (req, res) => {
    try {
        const { error } = userLoginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 0,
                message: error.details[0].message
            });
        } else {
            let userResult = await userModel.findOne({ email: req.body.email });
            if (!userResult) {
                return res.status(404).json({
                    status: 0,
                    message: "Email Not found",
                });
            }
            let passCheck = bcrypt.compareSync(
                req.body.password,
                userResult.password
            );
            if (passCheck == false) {
                return res.status(401).json({
                    status: 0,
                    message: "Incorrect password.",
                });
            } else {
                let dataToken = {
                    _id: userResult._id,
                    isUser: userResult.isUser,
                };
                let token = jwt.sign(dataToken, process.env.JWT_SECRET,
                    {
                        expiresIn: "30d",
                    }
                );
                return res.status(200).json({
                    status: 1,
                    message: "User Login Successfully.....",
                    result: {
                        _id: userResult._id,
                        email: userResult.email,
                        profileImage:userResult.profileImage,
                        token,
                    },
                });
            }
        }
    } catch (error) {
        console.log("login Api error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
};

exports.userProfile = async (req, res) => {
    try {
        const result = await userModel.findById(req.user._id).select("email profilePic").lean();
        if (!result) {
            return res.status(404).json({
                status: 0,
                message: "Data Not Founded"
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: "User Profile Founded successfully",
                result
            });
        }
    } catch (error) {
        console.log("profile Api error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
}

exports.userAddBlog = async (req, res) => {
    try {
        let { title, description } = req.body;
        const { error } = blogSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 0,
                message: error.details[0].message
            });
        } else {
            const exist = await blogModel.exists({ title: req.body.title });
            if (exist) {
                return res.status(400).json({
                    status: 0,
                    message: "This title is already taken!"
                });
            }
            let blogPicUrl = null;
            if (req.file) {
                blogPicUrl = await commonFunction.uploadImage(req.file.buffer);
            }

            const newBlog = new blogModel({
                title,
                description,
                blogImage: blogPicUrl || "",
                userId: req.user._id

            });
           const data= await newBlog.save();
            return res.status(200).json({
                status: 1,
                message: "Users add blog sucessfully",result:data
            });
        }
    } catch (error) {
        console.log("blog Api error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
}

exports.userEditBlog = async (req, res) => {
    try {
        const { title, description } = req.body;

        const { error } = blogEditSchema.validate({ title, description });
        if (error) {
            return res.status(400).json({
                status: 0,
                message: error.details[0].message
            });
        }
        const blog = await blogModel.findOne({ _id: req.params.id, userId: req.user._id });
        if (!blog) {
            return res.status(404).json({
                status: 0,
                message: "Blog not found or you are not authorized to edit this blog!"
            });
        }
        if (title && title !== blog?.title) {
            const titleExist = await blogModel.exists({ title });
            if (titleExist) {
                return res.status(400).json({
                    status: 0,
                    message: "This title is already taken!"
                });
            }
        }
        let blogPicUrl = blog.blogImage;
        if (req.file) {
            blogPicUrl = await commonFunction.uploadImage(req.file.buffer);
        }
        await blogModel.findByIdAndUpdate({ _id: blog._id }, { $set: req.body, blogImage: blogPicUrl }, { new: true })
        return res.status(200).json({
            status: 1,
            message: "Blog updated successfully",
        });

    } catch (error) {
        console.log("Edit Blog API Error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
};

exports.getBlogList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const result = await blogModel.find({ userId: req.user._id })
            .skip(skip)
            .limit(limit)
            .lean()
        if (!result.length) {
            return res.status(404).json({
                status: 0,
                message: "Data Not Founded...",
            });
        }
        const totalCount = await blogModel.countDocuments();
        return res.status(200).json({
            status: 1,
            message: "All Data Founded Successfully....",
            result,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
        });

    } catch (error) {
        console.log("list Blog API Error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
};

exports.getOneBlog = async (req, res) => {
    try {
        const result = await blogModel.findById(req.params.id).lean();
        if (!result) {
            return res.status(404).json({
                status: 0,
                message: "Data Not Founded"
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: "User Blog Founded successfully",
                result
            });
        }
    } catch (error) {
        console.log("One Blog API Error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
}

exports.blogDelete = async (req, res) => {
    try {
        const result = await blogModel.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({
                status: 0,
                message: "Data Not Founded"
            });
        } else {
            return res.status(200).json({
                status: 1,
                message: "User Blog Deleted successfully"
            });
        }
    } catch (error) {
        console.log("Delete Blog API Error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
}

exports.createComment = async (req, res) => {
    try {
        const { blogId, commentText } = req.body;
        const { error } = commentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 0,
                message: error.details[0].message
            });
        } else {
            const userId = req.user._id;
            const newComment = new commentModel({
                blogId,
                userId,
                commentText
            });

            await newComment.save();

            return res.status(200).json({
                status: 1,
                message: 'Comment added successfully',
                result: newComment
            });
        }
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

exports.replyComment = async (req, res) => {
    try {
        const { commentId, replyText } = req.body;
        const { error } = commentReplaySchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 0,
                message: error.details[0].message
            });
        } else {
            const userId = req.user._id;
            const comment = await commentModel.findById(commentId);
            if (!comment) {
                return res.status(404).json({ status: 0, message: 'Comment not found' });
            }
            const newReplyComment = new replyCommentDb({
                blogId: comment?.blogId,
                userId,
                replyText,
                commentId: commentId
            });

            await newReplyComment.save();

            return res.status(200).json({
                status: 1,
                message: 'Comment Reply successfully',
                result: newReplyComment
            });
        }
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.totalDashboardData = async (req, res) => {
    try {
        const totalBlogCount = await blogModel.countDocuments({ userId: req.user._id });
        const totalCommentCount = await commentModel.countDocuments({ userId: req.user._id });

        return res.status(200).json({
            status: 1,
            message: "Data Found Successfully",
            result: {
                totalBlog: totalBlogCount,
                totalComment: totalCommentCount
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getComment=async(req,res)=>{
    try {

        const result = await commentModel.find({ blogId: req.params.blogId }).populate("userId")
            .lean()
        if (!result.length) {
            return res.status(404).json({
                status: 0,
                message: "Data Not Founded...",
            });
        }
        return res.status(200).json({
            status: 1,
            message: "All Data Founded Successfully....",
            result,
        });

    } catch (error) {
        console.log("list Blog API Error=============>", error);
        return res.status(500).json({
            status: 0,
            message: error.toString(),
        });
    }
}