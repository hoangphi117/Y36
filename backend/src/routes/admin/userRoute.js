const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, changeStatus } = require('../../controllers/admin/userController');

router.get('/', getUsers);
router.put('/:id', changeStatus);
router.delete('/:id', deleteUser);

module.exports = router;