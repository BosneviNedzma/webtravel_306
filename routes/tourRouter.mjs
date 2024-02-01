import { Router } from 'express';
import {
  getAllTours,
  getDestinationsAndCount,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  addQuestionToTour,
  authenticateUser
} from '../controllers/tourController.mjs';

import {removeQuestion, getQuestionsForTour} from '../controllers/questionController.mjs'
import { protect, restrictTo } from '../controllers/authController.mjs';

const router = Router();

router.route('/destinations').get(getDestinationsAndCount);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin'), createTour);

  router.post('/:tourId/addQuestion', authenticateUser, addQuestionToTour);
  router.delete('/question/:questionId', restrictTo('admin'), removeQuestion);
  router.get('/question/', getQuestionsForTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

export default router;
