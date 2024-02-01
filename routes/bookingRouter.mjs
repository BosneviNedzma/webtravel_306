import express from 'express';
import { createBooking, getBookingHistory } from '../controllers/bookingController.mjs';
import { protect } from '../controllers/authController.mjs';


const router = express.Router();

router.post('/book', protect, createBooking);
router.get('/history', protect, getBookingHistory)
export default router;
