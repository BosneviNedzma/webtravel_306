import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/userModel.mjs';
import catchAsync from '../utils/catch.mjs';
import AppError from '../utils/error.mjs';

const { sign, verify } = jsonwebtoken;

const createAndSendToken = (user, statusCode, response) => {
  const token = sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  response.status(statusCode).json({
    status: 'success',
    data: {
      user: user.toAuthJSON(),
      token,
    },
  });
};

export const signup = catchAsync(async (request, response, next) => {
  const { name, email, password, passwordConfirm } = request.body;
  
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  createAndSendToken(newUser, 201, response);
});

export const login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  if (!email || !password)
    return next(new AppError("Molim vas da pružite e-mail i šifru!", 400));


  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password)))
    return next(new AppError("Netočan e-mail ili lozinka!", 401));

  if (user.status !== 'active') {
    return next(new AppError("Vaš račun je neaktivan. Molimo vas da kontaktirate podršku.", 401));
  }
  createAndSendToken(user, 200, response);
});

export const protect = catchAsync(async (request, response, next) => {
  let token;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError(
        "Niste prijavljeni. Molimo vas da se prijavite kako biste dobili pristup.",
        401,
      ),
    );

  const verifiedToken = await promisify(verify)(token, process.env.JWT_SECRET); 

  const user = await User.findById(verifiedToken.id);

  if (!user)
    return next(new AppError("Ovaj korisnik više ne postoji.", 401));

  if (user.changedPasswordAfterToken(verifiedToken.iat))
    return next(
      new AppError(
        "Korisnik je nedavno promijenio lozinku. Molimo vas da se ponovno prijavite kako biste dobili pristup.",
        401,
      ),
    );

  request.user = user; 

  next();
});

export function restrictTo(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role))
      return next(
        new AppError(
          'Nema dozvolu.',
          403,
        ),
      );
    next();
  };
}

export const forgotPassword = catchAsync(async (request, response, next) => {

  const user = await User.findOne({ email: request.body.email });

  if (!user)
    return next(new AppError('Nema korisnika s ovom adresom.', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); 

  const resetURL = `${request.protocol}://${request.get(
    'host',
  )}/users/resetPassword/${resetToken}`;

  const message = `Zaboravili ste lozinku? Pošaljite PATCH zahtjev sa vašom novom lozinkom i potvrdom lozinke na: ${resetURL}.\nAko niste zaboravili lozinku, molimo vas da zanemarite ovaj email!`;

  try {
    await sendEmail({
      name: user.name,
      email: user.email,
      subject: 'Reset token za lozinku.',
      message,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'Greska, pokusajte ponovo kasnije.',
        500,
      ),
    );
  }

  createAndSendToken(user, 200, response);
});

export const resetPassword = catchAsync(async (request, response, next) => {
  const hashedToken = createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, 
  });
  

  if (!user) next(new AppError('Token nije moguće upotrijebiti.', 400));

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined; 
  user.passwordResetExpires = undefined; 

  await user.save(); 
  createAndSendToken(user, 200, response);
});

export const updatePassword = catchAsync(async (request, response, next) => {

  const user = await User.findById(request.user.id).select('+password');

  if (!(await user.comparePassword(request.body.oldPassword, user.password)))
    return next(new AppError('Pogrešna lozinka.', 401));

  user.password = request.body.newPassword;
  user.passwordConfirm = request.body.passwordConfirm;

  await user.save();

  createAndSendToken(user, 200, response);
});

export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'admin') {
    return next(new AppError('Samo administrator može ažurirati status korisnika.', 403));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError('Korisnik nije pronađen.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
