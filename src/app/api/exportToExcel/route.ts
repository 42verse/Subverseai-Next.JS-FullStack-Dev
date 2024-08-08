import { NextRequest, NextResponse } from "next/server";
import dbConnect from '../../lib/dbConnect';
import Usercall from '../../models/Usercall';
import mongoose from "mongoose";
import CustomerInformation from "@/app/models/CustomerInformation";
import { ETimeFilter } from "@/app/interfaces/user-calls.interface";
import { parseCallData, userCallExcelHeaders } from "@/utils/export.utils";
import ExcelJS from 'exceljs';

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        await dbConnect();
        const body = await req.json();
        const companyId = body.companyId;
        const agentId = body.agentId || "";
        const findCondition:any = {companyId: new mongoose.Types.ObjectId(companyId)};
        if(agentId){
            findCondition.agentId = new mongoose.Types.ObjectId(agentId)
        }

        const search = body.search || "";
        const findCustomerCondition:any = {...findCondition};
        if(search){
            const searchRegex = new RegExp(search,'i');
            findCustomerCondition.$or = [
                { customerName: searchRegex },
                { convertedCustomerNumber: searchRegex },
                { convertedPolicyId: searchRegex }
            ];
        }

        const customersData = await CustomerInformation.aggregate([
            {
                $addFields: {
                    convertedCustomerNumber: {$toString: '$customerNumber'},
                    convertedPolicyId: {$toString: '$policyId'}
                }
            },
            {
                $match: findCustomerCondition,
            },
            {
                $project: {
                    customerName: 1, 
                    customerNumber: 1,
                    state: 1,
                    city: 1,
                    email: 1,
                    policyId: 1,
                    policyLink: 1,
                }
            }
        ]);

        if(search){
            findCondition.Customer_Number = {$in: [...customersData.map((customer) => customer.customerNumber), search]}
        }

        const timeFilter = body.timeFilter || "";
        const callStatus = body.callStatus || "";
        const presentationGiven = body.presentationGiven || "";
        const leadStatus = body.leadStatus || "";
        const callDisposition = body.callDisposition || [];

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
        
        if(presentationGiven){
            filterCondition.convertedPresentationGiven = presentationGiven;
        }
        if(leadStatus){
            filterCondition.convertedLeadStatus = leadStatus.replace(/_/g," ");
        }
        if(callDisposition.length){
            filterCondition.convertedCallDisposition = {$in: callDisposition.map((value:string) => value.replace(/_/g," "))}
        }
        if(callStatus){
            filterCondition.convertedCallStatus = callStatus.replace(/_/g," ");    
        }

        const userCallsByCustomerNumber = await Usercall.aggregate([
            {
                $match: findCondition
            },
            {
                $addFields : {
                    convertedCallTime : {$toDate: '$Call_Time'},
                    convertedCallStatus : {$toLower: '$Call_Status'},
                    convertedPresentationGiven : {$toLower: '$Analysis.presentation_given'},
                    convertedLeadStatus : {$toLower: '$Analysis.lead_status'},
                    convertedCallDisposition : {$toLower: '$Analysis.call_disposition'}
                }
            },
            {
                $match: filterCondition
            },
            {
                $sort: { convertedCallTime: -1}
            },
            {
                $project: {
                    Transcript: 0,
                    convertedCallTime: 0,
                    convertedCallStatus: 0,
                    convertedPresentationGiven: 0,
                    convertedLeadStatus: 0,
                    convertedCallDisposition: 0,
                    agentId: 0,
                    companyId: 0,
                    _id: 0
                }
            }
        ])

        if(userCallsByCustomerNumber.length === 0){
            return NextResponse.json({ error: "Cannot export, No user calls found!" });
        }

        const customerWithUserCalls:any[] = [];
        for (let index = 0; index < userCallsByCustomerNumber.length; index++) {
           const findCustomerDetails = customersData.find((data:any) => data.customerNumber === userCallsByCustomerNumber[index].Customer_Number);
           const userCallDetails = userCallsByCustomerNumber[index];
           const customerDetails = findCustomerDetails ? findCustomerDetails : {customerNumber: userCallsByCustomerNumber[index].Customer_Number};

           customerWithUserCalls.push({ customerDetails, userCallDetails })
        }

        const excelData = parseCallData(customerWithUserCalls);
 
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User calls');
        worksheet.columns = Object.entries(userCallExcelHeaders).map((value) => {return {header: value[1], key: value[0], width: 20}})
        worksheet.addRows(excelData);

        const linkStyle = { underline: true, color: { argb: 'FF0000FF' } };
        const policyLinkCell = 'G';
        const recordingUrlCell = 'L';
        for (let index = 0; index < excelData.length; index++) {
            if (excelData[index][6] !== '-') {
                const currentPolicyNoCell = worksheet.getCell(`${policyLinkCell}${index + 2}`);
                currentPolicyNoCell.font = { ...currentPolicyNoCell.font, ...linkStyle };
            }

            if (excelData[index][11] !== '-') {
            const currentRecordingUrlCell = worksheet.getCell(`${recordingUrlCell}${index + 2}`);
            currentRecordingUrlCell.font = { ...currentRecordingUrlCell.font, ...linkStyle };}
        }

        const excelBuffer = await workbook.xlsx.writeBuffer();
  
        const response = new NextResponse(excelBuffer);
        response.headers.set('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.headers.set('Content-Disposition', `attachment;filename=user-calls-${new Date()}.xlsx`);
        return response;
    } catch (e) {
        return NextResponse.json({ error: "Error in while exporting data to excel" });
    }
}
