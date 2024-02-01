import { Router } from 'express';

import {
  getMe,
  getUser,
  updateMe,
  deleteMe,
  getAllUsers,
  getRoleAndCount,
  updateUser,
  updateUserStatus,
  deleteUser,
  getTravelHistory
} from '../controllers/userController.mjs';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} from '../controllers/authController.mjs';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.get('/travel-history', protect, getTravelHistory);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router.route('/role').get(getRoleAndCount);
router.patch('/:userId/updateStatus', updateUserStatus);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;



