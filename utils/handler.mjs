import AppError from './error.mjs';

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}!!!`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplo polje: ${value}. Molimo koristite drugačije informacije.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((element) => element.message);

  const message = `Netačno polje: ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Netačan token, probajte ponovo.', 401);

const handleJWTExpiredError = () =>
  new AppError('Token je istekao, ulogujte se ponovo.', 401);

const sendErrorDevelopment = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorProduction = (error, response) => {
  if (error.isOperational) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

  }
  console.error('Greska.', error);

  return response.status(500).json({
    status: 'error',
    message: 'Ne idete pravim putem.',
  });
};

export default (error, request, response, next) => {
  error.statusCode = error.statusCode || 500; 
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, response);
  } else if (process.env.NODE_ENV === 'production') {
    let apiError = { ...error };

    if (apiError.name === 'CastError') apiError = handleCastErrorDB(apiError);
    if (apiError.code === 11_000) apiError = handleDuplicateFieldsDB(apiError);
    if (apiError.name === 'ValidationError')
      apiError = handleValidationErrorDB(apiError);
    if (apiError.name === 'JsonWebTokenError') apiError = handleJWTError();
    if (apiError.name === 'TokenExpiredError')
      apiError = handleJWTExpiredError();

    sendErrorProduction(apiError, response);
  }
};
