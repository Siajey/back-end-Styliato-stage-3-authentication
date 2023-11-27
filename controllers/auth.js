const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const path=require("path")


const User = require("../models/User");




const fetch = require("node-fetch");

// @desc      Register user
// @route     POST /api/v1/auth/user/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const code = Math.floor(1000 + Math.random() * 9000);
  
  const { phone, email , password , userName } = req.body;


  if (!email) {
    return next(new ErrorResponse("Please add a email",403));
  }
  if (!phone) {
    return next(new ErrorResponse("Please add a phone",403));
  }
  if (!password) {
    return next(new ErrorResponse("Please add a password",403));
  }
  if (!userName) {
    return next(new ErrorResponse("Please add a userName",403));
  }
   
  const existingUser=await User.find({$or:[
    {"phone":phone},
    {"email":email},
    {"userName":userName}

  ]})
  
  
  
  

  if (existingUser.length!=0) {
     
     if(existingUser[0].userName==userName){
      return next(new ErrorResponse(`This userName already exist`, 403));
     }
     if(existingUser[0].email==email){
      return next(new ErrorResponse(`This email already exist`, 403));
     }
     if(existingUser[0].phone==phone){
      return next(new ErrorResponse(`This phone already exist`, 403));
     }

     
      return next(new ErrorResponse(`This user already exist`, 403)); 
  }
  const user = await User.create({
    phone,
    email,
    password,
    code,
    userName
  });


  sendTokenResponse(user, 200, res);
 
});



// @desc      check code
// @route     POST /api/v1/users/auth/register
// @access    Public
exports.checkCode = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  if (!users) {
    return next(new ErrorResponse("This user does not exist", 401));
  }

  if (req.params.code == user.code && user.codeUsed) {
    return next(new ErrorResponse("This code has been used before", 401));
    // return next(new ErrorResponse("这个代码以前用过", 401));
  }

  if (req.params.code == user.code) {
    await user.updateOne(
      { codeUsed: true },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } else {
    return next(new ErrorResponse("Invalid credentials", 401));
 
  }
});

// @desc      again code
// @route     POST /api/v1/users/auth/register
// @access    Public
exports.againCode = asyncHandler(async (req, res, next) => {
  const code = Math.floor(1000 + Math.random() * 9000);

  const user = await User.findOne({ emai: req.params.email });

  if (!user) {
    return next(new ErrorResponse("This user does not exist", 401));
  }

  await user.updateOne(
    { codeUsed: false, code: code },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    newCode: code,
  });
});

