const router = require("express").Router();
const userRouter = require("../controller/userController");
const multer = require('multer')
var storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {verifyTokenAndUser}=require("../middleware/auth")
router.post("/userSignup", upload.single('image'),userRouter.userSignup);
router.post("/userlogin",userRouter.userlogin);
router.get("/userProfile",verifyTokenAndUser,userRouter.userProfile);
router.post("/userAddBlog",verifyTokenAndUser,upload.single('image'),userRouter.userAddBlog);
router.put("/userEditBlog/:id",verifyTokenAndUser,upload.single('image'),userRouter.userEditBlog);
router.get("/getBlogList",verifyTokenAndUser,userRouter.getBlogList);
router.get("/getOneBlog/:id",verifyTokenAndUser,userRouter.getOneBlog);
router.delete("/blogDelete/:id",verifyTokenAndUser,userRouter.blogDelete);
router.post("/createComment",verifyTokenAndUser,userRouter.createComment);
router.post("/replyComment",verifyTokenAndUser,userRouter.replyComment);
router.get("/totalDashboardData",verifyTokenAndUser,userRouter.totalDashboardData);
router.get("/getComment/:blogId",verifyTokenAndUser,userRouter.getComment);
module.exports = router; 