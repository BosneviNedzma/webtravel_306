import Tour from '../models/tourModel.mjs';
import catchAsync from '../utils/catch.mjs';
import AppError from '../utils/error.mjs';
import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  getDistinctValueAndCount,
} from '../utils/handlerFactory.mjs';

export const getAllTours = getAll(Tour);
export const getTour = getOne(Tour, {
});

export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);


export const getDestinationsAndCount = getDistinctValueAndCount(
  Tour,
  'destinations',
);

export function aliasTopFiveTours(request, response, next) {
  request.query.limit = '5';
  request.query.sort = '-rating,price,-duration';
  request.query.fields = 'name,price,rating,summary, duration';
  next();
}


export const authenticateUser = (req, res, next) => {
  const getUserIdFromToken = (token) => {
    try {
      const secretKey = '+cMuckalic@@@@~224435kfsdjkhjč---.4'; 
      const decodedToken = jwt.verify(token, secretKey);
  
      const userId = decodedToken.userId;
  
      return userId;
    } catch (error) {
      console.error('Token istekao:', error);
      return null;
    }
  };

  const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return null;
    }
  
    const authToken = authHeader.split(' ')[1];
    return authToken;
  };

  const authToken = getTokenFromRequest(req);

  if (!authToken) {
    return res.status(401).json({ error: 'Greska.' });
  }

  const userId = getUserIdFromToken(authToken);

  if (!userId) {
    return res.status(401).json({ error: 'Greska.' });
  }

  req.userId = userId;

  next();
};

export const addQuestionToTour = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const { question } = req.body;


  const userId = req.userId;
  
  const tour = await Tour.findById(tourId);

  if (!tour || !userId) {
    return next(new AppError('Nisu potpuni podaci.', 404));
  }

  tour.questions.push({
    user: userId,
    question,
  });

  await tour.save();

  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