// @desc      Login user with phone
// @route     POST /api/v1/admins/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  let user;
  if (req.body.identifier) {
    const { identifier, password } = req.body;
     
    

    if (!password || !identifier) {
      return next(
        new ErrorResponse("Please provide an password and email or userName", 400)
      );
    }

    // Check for user
    user = await User.findOne({ $or : [{"email":identifier},{"userName":identifier}] }).select("+password");
  }

  console.log("user",user);

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(req.body.password);

  // true false

  if (!isMatch) {
    return next(new ErrorResponse("The password is incorrect", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Login user with phone
// @route     POST /api/v1/admins/auth/login
// @access    Public
exports.loginAdmin = asyncHandler(async (req, res, next) => {
  let user;
  if (req.body.email) {
    const { phone, password } = req.body;

    // Validate phone & password
    if (!password || !email) {
      return next(
        new ErrorResponse("Please provide an password and Phone", 400)
      );
    }

    // Check for user
    user = await User.findOne({ email }).select("+password");
  }

  // console.log(user);

  if (req.body.username) {
    const { username, password } = req.body;

    // Validate username & password
    if (!password || !username) {
      return next(
        new ErrorResponse("Please provide an password and username", 400)
      );
    }

    // Check for user
    user = await User.findOne({ username }).select("+password");
  }

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  if (user.group[0] == "admin" || user.group[0] == "superAdmin") {
    // Check if password matches
    const isMatch = await user.matchPassword(req.body.password);

    // true false

    if (!isMatch) {
      return next(new ErrorResponse("The password is incorrect", 401));
    }

    sendTokenResponse(user, 200, res);
  } else {
    return next(new ErrorResponse("You are not an admin", 401));
  }
});




// @desc      Update password
// @route     PUT /api/v1/users/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // find user
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
    // return next(new ErrorResponse("密码不正确", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/users/auth/forgotpassword
// @access  Private
exports.forgotPasswordCode = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  if (!user) {
    return next(
      new ErrorResponse("There is no user with that email ", 404)
    );
  }
  const code = Math.floor(1000 + Math.random() * 9000);

  const now = Date.now();

  await User.findByIdAndUpdate(user._id, {
    codePass: code,
    codeUsedPass: false,
    codePassTime: now,
  });

  // await sendSms(req.params.phone, code);

  return res.status(200).json({
    success: true,
    code,
  });
});

// @desc      check code
// @route     POST /api/v1/users/auth/register
// @access    Public
exports.checkCodePass = asyncHandler(async (req, res, next) => {
  const users = await User.findOne({ email: req.params.email });

  if (!users) {
    return next(new ErrorResponse("This user does not exist", 401));
  }

  if (req.params.code == users.codePass && users.codeUsedPass) {
    return next(new ErrorResponse("This code has been used before", 401));
    // return next(new ErrorResponse("这个代码以前用过", 401));
  }

  if (req.params.code == users.codePass) {
    await users.updateOne(
      { codeUsedPass: true },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } else {
    return next(new ErrorResponse("Invalid credentials", 401));
    // return next(new ErrorResponse("无效证件", 401));
  }
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const userFind = await User.findOne({ email: req.params.email });

  if (!userFind) {
    return next(
      new ErrorResponse("There is no user with that email or phone", 404)
    );
  }
  
  console.log("req.params.pass", req.params.pass);

  const user = await User.findOneAndUpdate(
    { _id: userFind._id },
    {
      password: req.params.pass,
      codeUsedPass: true,
    },
    { new: true }
  );
  console.log("user>>>>>>>", user);

  sendTokenResponse(user, 200, res);

});

// @desc    Reset password
// @route   POST /api/v1/users/auth/resetpassword
// @access  Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
    // return next(new ErrorResponse("令牌无效", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.pictureProfile = asyncHandler(async (req, res, next) => {
  // console.log("req.body.pictureProfile", req.body.pictureProfile);
  const fy = JSON.stringify(req.body);

  const newData = JSON.parse(fy);

  const { pictureProfile } = newData;
  // console.log("pictureProfile", pictureProfile);

  // find user and update add profile photo
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { pictureProfile: pictureProfile },
    { new: true }
  );

  // console.log("user", user);

  res.status(200).json({
    success: true,
    data: {},
  });
});



// @desc    Seen user if isActive == true
// @route   GET /api/v1/users/auth/seen
// @access  Private


// @desc      Get all admins
// @route     GET /api/v1/admins/admin/all
// @access    Private
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const allUser = await User.find();

  console.log(">>.", allUser);

  if (!allUser) {
    return next(new ErrorResponse("users not found", 400));
  }

  res.status(200).json({
    success: true,
    data: allUser,
  });
});

// @desc      Get all admins
// @route     GET /api/v1/admins/admin/all
// @access    Private

