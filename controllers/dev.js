const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");


// @desc      create Permission
// @route     POST /api/v1/admins/permission/all/:id
// @access    private
exports.allUser = asyncHandler(async (req, res, next) => {
  const findAll = await User.find();

  res.status(200).json({
    success: true,
    data: findAll,
  });
});

// @desc      create Permission
// @route     POST /api/v1/admins/permission/all/:id
// @access    private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { username, phone } = req.body;
  const findAll = await User.findByIdAndUpdate(req.params.id, {
    username,
    phone,
  });

  res.status(200).json({
    success: true,
    data: findAll,
  });
});



// @desc      create Permission
// @route     POST /api/v1/admins/permission/all/:id
// @access    private
exports.delAll = asyncHandler(async (req, res, next) => {
  await User.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.del = asyncHandler(async (req, res, next) => {
  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      create Permission
// @route     POST /api/v1/admins/permission/all/:id
// @access    private
