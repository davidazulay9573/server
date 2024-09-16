const router = require("express").Router();
const { getTransactions, createTransaction } = require("../controller/transaction");

router.get("/", getTransactions);
router.post("/", createTransaction);

module.exports = router;

// {"to": "66e6c7646be58381c7313666", "amount" : 300}