exports.checkEmail = asyncHandler(async (req, res, next) => {
  const code = Math.floor(1000 + Math.random() * 9000);
  // console.log(req.params.phone);
  function checkFirstLetterSpecial(_string) {
    let spCharsRegExp = /^[86]+/;
    return spCharsRegExp.test(_string);
  }

  if (!req.params.email) {
    return next(new ErrorResponse("Please add a phone", 403));
  }

  const existingUser = await User.findOne({ email: req.params.email });

  if (!existingUser) {
    return next(new ErrorResponse("The phone number is wrong", 403));
  }

  await existingUser.updateOne(
    {
      codeUsed: false,
      code,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
 
  const {currentPassword ,newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
   
  const isMatch=await user.matchPassword(currentPassword);

  if(!isMatch){
    return next(new ErrorResponse("your current password is wrong", 401));
  }
  user.password = newPassword;
  await user.save();
  return res.status(201).json({success:true})
  
});
exports.updateProfile = asyncHandler(async (req, res, next) => {
 
  if(!req.files.image){
    return  new ErrorResponse ("no file attach",500)
  }

  console.log(req.files.image);
  let sampleFile;
  let uploadPath;
  
  sampleFile = req.files.image;
  
  uploadPath =path.join(__dirname,"../public/profile/"+sampleFile.name);
  
  sampleFile.mv(uploadPath, function(err) {
    if (err){
      return  new ErrorResponse ("upload fail",500)
    }
    
  });
  if (!req.files || Object.keys(req.files).length === 0) {
    return  new ErrorResponse ("no file upload",500)
  }
  // const url=`http://localhost:8002/profile/${sampleFile.name}`
  const url=`http://stayliatoauth.onegroupinnovate.com//profile/${sampleFile.name}`

  const user=await User.findById(req.user._id)

  if(!user){
    return  new ErrorResponse ("user not found",403)
  }

  user.pictureProfile=url

  await user.save()


  return res.status(201).json({success:true,url})
  
  
});
exports.updateInfo = asyncHandler(async (req, res, next) => {
 const {userName,email,phone}=req.body
   
 if(!userName||!email||!phone){
  return  new ErrorResponse ("information not compeleted",500)
  }
  const existingUser=await User.find({$or:[
    {"phone":phone},
    {"email":email},
    {"userName":userName}

  ]})
  
  
  
  

  if (existingUser.length!=0&&existingUser[0]._id!=req.user._id) {
     
     if(existingUser[0].userName==userName){
      return next(new ErrorResponse(`This userName already exist`, 403));
     }
     if(existingUser[0].email==email){
      return next(new ErrorResponse(`This email already exist`, 403));
     }
     if(existingUser[0].phone==phone){
      return next(new ErrorResponse(`This phone already exist`, 403));
     }

  }

  await User.findByIdAndUpdate(req.user._id,{
    userName,
    email,
    phone
  })
  

  return res.status(201).json({success:true})

});
exports.addFavoriteStayle= asyncHandler(async (req, res, next) => {
  let array=[]

  const user=await User.findById(req.user._id)
  if(!user){
    return  new ErrorResponse ("user not found",403)
  }

  array=[...user.favoriteStyles]

  array.push({stayleId:req.params.id})

  user.favoriteStyles=array

  await user.save()



   return res.status(201).json({success:true})
 
 });
 exports.removeFavoriteStayle= asyncHandler(async (req, res, next) => {
  let array=[]

  const user=await User.findById(req.user._id)
  if(!user){
    return  new ErrorResponse ("user not found",403)
  }

  array=[...user.favoriteStyles]

 const updateArray=array.filter(item=>item.orderId!==req.params.id)

 
 user.favoriteStyles=updateArray

 await user.save()
 
  return res.status(201).json({success:true})

});

exports.changeUsername = asyncHandler(async (req, res, next) => {
  const code = Math.floor(Math.random() * 90000) + 10000;

  if (!req.params.username) {
    return next(new ErrorResponse("Please add username", 401));
  }
  const existingUser = await User.findById(req.user._id);

  if (!existingUser) {
    return next(new ErrorResponse("User not found", 404));
  }

  // console.log("username", req.params.username);

  let userNew;
  const findUsername = await User.findOne({ username: req.params.username });
  if (findUsername) {
    userNew = req.params.username + code;
  }
  // console.log("userNew", userNew);

  await existingUser.updateOne(
    {
      username: userNew ? userNew : req.params.username,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get all admins
// @route     GET /api/v1/admins/admin/all
// @access    Private


// @desc      Log user out / clear cookie
// @route     GET /api/v1/admins/auth/logout
// @access    Private


exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/admins/auth/logout
// @access    Private

exports.checkToken = asyncHandler(async (req, res, next) => {
  const check = await User.findById(req.user._id).select("-password");
  
  if (check) {
    res.status(200).json({ success: true, data: check });
  } else {
    console.log("check", check);
    res.status(200).json({ success: false });
  }
});





// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  console.log(user);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  const users = {
    _id: user._id,
    phone: user.phone,
    userName: user.userName,
    email: user.email,
    
  };
  console.log("token", token);
  console.log("users", users);

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    data: users,
  });
};
