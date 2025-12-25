// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
  shareAmount: {
    type: Number,
    required: true,
    default: 1000
  },
  muddalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  interestAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'online'],
    default: 'cash'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  principalBefore: {
    type: Number,
    default: 0
  },
  principalAfter: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['completed', 'reverted'],
    default: 'completed'
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ monthlyData: 1, member: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMode: 1 });

// Update member's total deposits on payment - FIXED
paymentSchema.post('save', async function(doc) {
  try {
    if (doc.status === 'completed') {
      const Member = mongoose.model('Member');
      await Member.findByIdAndUpdate(doc.member, {
        $inc: { totalDeposits: doc.shareAmount }
      });
    }
  } catch (error) {
    console.error('Error updating member deposits:', error);
  }
});
delete mongoose.models.Payment
// Prevent model recompilation
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;