import mongoose from 'mongoose';

const CallAnalysisParams = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInformation',
    required: true
  },
  analysisQuery: {
    type: String,
    required: true
  },
  systemPromptFileName: {
    type: String,
    required: true
  },
  parameters: {
    type: Array,
    required: true
  }
});

export default mongoose.models.CallAnalysisParams || mongoose.model('CallAnalysisParams', CallAnalysisParams);