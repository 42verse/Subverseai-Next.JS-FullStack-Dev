import mongoose from 'mongoose';

const CustomerInformationSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  policyId: {
    type: Number,
    required: true
  },
  customerNumber: {
    type: String,
    required: true,
  },
  policyLink: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInformation',
    required: true
  },
  agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInformation',
      required: true
  }
});

export default mongoose.models.CustomerInformation || mongoose.model('CustomerInformation', CustomerInformationSchema);