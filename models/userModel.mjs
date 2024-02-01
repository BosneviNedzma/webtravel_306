import { randomBytes, createHash } from 'node:crypto';
import { Schema, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Molim vas da navedete ime.'],
    trim: true,
    maxlength: [20, 'Ime mora imati manje od 21 znaka.'],
    minlength: [5, 'Ime mora imati više od 4 znaka.'],
  },
  email: {
    type: String,
    required: [true, 'Molim vas da navedete email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Molim vas da tačan mail.'],
    uniqueCaseInsensitive: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  password: {
    type: String,
    required: [true, 'Molim vas da navedete lozinku.'],
    minlength: [8, 'Lozinka mora imati više od 7 znakova.'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Potvrdite lozinku.'],
    validate: {
      validator(element) {
        return element === this.password;
      },
      message: 'Lozinke nisu iste.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.plugin(uniqueValidator, {
  message: 'Greska.',
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 13);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.methods.toAuthJSON = function () {
  return {
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

userSchema.methods.comparePassword = async (
  candidatePassword,
  userPassword,
) => {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  return result;
};

userSchema.methods.changedPasswordAfterToken = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Number.parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp; 
  }

  return false; 
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = randomBytes(32).toString('hex'); 

  this.passwordResetToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
  return resetToken;
};

const User = model('User', userSchema);
export default User;
