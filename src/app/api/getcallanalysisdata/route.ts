import { NextRequest, NextResponse } from "next/server";
import dbConnect from '../../lib/dbConnect';
import Usercall from '../../models/Usercall';
import mongoose from "mongoose";


export async function POST(req: NextRequest, res: NextResponse) {
    try {

        const body = await req.json();
        const Call_ID = body.Call_ID;
        const companyId = body.companyId;
        const agentId = body.agentId || "";
        const findUserCallCondition:any = {companyId: new mongoose.Types.ObjectId(companyId), Call_ID};
        if(agentId){
            findUserCallCondition.agentId = new mongoose.Types.ObjectId(agentId)
        }

        console.log(Call_ID);
        console.log(companyId);
        console.log(agentId);
        await dbConnect();

        const data = await Usercall.find(findUserCallCondition,{
            Transcript: 1,
            Summary: 1,
            Analysis: 1,
        })
        const transcriptWithSpeakers = data[0].Transcript.length ? data[0].Transcript : [];
        const jsonconvertedsummary = data[0].Summary ? data[0].Summary : data[0].Summary || [];
        const jsonconvertedanalysis = typeof data[0].Analysis === 'string'  ? JSON.parse(data[0].Analysis) : data[0].Analysis || {};

        return NextResponse.json({ transcriptWithSpeakers, jsonconvertedsummary, jsonconvertedanalysis });
    }
    catch (e) {
        console.log(e)
        return NextResponse.json("Error in fetching data from getcalldata API");
    }

}