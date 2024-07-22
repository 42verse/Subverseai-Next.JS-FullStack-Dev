import { NextRequest, NextResponse } from "next/server";
import dbConnect from '../../lib/dbConnect';
import Usercall from '../../models/Usercall';
import mongoose from "mongoose";


export async function POST(req: NextRequest, res: NextResponse) {
    try {

        const body = await req.json();
        const Call_ID = body.Call_ID;
        const companyId = body.companyId;

        console.log(Call_ID);
        console.log(companyId);
        await dbConnect();

        const data = await Usercall.find({Call_ID,companyId: new mongoose.Types.ObjectId(companyId)}).select('Transcript Summary Analysis');
        
        const transcriptWithSpeakers = JSON.parse(data[0].Transcript);
        const jsonconvertedsummary = JSON.parse(data[0].Summary);
        const jsonconvertedanalysis = JSON.parse(data[0].Analysis);

        return NextResponse.json({ transcriptWithSpeakers, jsonconvertedsummary, jsonconvertedanalysis });
    }
    catch (e) {
        return NextResponse.json("Error in fetching data from getcalldata API");
    }

}