import User from '../models/userModel.mjs';
import catchAsync from '../utils/catch.mjs';
import AppError from '../utils/error.mjs';
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
  getDistinctValueAndCount,
} from '../utils/handlerFactory.mjs';

const { findByIdAndUpdate } = User;

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User); 
export const deleteUser = deleteOne(User);

export function getMe(request, response, next) {
  request.params.id = request.user.id;
  next();
}

export const getRoleAndCount = getDistinctValueAndCount(User, 'role');

export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('Korisnik nije pronađen', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateMe = catchAsync(async (request, response, next) => {
  const allowedFields = ['name', 'email'];


  for (const element of Object.keys(request.body)) {
    if (!allowedFields.includes(element)) {
      next(
        new AppError(
          `Ova ruta se koristi samo za ažuriranje ${allowedFields}! Molimo vas da pokušate ponovo!`,
          400,
        ),
      );
      continue;
    }
  }

  const updatedUser = await findByIdAndUpdate(
    request.user.id,
    request.body, 
    {
      new: true,
      runValidators: true, 
    },
  );

  response.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (request, response, next) => {
  await findByIdAndUpdate(request.user.id, { active: false });

  response.status(200).json({
    status: 'success',
  });
});

export const getTravelHistory = async (req, res, next) => {
  try {
    const user = req.user; 

    const travelHistory = await Tour.find({ attendees: user._id });

    res.status(200).json({
      status: 'success',
      data: {
        travelHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};