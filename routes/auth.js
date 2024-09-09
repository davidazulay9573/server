const router = require("express").Router();
const { signin, signup, verify } = require("../controller/auth");

router.get("/verify", verify);
router.post("/signin", signin);
router.post("/signup", signup);

module.exports = router;

