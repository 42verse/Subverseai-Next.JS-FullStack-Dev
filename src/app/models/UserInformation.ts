import mongoose from 'mongoose';
import { EUserRole } from '../interfaces/user.interface';

const UserInformationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  credits: {
    type: Number
  },
  role: {
    type: String,
    enum: EUserRole,
    default: EUserRole.USER
  }
});

export default mongoose.models.UserInformation || mongoose.model('UserInformation', UserInformationSchema);