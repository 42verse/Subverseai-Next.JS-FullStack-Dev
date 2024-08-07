import { ECallStatuses, ELeadStatuses, ETimeFilter } from "@/app/interfaces/user-calls.interface";
import dbConnect from "@/app/lib/dbConnect";
import UserInformation from "@/app/models/UserInformation";
import { activeLeadStatusValues } from "@/utils/usercalls.utils";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        await dbConnect();
        const body = await request.json();
        const companyId = body.companyId;
        const findCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};
        const timeFilter = body.timeFilter || "";

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

        const chartData = await UserInformation.aggregate([
            {
                $match: findCondition
            },
            {
                $lookup:{
                    from: 'usercalls',
                    localField: '_id',
                    foreignField: 'agentId',
                    pipeline: [
                        {
                            $addFields: {
                                convertedCallTime : {$toDate: '$Call_Time'},
                                convertedCallStatus : {$toLower: '$Call_Status'},
                                convertedLeadStatus : {$toLower: '$Analysis.lead_status'},
                            }
                        },
                        {
                            $match: filterCondition
                        }
                    ],
                    as: 'userCalls',
                }
            },
            {
                $unwind: {
                    path: '$userCalls',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$name',
                    customersReached: {
                        $sum:  {
                            $cond:[ {$and: [{$ifNull: ['$userCalls', false]},{$ne: ['$userCalls.convertedCallStatus','']}]},1,0]
                        },
                    },
                    customerDiscussions: {
                        $sum:  {
                            $cond:[ {$eq: ['$userCalls.convertedCallStatus', ECallStatuses.CALL_ANSWERED.replace(/_/g," ")]},1,0]
                        },
                    },
                    activeLeads: {
                        $sum:  {
                            $cond:[ {$in: ['$userCalls.convertedLeadStatus', activeLeadStatusValues]},1,0]
                        },
                    },
                    paymentDone: {
                        $sum:  {
                            $cond:[ {$eq: ['$userCalls.convertedLeadStatus', ELeadStatuses.PAYMENT_DONE.replace(/_/g," ")]},1,0]
                        },
                    },
                }
            }
        ]);

        return NextResponse.json({chartData});
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from get agent performance overview stats API" });
    }
}