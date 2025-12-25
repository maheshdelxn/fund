// models/Member.js
import mongoose from 'mongoose';

const loanHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['initial', 'additional'],
    required: true
  },
  guarantors: [{
    type: String,
    trim: true
  }],
  monthlyData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlyData'
  }
}, { _id: false });

const memberSchema = new mongoose.Schema({
  serialNo: {
    type: String,
    // required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide member name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  isBorrower: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  borrowedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currentPrincipal: {
    type: Number,
    default: 0,
    min: 0
  },
  penaltyApplied: {
    type: Boolean,
    default: false
  },
  loanHistory: [loanHistorySchema],
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalBorrowed: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
memberSchema.index({ serialNo: 1 });
memberSchema.index({ email: 1 });
memberSchema.index({ phone: 1 });
memberSchema.index({ isActive: 1 });

// Virtual for display serial number
memberSchema.virtual('displaySerialNo').get(function() {
  return this.serialNo;
});

// Method to sync totalBorrowed with borrowedAmount - FIXED
memberSchema.pre('save', function() {
  if (this.isModified('borrowedAmount')) {
    this.totalBorrowed = this.borrowedAmount;
  }
});
delete mongoose.models.Member
// Prevent model recompilation
const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);

export default Member;