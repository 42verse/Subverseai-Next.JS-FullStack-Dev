import { NextRequest, NextResponse } from "next/server";
import dbConnect from '../../lib/dbConnect';
import Usercall from '../../models/Usercall';
import mongoose from "mongoose";
import CustomerInformation from "@/app/models/CustomerInformation";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        await dbConnect();
        const body = await req.json();
        const companyId = body.companyId;
        const agentId = body.agentId || "";
        const findCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};
        if(agentId){
            findCondition.agentId = new mongoose.Types.ObjectId(agentId)
        }

        const userCallsByCustomerNumber = await Usercall.aggregate([
            {
                $match: findCondition
            },
            {
                $group: {
                    _id: '$Customer_Number',
                    userCalls: {$addToSet: {
                        agentName: '$Agent_Name',
                        callID: '$Call_ID',
                        callStatus: '$Call_Status',
                        callTime: '$Call_Time',
                        callRecordingURL: '$Call_Recording_URL',
                        analysis: '$Analysis'
                    }}
                }
            }
        ])

        const customersData:any = await CustomerInformation.find(findCondition).select('customerName customerNumber state city email policyId policyLink');
        const customerWithUserCalls = [];
        for (let index = 0; index < customersData.length; index++) {
           const findUserCallsByCustomerNumber = userCallsByCustomerNumber.find(data => data._id === customersData[index].customerNumber);
           const userCalls = findUserCallsByCustomerNumber ? findUserCallsByCustomerNumber.userCalls : [];
           customerWithUserCalls.push({ ...customersData[index].toObject(), userCalls })
        }

        return NextResponse.json(customerWithUserCalls)
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from getcalldata API" });
    }
}
