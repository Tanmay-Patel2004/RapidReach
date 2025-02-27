const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, "Role is required"]
  },
  profilePicture: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Basic phone number validation - can be customized based on your needs
        return /^\+?[\d\s-()]+$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    unitNumber: {
      type: String,
      trim: true
    },
    province: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Basic postal/ZIP code validation - can be customized based on your needs
          return /^[A-Za-z0-9\s-]+$/.test(v);
        },
        message: props => `${props.value} is not a valid postal/ZIP code!`
      }
    }
  }
}, {
  timestamps: true
});

// 🔹 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
