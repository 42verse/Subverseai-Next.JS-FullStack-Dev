import mongoose from 'mongoose';

const CallAnalysisParams = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInformation',
    required: true
  },
  initialQuery: {
    type: String,
    required: true
  },
  analysisQuery: {
    type: String,
    required: true
  },
  summaryQuery: {
    type: String,
    required: true
  },
  systemPromptFileName: {
    type: String,
    required: true
  },
  tableColumns: {
    type: Array<{key: string,label: string}>,
    required: true
  },
  inputFileUrl: {
    type: String,
    required: true
  }
});

export default mongoose.models.CallAnalysisParams || mongoose.model('CallAnalysisParams', CallAnalysisParams);