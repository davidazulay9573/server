const router = require('express').Router();
const userController = require('../controller/user');

router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
