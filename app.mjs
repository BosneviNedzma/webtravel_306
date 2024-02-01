import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { parse } from 'qs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import tourRouter from './routes/tourRouter.mjs';
import userRouter from './routes/userRouter.mjs';
import bookingRouter from './routes/bookingRouter.mjs';

import AppError from './utils/error.mjs';
import globalErrorHandler from './utils/handler.mjs';

const app = express();

app.set('query parser', function (string) {
  return parse(string, {
    comma: true,
    arrayLimit: 30,
  });
});

app.use(helmet());
app.use(cors());


if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    max: 70,
    windowMs: 15 * 60 * 1000,
    handler(request, response, next) {
      next(new AppError('Puno zahtjeva', 421));
    },
  });

  app.use('/api/', limiter);
}

app.use(json({ limit: '20kb' }));

app.use(mongoSanitize()); 
app.use(xss()); 
app.use(
  hpp({
    whitelist: ['duration'],
  }),
); 

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); 
}



app.use('/tours', tourRouter);
app.use('/users', userRouter);
app.use('/book', bookingRouter);


app.all('*', (request, response, next) => {
  next(new AppError(`Nije moguće naći na ovom linku: ${request.originalUrl}`, 404));
});

app.use(globalErrorHandler);

export default app;
