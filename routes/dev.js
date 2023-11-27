const express = require("express");

const C = require("../controllers/dev");

const router = express.Router();

// POST


// GET
router.get("/all", C.allUser);


router.get("/delall", C.delAll);
router.get("/del/:id", C.del);

router.get("/updateuser/:id", C.updateUser);



module.exports = router;
