const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const AuthRoute = require('./authRoute');
const customerGameRoute = require('./customer/gameRoute');
const customerGameSessionRoute = require('./customer/gameSessionRoute');
const userRoute = require('./userRoute');
const friendRoute = require('./customer/friendRoute');
const messageRoute = require('./customer/messageRoute')
const commentRoute = require('./customer/commentRoute');
const ratingRoute = require('./customer/ratingRoute');

const adminUserRoute = require('./admin/userRoute');
const adminGameRoute = require('./admin/gameRoute');
const adminStatsRoute = require('./admin/statsRoute');

router.use('/auth', AuthRoute);
//ADMIN ROUTES
router.use('/admin/users', verifyToken, isAdmin, adminUserRoute);
router.use('/admin/games', verifyToken, isAdmin, adminGameRoute);
router.use('/admin/stats', verifyToken, isAdmin, adminStatsRoute);

//CUSTOMER ROUTES
router.use('/users', verifyToken, userRoute);
router.use('/games', verifyToken, customerGameRoute);
router.use('/sessions', verifyToken, customerGameSessionRoute);
router.use('/friends', verifyToken, friendRoute);
router.use('/messages',verifyToken,messageRoute);
router.use('/comments',verifyToken,commentRoute);
router.use('/rating',verifyToken,ratingRoute);

module.exports = router;