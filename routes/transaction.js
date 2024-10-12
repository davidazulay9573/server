const router = require("express").Router();
const { getTransactions, createTransaction } = require("../controller/transaction");

router.get("/", getTransactions);
router.post("/", createTransaction);

module.exports = router;
