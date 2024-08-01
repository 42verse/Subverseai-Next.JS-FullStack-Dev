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
                        callDuration: '$Call_Duration',
                        analysis: '$Analysis'
                    }}
                }
            }
        ])

        const customersData:any = await CustomerInformation.find(findCondition).select('-_id customerName customerNumber state city email policyId policyLink');
        const excludeCustomerNumbers:Array<string> = [];
        //TODO: Give proper type
        const customerWithUserCalls:any[] = [];
        for (let index = 0; index < userCallsByCustomerNumber.length; index++) {
           const findCustomerDetails = customersData.find((data:any) => data.customerNumber === userCallsByCustomerNumber[index]._id);
           const userCalls = userCallsByCustomerNumber[index].userCalls;

           if(findCustomerDetails){
            excludeCustomerNumbers.push(findCustomerDetails.customerNumber);
           }

           const customerDetails = findCustomerDetails ? findCustomerDetails.toObject() : {customerNumber: userCallsByCustomerNumber[index]._id};

           customerWithUserCalls.push({ ...customerDetails, userCalls })
        }
        
        const filterCustomersNotInUserCalls = customersData.filter((customer:any) => !excludeCustomerNumbers.includes(customer.customerNumber))
        filterCustomersNotInUserCalls.forEach((customer:any) => {
            customerWithUserCalls.push({...customer.toObject(), userCalls: []})
        })

        return NextResponse.json(customerWithUserCalls)
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from getcalldata API" });
    }
}
