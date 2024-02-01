import Booking from '../models/bookingModel.mjs';
import catchAsync from '../utils/catch.mjs';

export const createBooking = catchAsync(async (req, res, next) => {
  const { tourId } = req.body;
  const { user } = req;

  const booking = await Booking.create({
    tour: tourId,
    user: user._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

export const getBookingHistory = async (req, res) => {
    try {
      const userId = req.user._id;
  
      const bookings = await Booking.find({ user: userId }).populate('tour');
  
      const currentDate = new Date();
      const pastBookings = bookings.filter(booking => new Date(booking.tour.endDate) < currentDate);
  
      res.status(200).json({
        status: 'success',
        data: {
          pastBookings,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'error',
        message: 'Greska.',
      });
    }
  };