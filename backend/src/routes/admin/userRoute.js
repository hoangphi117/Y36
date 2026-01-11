const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, changeStatus } = require('../../controllers/admin/userController');

router.get('/users', getUsers);
router.put('/users/:id', changeStatus);
router.delete('/users/:id', deleteUser);