// models/MonthlyData.js
import mongoose from 'mongoose';

const monthlyDataSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  monthName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  collectionDate: {
    type: Date,
    required: true
  },
  totalCollected: {
    type: Number,
    default: 0
  },
  totalGiven: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  paidMembers: {
    type: Number,
    default: 0
  },
  totalMembers: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'current', 'completed', 'archived'],
    default: 'upcoming'
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  borrowings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Borrowing'
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
monthlyDataSchema.index({ month: 1, year: 1 }, { unique: true });
monthlyDataSchema.index({ date: -1 });
monthlyDataSchema.index({ status: 1 });

// Calculate remaining amount before saving - FIXED
monthlyDataSchema.pre('save', function() {
  this.remainingAmount = this.totalCollected - this.totalGiven;
});

// Static method to get or create monthly data
monthlyDataSchema.statics.getOrCreate = async function(month, year) {
  try {
    let monthlyData = await this.findOne({ month, year });
    
    if (!monthlyData) {
      const date = new Date(year, month - 1, 25);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[month - 1];
      
      monthlyData = await this.create({
        month,
        year,
        monthName,
        date,
        collectionDate: date,
        status: 'upcoming'
      });
    }
    
    return monthlyData;
  } catch (error) {
    console.error('Error in getOrCreate:', error);
    throw error;
  }
};
delete mongoose.models.MonthlyData
// Prevent model recompilation
const MonthlyData = mongoose.models.MonthlyData || mongoose.model('MonthlyData', monthlyDataSchema);

export default MonthlyData;