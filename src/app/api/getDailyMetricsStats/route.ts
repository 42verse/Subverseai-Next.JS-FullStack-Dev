import dbConnect from "@/app/lib/dbConnect";
import UserInformation from "@/app/models/UserInformation";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const chartConfig = {
  callsHandled: {
    label: "Calls Handled",
    color: "hsl(var(--chart-1))",
  },
  avgCallDurationInMins: {
    label: "Avg Call Duration (In Minutes)",
    color: "hsl(var(--chart-2))",
  }
}

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        await dbConnect();
        const body = await request.json();
        const companyId = body.companyId;
        const findCondition = {companyId: new mongoose.Types.ObjectId(companyId)};

        const stats = await UserInformation.aggregate([
            {$match: findCondition},
            {
                $lookup:{
                    from: 'usercalls',
                    localField: '_id',
                    foreignField: 'agentId',
                    pipeline: [
                        {
                            $addFields: {
                                convertedCallStatus : {$toLower: '$Call_Status'}
                            }
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
                    totalNonZeroCallDuration: {
                        $sum: { $cond: [{$and: [{$ifNull: ['$userCalls.Call_Duration',false]},{$ne: ['$userCalls.Call_Duration',0]}]},1,0]}
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    agentName: '$_id',
                    callsHandled: 1,
                    avgCallDurationInMins: {
                        $cond: [
                            {$ne: ['$totalNonZeroCallDuration',0]},
                            {$round: [{$divide: [{$divide: ['$totalCallDurationInSec',60]}, '$totalNonZeroCallDuration']}, 2]},
                            0
                        ]
                    }
                }
            },
            {
                $sort: {
                    agentName: 1
                } 
            }
        ])

        return NextResponse.json({chartData: {stats, chartConfig}});
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from get agent performance overview stats API" });
    }
}