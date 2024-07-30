import mongoose from 'mongoose';

const Usercall = new mongoose.Schema({
    Call_ID: {
        type: String,
        required: true,
        unique: true,
    },
    Customer_ID: {
        type: String,
        required: true,
    },
    Customer_Number: {
        type: String,
        required: true,
    },
    Agent_Name: {
        type: String,
        required: true,
    },
    Call_Status: {
        type: String,
        required: true,
    },
    Call_Time: {
        type: String,
        required: true,
    },
    Call_Recording_URL: {
        type: String,
        required: true,
    },
    Call_Duration: {
        type: Number,
        required: true,
    },
    Usecase : {
        type : String,
        required : true
    },
    Transcript : {
        type : Array<any>,
        required : true
    },
    Summary : {
        type : String,
        required : true
    },
    Analysis : {
        type : Object,
        required : true
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

export default mongoose.models.Usercall || mongoose.model('Usercall', Usercall);