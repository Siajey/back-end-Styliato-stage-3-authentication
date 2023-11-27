const express = require("express");

const C = require("../controllers/auth");

const { protect } = require("../middleware/auth");

const router = express.Router();

// POST

// ! OK 1
router.post("/register", C.register);





// ! ok
router.post("/login", C.login);
router.post("/loginadmin", C.loginAdmin);

// ! nist
router.get("/forgetpassword/:email", C.forgotPasswordCode);
router.get("/checkcodepass/:code/:email", C.checkCodePass);

router.get("/changepassword/:email/:pass", C.forgotPassword);

//update user information
router.post("/updateprofile",protect,C.updateProfile)
router.post("/updateinformation",protect,C.updateInfo)
router.post("/changepassword", protect, C.changePassword);
//favoriteStayle
router.get("/addfavoritestayle/:id", C.addFavoriteStayle);
router.get("/removefavoriteStayle/:id", C.removeFavoriteStayle);

// ! nist
router.get("/recovery/:phone", C.forgotPasswordCode);

// PUT
router.put("/updatepassword", protect, C.updatePassword);
router.put("/resetpassword/:resettoken", C.resetPassword);

// ! ok
router.put("/picprofile", protect, C.pictureProfile);

// GET
// router.get("/checkphone/:email", C.checkEmail);

// ! ok
router.get("/changeusername/:username", protect, C.changeUsername);

// ! ok 2
router.get("/checksms/:code/:email", C.checkCode);

// ! nist
router.get("/againcode/:email", C.againCode);

// ! ok




router.get("/allusers", C.getAllUsers);

// ! nist


router.get("/logout", C.logout);




router.get("/checktoken", protect, C.checkToken);



module.exports = router;
