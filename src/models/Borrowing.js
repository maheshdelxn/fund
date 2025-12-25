// models/Borrowing.js
import mongoose from 'mongoose';

const borrowingSchema = new mongoose.Schema({
  monthlyData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MonthlyData',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide borrowing amount'],
    min: [0, 'Amount cannot be negative']
  },
  guarantors: [{
    type: String,
    trim: true
  }],
  borrowingDate: {
    type: Date,
    default: Date.now
  },
  previousPrincipal: {
    type: Number,
    default: 0
  },
  newPrincipal: {
    type: Number,
    required: true
  },
  loanType: {
    type: String,
    enum: ['initial', 'additional'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  interestRate: {
    type: Number,
    default: 3
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
borrowingSchema.index({ monthlyData: 1, member: 1 });
borrowingSchema.index({ borrowingDate: -1 });
borrowingSchema.index({ status: 1 });

delete mongoose.models.Borrowing
const Borrowing = mongoose.models.Borrowing || mongoose.model('Borrowing', borrowingSchema);

export default Borrowing;