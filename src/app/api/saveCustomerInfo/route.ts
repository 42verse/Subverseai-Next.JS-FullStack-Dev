import dbConnect from "@/app/lib/dbConnect";
import CustomerInformation from "@/app/models/CustomerInformation";
import UserInformation from "@/app/models/UserInformation";
import axios from "axios";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await dbConnect();
    const body = await req.json();
    const companyId = body.companyId || "";
    const agentId = body.agentId || "";
    
    if(!companyId){
        return NextResponse.json({ error: 'Company id is missing' });
    }
    
    const inputFileUrl = body.inputFileUrl;
    if(!inputFileUrl){
      return NextResponse.json({ error: 'Input file url link' });
    }

    const response = await axios.get(inputFileUrl);
    if(!response.data.data || response.data.data.length === 0){
      return NextResponse.json({ error: 'No data found' });
    }

    const findCompany = await UserInformation.findOne({_id: new mongoose.Types.ObjectId(companyId)}).select('policyLink');
    if(!findCompany?.policyLink){
      return NextResponse.json({ error: 'Company or policy link not found' });
    }

    const policyLink = findCompany.policyLink;
    for (let i = 1; i < response.data.data.length; i++) {
      const customerNumber = response.data.data[i]?.Customer_Number;
      const customerInfo:any = {
        customerName: response.data.data[i]?.Customer_Name || '',
        email: response.data.data[i]?.Customer_Email || '',
        city: response.data.data[i]?.City || '',
        state: response.data.data[i]?.State || '',
        policyId: response.data.data[i]?.Policy_ID || '',
        policyLink: policyLink && response.data.data[i]?.Policy_ID ? `${policyLink}${response.data.data[i]?.Policy_ID}` : ''
      }

      if(!customerNumber){
        console.log('Customer number is missing >>> ')
        console.log(customerInfo)
        continue;
      }

      if(agentId){
        customerInfo.agentId = agentId
      }

      try {
        await CustomerInformation.findOneAndUpdate(
          {
            companyId: new mongoose.Types.ObjectId(companyId),
            customerNumber: customerNumber
          },
          {
            $set: { ...customerInfo }
          },
          {
            upsert: true
          }
        )
        console.log('-------------------------')
        console.log(customerInfo)
      } catch (error) {
        console.log(`Error while updating or inserting customer information`,error);
        continue;
      }
    }

    return NextResponse.json({ message: 'Saved Customer information successfully!' });
  }
  catch (error) {
    console.error("error:", error);
    return NextResponse.json({ error: 'Something went wrong' });
  }
}