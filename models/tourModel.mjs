import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Putovanje mora imati naziv.'],
      unique: true,
      trim: true,
      maxlength: [
        120,
        'Naziv mora imati do 120 karaktera',
      ],
      minlength: [
        10,
        'Naziv mora imati iznad 10 karaktera',
      ],
    },
    slug: { type: String, lowercase: true, unique: true },
    destinations: {
      type: [String],
    },
    duration: {
      type: Number,
      min: [1, 'Više od 1.0'],
      required: [true, 'Mora imati trajanje.'],
      validate: {
        validator: (number) => number.isInteger && number > 0,
        message: 'Mora biti prirodni broj.',
      },
    },
    travelStyle: {
      type: [String],
      required: [true, 'Mora imati.'],
    },
    rating: {
      type: Number,
      default: 0,
      set: (value) => Math.round(value * 10) / 10, 
    },
    price: {
      type: Number,
      required: [true, 'Mora imati.'],
      validate: {
        validator: (number) => number > 0,
        message: 'Mora biti veća od 0.',
      },
    },
    oldPrice: {
      type: Number,
      validate: {
        validator(value) {
          return value > this.price || value === 0;
        },
        message: 'Stara cijena({VALUE}) mora biti veća',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Mora imati.'],
    },
    highlights: {
      type: [String],
      required: [true, 'Mora imati.'],
    },
    imageCover: {
      type: String,
      required: [true, 'Mora imati.'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(), 
      select: false,
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: [true, 'Mora imati.'],
      enum: ['Europa', 'Daleka putovanja', 'Ljetovanje', 'Ostalo'],
    },
    timeline: [
      {
        title: {
          type: String,
          required: [true, "Mora imati."],
        },
        description: {
          type: String,
          required: [true, "Mora imati."],
        },
      },
    ],
    questions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }, 
  },
);

tourSchema.pre('save', function (next) {
  const slugName = slugify(this.name, {
    lower: true,
    locale: 'vi',
    remove: /[!"'()*+./:@~-]/g,
  });

  const randomString = Math.random().toString(36).slice(8);

  this.slug = `${slugName}-${randomString}`;
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
