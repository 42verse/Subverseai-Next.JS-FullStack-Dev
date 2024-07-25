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
        const findUserCallCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};
        if(agentId){
            findUserCallCondition.agentId = new mongoose.Types.ObjectId(agentId)
        }

        console.log(Call_ID);
        console.log(companyId);
        console.log(agentId);
        await dbConnect();

        const data = await Usercall.find(findUserCallCondition).select('Transcript Summary Analysis');
        const transcriptWithSpeakers = typeof data[0].Transcript === 'string' && data[0].Transcript ? JSON.parse(data[0].Transcript) : data[0].Transcript || [];
        const jsonconvertedsummary = typeof data[0].Summary === 'string' && data[0].Summary ? JSON.parse(data[0].Summary) : data[0].Summary || [];
        const jsonconvertedanalysis = typeof data[0].Analysis === 'string' && data[0].Analysis ? JSON.parse(data[0].Analysis) : data[0].Analysis || [];

        return NextResponse.json({ transcriptWithSpeakers, jsonconvertedsummary, jsonconvertedanalysis });
    }
    catch (e) {
        return NextResponse.json("Error in fetching data from getcalldata API");
    }

}