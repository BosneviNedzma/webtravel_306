import mongoose from 'mongoose';
import Question from '../models/questionModel.mjs';

export const getQuestionsForTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ error: 'Netacan format.' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Nije autorizovano.' });
    }

    const questions = await Question.find({ tour: tourId });

    res.status(200).json({
      status: 'success',
      data: {
        questions,
      },
    });
  } catch (error) {
    console.error('Greska:', error);
    res.status(500).json({ error: 'Greska.' });
  }
};

export const removeQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ error: 'Netacan format.' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Nije autorizovano.' });
    }

    const removedQuestion = await Question.findByIdAndRemove(questionId);

    if (!removedQuestion) {
      return res.status(404).json({ error: 'Nije moguce pronaci.' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Greska prilikom brisanja pitanja:', error);
    res.status(500).json({ error: 'Greska.' });
  }
};
