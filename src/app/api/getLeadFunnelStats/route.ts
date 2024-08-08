import { ECallDispositions, ECallStatuses, ELeadStatuses, EPresentationGiven } from "@/app/interfaces/user-calls.interface";
import dbConnect from "@/app/lib/dbConnect";
import CustomerInformation from "@/app/models/CustomerInformation";
import Usercall from "@/app/models/Usercall";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const getStats = (statsData: Array<any>, enumData: any, key: any,title: string) => {
    const allValues = Object.values(enumData).filter(value => value !== "all").map((value:any) => value.replace(/_/g, ' ').toLowerCase());
    const stats:Array<{[x: number]: string,userCalls: number,fill: string}> = [];
    const chartConfig:any = {userCalls: {label: 'calls'}};

    for (let index = 0; index < allValues.length; index++) { 
        const totalCount = (statsData.find(data => data._id === allValues[index])?.totalCount as number) || 0;
        stats.push({
            [key as number]: (allValues[index] as string),
            userCalls: (totalCount as number),
            fill:  `hsl(var(--chart-${index+1}))`
        })

        chartConfig[allValues[index]] = {
            label: `${allValues[index]} (${totalCount})`
        }
    }

    const showNoData = stats.every(data => data.userCalls === 0);

    return {chartData: stats,dataKey: 'userCalls', nameKey: key, title, showNoData,chartConfig};
}

export async function POST(request: NextRequest, response: NextResponse) {
    try {
        await dbConnect();
        const body = await request.json();
        const companyId = body.companyId;
        const agentId = body.agentId || '';
        const findCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};
        if(agentId){
            findCondition.agentId= new mongoose.Types.ObjectId(agentId);
        }

        const callStatusFrequencyStats = await Usercall.aggregate([
            {$match: findCondition},
            {
                $addFields: {
                    convertedCallStatus : {$toLower: '$Call_Status'},
                }
            },
            {
                $match: {convertedCallStatus: {$ne: ''}}
            },
            {
                $group: {
                    _id: '$convertedCallStatus',
                    totalCount: {$sum: {$cond: [{$ifNull: ['$convertedCallStatus', false]},1,0]}}
                }
            }
        ]);
        const presentationGivenFrequencyStats = await Usercall.aggregate([
            {$match: findCondition},
            {
                $addFields: {
                    convertedPresentationGiven : {$toLower: '$Analysis.presentation_given'}
                }
            },
            {
                $match: {convertedPresentationGiven: {$ne: ''}}
            },
            {
                $group: {
                    _id: '$convertedPresentationGiven',
                    totalCount: {$sum: {$cond: [{$ifNull: ['$convertedPresentationGiven', false]},1,0]}}
                }
            }
        ]);
        const callDispositionFrequencyStats = await Usercall.aggregate([
            {$match: findCondition},
            {
                $addFields: {
                   convertedCallDisposition : {$toLower: '$Analysis.call_disposition'}
                }
            },
            {
                $match: {convertedCallDisposition: {$ne: ''}}
            },
            {
                $group: {
                    _id: '$convertedCallDisposition',
                    totalCount: {$sum: {$cond: [{$ifNull: ['$convertedCallDisposition', false]},1,0]}}
                }
            }
        ]);
        const leadStatusFrequencyStats = await Usercall.aggregate([
            {$match: findCondition},
            {
                $addFields: {
                    convertedLeadStatus : {$toLower: '$Analysis.lead_status'}
                }
            },
            {
                $match: {convertedLeadStatus: {$ne: ''}}
            },
            {
                $group: {
                    _id: '$convertedLeadStatus',
                    totalCount: {$sum: {$cond: [{$ifNull: ['$convertedLeadStatus', false]},1,0]}}
                }
            } 
        ]);

        const findCustomerNumbers = (await Usercall.find(findCondition,{Customer_Number: 1})).map(data => data.Customer_Number);
        const totalPendingCallsCountFromCustomerInfo = await CustomerInformation.countDocuments({...findCondition, customerNumber: {$nin: findCustomerNumbers}})
        const totalPendingCallsCountFromUserCalls = await Usercall.countDocuments({...findCondition, $or: [{Call_Status: {$exists: false}},{Call_Status: {$eq: ''}}]})
        callStatusFrequencyStats.push({_id: 'pending calls', totalCount: (totalPendingCallsCountFromCustomerInfo+totalPendingCallsCountFromUserCalls)})

        const chartsData = [];
        chartsData.push(getStats(callStatusFrequencyStats,ECallStatuses,'callStatus','Call Status'));
        chartsData.push(getStats(callDispositionFrequencyStats, ECallDispositions, 'callDisposition','Call Disposition'));
        chartsData.push(getStats(presentationGivenFrequencyStats, EPresentationGiven, 'presentationGiven','Presentation Given'));
        chartsData.push(getStats(leadStatusFrequencyStats, ELeadStatuses, 'leadStatus','Lead Status'));
        
        return NextResponse.json({chartsData});
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from get agent performance overview stats API" });
    }
}