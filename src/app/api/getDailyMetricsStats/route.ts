import dbConnect from "@/app/lib/dbConnect";
import UserInformation from "@/app/models/UserInformation";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        await dbConnect();
        const body = await request.json();
        const companyId = body.companyId;
        const findCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};

        const fromDate = new Date();
        //FOR TESTING: TODO REMOVE ONCE CHECKED
        fromDate.setDate(29);
        fromDate.setMonth(6)
        //FOR TESTING: TODO REMOVE fromDate ONCE CHECKED
        const toDate = new Date(fromDate);
        fromDate.setHours(0,0,0,0);
        toDate.setHours(23,59,59,999);
        const filterCondition = {convertedCallTime: {$gte: fromDate, $lte: toDate}}

        const chartData = await UserInformation.aggregate([
            {$match: findCondition},
            {
                $lookup:{
                    from: 'usercalls',
                    localField: '_id',
                    foreignField: 'agentId',
                    pipeline: [
                        {
                            $addFields: {
                                convertedCallTime : {$toDate: '$Call_Time'},
                                convertedCallStatus : {$toLower: '$Call_Status'}
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
                    callsHandled: {
                        $sum:  {
                            $cond:[ {$and: [{$ifNull: ['$userCalls', false]},{$ne: ['$userCalls.convertedCallStatus','']}]},1,0]
                        },
                    },
                    totalCallDurationInSec: {
                        $sum:  '$userCalls.Call_Duration',
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    agentName: '$_id',
                    callsHandled: 1,
                    avgCallDurationInMins: {
                        $cond: [
                            {$ne: ['$callsHandled',0]},
                            {$round: [{$divide: [{$divide: ['$totalCallDurationInSec',60]}, '$callsHandled']}, 2]},
                            0
                        ]
                    }
                }
            }
        ])

        return NextResponse.json({chartData});
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from get agent performance overview stats API" });
    }
}