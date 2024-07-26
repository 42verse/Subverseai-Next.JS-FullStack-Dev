import dbConnect from "@/app/lib/dbConnect";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await dbConnect();
    const body = await req.json();

    const USER_ID = process.env.TELE_USER_ID;
    const TOKEN = process.env.TELE_TOKEN;
    const FROM_TYPE = "agent";
    const AGENT_ID = body.agentId;
    const TO_NUMBER = body.contactNumber.replace(/^91/,'');
    
    if(!AGENT_ID || !TO_NUMBER){
        console.log('Call Action >>> Agent Name or contact number is missing')
        return;
    }

    console.log('>>>> Call Action');
    console.log('AGENT_ID',AGENT_ID) 
    console.log('TO_NUMBER',TO_NUMBER) 

    const response = await axios.get(`https://s-ct3.sarv.com/v2/clickToCall/para?user_id=${USER_ID}&token=${TOKEN}&fromType=${FROM_TYPE}&from=${AGENT_ID}&to=${TO_NUMBER}`,{headers: {'cache-control': 'no-cache'}});
    console.log('response: ',response.data);

    if(response.data?.status === "error"){
        return NextResponse.json({ error: response.data?.message || 'Something went wrong' });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.log(">>> Call Action error : ",error)
    return NextResponse.json({ error: 'Call action error >>>' });
  }
}