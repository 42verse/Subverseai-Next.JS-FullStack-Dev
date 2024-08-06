import { NextRequest, NextResponse } from "next/server";
import dbConnect from '../../lib/dbConnect';
import Usercall from '../../models/Usercall';
import mongoose from "mongoose";
import CustomerInformation from "@/app/models/CustomerInformation";
import { ECallDispositions, ETimeFilter } from "@/app/interfaces/user-calls.interface";
import { EUserRole } from "@/app/interfaces/user.interface";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        await dbConnect();
        const body = await req.json();
        const companyId = body.companyId;
        const agentId = body.agentId || "";
        const role = body.role || "";
        const isCallHistory = body.isCallHistory;
        const followUps = body.followUps;
        const findCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};
        if(agentId){
            findCondition.agentId = new mongoose.Types.ObjectId(agentId)
        }

        const timeFilter = body.timeFilter || "";
        const callStatus = body.callStatus || "";
        const presentationGiven = body.presentationGiven || "";
        const leadStatus = body.leadStatus || "";
        const callDisposition = body.callDisposition || "";

        let fromDate = null;
        let toDate = null;
        if(timeFilter === ETimeFilter.THIS_MONTH){
            fromDate = new Date();
            fromDate.setDate(1);
            fromDate.setHours(0,0,0,0);

            toDate = new Date();
            toDate.setMonth(toDate.getMonth() + 1);
            toDate.setDate(0);
            toDate.setHours(23,59,59,999);
        }
        if(timeFilter === ETimeFilter.TODAY){
            fromDate = new Date();
            fromDate.setHours(0,0,0,0);

            toDate = new Date();
            toDate.setHours(23,59,59,999);
        }

        const filterCondition:any = {};
        if(fromDate && toDate){
            filterCondition.convertedCallTime = {$gte: fromDate, $lte: toDate}
        }
        
        if(isCallHistory && presentationGiven){
            filterCondition.convertedPresentationGiven = presentationGiven;
        }
        if(isCallHistory && leadStatus){
            filterCondition.convertedLeadStatus = leadStatus.replace(/_/g," ");
        }
        if(!followUps && isCallHistory && callDisposition){
            filterCondition.convertedCallDisposition = callDisposition.replace(/_/g," ");
        }

        const matchCallsDispositions = [
            ECallDispositions.LEAD_GENERATED.replace(/_/g," "),
            ECallDispositions.CALLBACK_REQUESTED.replace(/_/g," "),
        ]

        const groupStage:any = {
            callsAttempted: {
                $sum: {
                    $cond: [ {$ne: ['$Call_Status',""]},1,0]
                }
            },
            pendingCalls: {
                $sum:  {
                    $cond:[ {$eq: ['$Call_Status',""]},1,0]
                }
            },
            followUps: {
                $sum:  {
                    $cond:[ {$in: ['$convertedCallDisposition',matchCallsDispositions]},1,0]
                }
            },
        }

        if(role === EUserRole.COMPANY){
            groupStage.totalCallDuration = {
                $sum: '$Call_Duration'
            }
        }

        const search = body.search || "";
        const findCustomerCondition:any = {...findCondition};
        if(search){
            const searchRegex = new RegExp(search,'i');
            findCustomerCondition.$or = [
                { customerName: searchRegex },
                { convertedCustomerNumber: searchRegex },
                { convertedPolicyId: searchRegex }
            ];
        }

        const customersData = await CustomerInformation.aggregate([
            {
                $addFields: {
                    convertedCustomerNumber: {$toString: '$customerNumber'},
                    convertedPolicyId: {$toString: '$policyId'}
                }
            },
            {
                $match: findCustomerCondition,
            },
            {
                $project: {
                    customerName: 1, 
                    customerNumber: 1,
                    state: 1,
                    city: 1,
                    email: 1,
                    policyId: 1,
                    policyLink: 1,
                }
            }
        ])
        if(search){
            findCondition.Customer_Number = {$in: [...customersData.map((customer) => customer.customerNumber), search]}
        }

        const stats = await Usercall.aggregate([
            {
                $match: findCondition
            },
            {
                $addFields : {
                    convertedCallTime : {$toDate: '$Call_Time'},
                    convertedCallStatus : {$toLower: '$Call_Status'},
                    convertedPresentationGiven : {$toLower: '$Analysis.presentation_given'},
                    convertedLeadStatus : {$toLower: '$Analysis.lead_status'},
                    convertedCallDisposition : {$toLower: '$Analysis.call_disposition'}
                }
            },
            {
                $match: filterCondition
            },
            {
                $group: {
                    _id: '',
                    ...groupStage
                }
            }
        ])

        const userCallStatistics = stats.length > 0 ? stats[0] : {};
        if(userCallStatistics){
            delete userCallStatistics._id;
        }

        if(!followUps && isCallHistory && callStatus){
            filterCondition.convertedCallStatus = callStatus.replace(/_/g," ");    
        }
        if(!isCallHistory){
            filterCondition.convertedCallStatus = "";
        }
        if(followUps && isCallHistory){
            filterCondition.convertedCallDisposition = {$in: followUps}
        }

        const userCallsByCustomerNumber = await Usercall.aggregate([
            {
                $match: findCondition
            },
            {
                $addFields : {
                    convertedCallTime : {$toDate: '$Call_Time'},
                    convertedCallStatus : {$toLower: '$Call_Status'},
                    convertedPresentationGiven : {$toLower: '$Analysis.presentation_given'},
                    convertedLeadStatus : {$toLower: '$Analysis.lead_status'},
                    convertedCallDisposition : {$toLower: '$Analysis.call_disposition'}
                }
            },
            {
                $match: filterCondition
            },
            {
                $sort: { convertedCallTime: -1}
            },
            {
                $group: {
                    _id: '$Customer_Number',
                    userCalls: {
                        $push: {
                            agentName: '$Agent_Name',
                            callID: '$Call_ID',
                            callStatus: '$Call_Status',
                            callTime: '$Call_Time',
                            callRecordingURL: '$Call_Recording_URL',
                            callDuration: '$Call_Duration',
                            analysis: '$Analysis',
                            convertedCallTime: '$convertedCallTime'
                        }
                    },
                },
            },
            {
                $sort: { 'userCalls.0.convertedCallTime': -1}
            },
        ])

       
        const customerWithUserCalls:any[] = [];
        for (let index = 0; index < userCallsByCustomerNumber.length; index++) {
           const findCustomerDetails = customersData.find((data:any) => data.customerNumber === userCallsByCustomerNumber[index]._id);
           const userCalls = userCallsByCustomerNumber[index].userCalls;
           const customerDetails = findCustomerDetails ? findCustomerDetails : {customerNumber: userCallsByCustomerNumber[index]._id};

           customerWithUserCalls.push({ ...customerDetails, userCalls })
        }
        const excludeCustomerNumbers = (await Usercall.find(findCondition).distinct('Customer_Number'));
        const filterCustomersNotInUserCalls = customersData.filter((customer:any) => !excludeCustomerNumbers.includes(customer.customerNumber));
        userCallStatistics.pendingCalls = userCallStatistics?.pendingCalls || 0 + filterCustomersNotInUserCalls.length;
        
        const length = isCallHistory ? 0 : filterCustomersNotInUserCalls.length;
        for (let index = 0; index < length; index++) {
            const customer = filterCustomersNotInUserCalls[index];
            customerWithUserCalls.push({...customer, userCalls: []})
        }

        return NextResponse.json({callData: customerWithUserCalls, callStats: userCallStatistics})
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from getcalldata API" });
    }
}
