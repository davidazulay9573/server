const router = require("express").Router();
const { signin, signup, verifyEmail } = require("../controller/auth");

router.get("/verify", verifyEmail);
router.post("/signin", signin);
router.post("/signup", signup);

module.exports = router;
