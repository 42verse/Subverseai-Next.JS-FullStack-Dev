import dbConnect from "@/app/lib/dbConnect";
import UserInformation from "@/app/models/UserInformation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        await dbConnect();
        const body = await req.json();
        const companyId = body.companyId;

        if(!companyId){
            return NextResponse.json({ error: "company id is missing" });
        }

        const agents = await UserInformation.find({companyId: companyId}).select("name username");

        return NextResponse.json({agents: agents})
    } catch (e) {
        return NextResponse.json({ error: "Error in fetching data from getcalldata API" });
    }
}