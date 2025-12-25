import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide depositor name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide deposit amount'],
    min: [0, 'Amount cannot be negative']
  },
  shares: {
    type: Number,
    required: [true, 'Please provide number of shares'],
    min: [1, 'Shares must be at least 1']
  },
  shareAmount: {
    type: Number,
    required: true,
    default: function() {
      return this.shares * 5000;
    }
  },
  date: {
    type: Date,
    required: [true, 'Please provide deposit date']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
depositSchema.index({ member: 1 });
depositSchema.index({ date: -1 });
depositSchema.index({ status: 1 });

// Calculate share amount before saving
depositSchema.pre('save', function() {
  if (this.shares && !this.shareAmount) {
    this.shareAmount = this.shares * 1000;
  }
});
delete mongoose.models.Deposit
export default mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);