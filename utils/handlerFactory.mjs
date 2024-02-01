import catchAsync from './catch.mjs';
import AppError from './error.mjs';

import queryToMongo from './queryToMongo.mjs';
import sendResponse from './response.mjs';

export function createOne(Model) {
  return catchAsync(async (request, response, next) => {
    const document = await Model.create(request.body);

    sendResponse(document, 201, response);
  });
}

export function getAll(Model) {
  return catchAsync(async (request, response, next) => {
    if (request.params.tourId) request.query.tour = request.params.tourId;

    const { skip, limit, sort, fields, filter } = queryToMongo(request.query);

    const [total, result] = await Promise.all([
      Model.countDocuments(filter),
      Model.find(filter).sort(sort).select(fields).skip(skip).limit(limit),
    ]);

    sendResponse({ total, returned: result.length, result }, 200, response);
  });
}



export function getOne(Model, Option = {}) {
  return catchAsync(async (request, response, next) => {
    let query = Option.query
      ? Model.findOne({ [Option.query]: request.params[Option.query] })
      : Model.findById(request.params.id);

    if (Option.populate) query = query.populate(Option.populate);
    query = query.select('-__v');

    const document = await query;

    if (!document) return next(new AppError('No document found!!!', 404));

    sendResponse(document, 200, response);
  });
}

export function updateOne(Model) {
  return catchAsync(async (request, response, next) => {
    const updateOption = {
      new: true, // return the new Update document to client
      runValidators: true, // run the validator
    };

    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      updateOption,
    );

    if (!document) return next(new AppError('Nije pronađen.', 404));

    sendResponse(document, 200, response);
  });
}

export function deleteOne(Model) {
  return catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);

    if (!document) return next(new AppError('Nije pronađeno', 404));

    sendResponse(undefined, 204, response);
  });
}

export function getDistinctValueAndCount(Model, value) {
  return catchAsync(async (request, response, next) => {
    const document = await Model.aggregate([
      {
        $unwind: `$${value}`,
      },
      {
        $group: {
          _id: `$${value}`,
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          value: '$_id',
          _id: 0,
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    sendResponse(document, 200, response);
  });
}
