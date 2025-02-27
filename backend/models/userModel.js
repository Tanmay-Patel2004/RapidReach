const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password is required only if googleId is not present
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"]
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null,
    validate: {
      validator: function (v) {
        // Skip validation if the value is null or undefined
        if (!v) return true;
        // Basic phone number validation
        return /^\+?[\d\s-()]+$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      default: null
    },
    unitNumber: {
      type: String,
      trim: true,
      default: null
    },
    province: {
      type: String,
      trim: true,
      default: null
    },
    country: {
      type: String,
      trim: true,
      default: null
    },
    zipCode: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          // Skip validation if the value is null or undefined
          if (!v) return true;
          // Basic postal/ZIP code validation
          return /^[A-Za-z0-9\s-]+$/.test(v);
        },
        message: props => `${props.value} is not a valid postal/ZIP code!`
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
