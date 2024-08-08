export const userCallExcelHeaders = {
    customerName: 'Customer Name',
    customerCallId: 'Call ID',
    customerNumber: 'Customer Number',
    customerEmail: 'Customer Email',
    customerCity: 'Customer City',
    customerState: 'Customer State',
    policyNo: 'Policy No',
    agentName: 'Agent Name',
    callTime: 'Call Time',
    callStatus: 'Call Status',
    callDuration: 'Call Duration (in sec.)',
    callRecordingUrl: 'Call Recording URL',
    summary: 'Summary',
    presentationGiven: 'Presentation Given',
    policyPitched: 'Policy Pitched',
    callDisposition: 'Call Disposition',
    leadStatus: 'Lead Status',
    callBackTime: 'Call Back Time',
    deadAir: 'Dead Air',
    remarks: 'Remarks'
}

export const parseCallData = (customerWithUserCall: Array<any>) => {
    const parsedData = [];

    for (let index = 0; index < customerWithUserCall.length; index++) {
        const data = customerWithUserCall[index];

        parsedData.push([
            data.customerDetails?.customerName || '-',
            data.userCallDetails?.Call_ID || '-',
            data.userCallDetails?.Customer_Number || '-',
            data.customerDetails?.email || '-',
            data.customerDetails?.city || '-',
            data.customerDetails?.state || '-',
            data.customerDetails?.policyId ? { hyperlink: data.customerDetails.policyLink, text:  String(data.customerDetails.policyId)} : '-',
            data.userCallDetails?.Agent_Name || '-',
            data.userCallDetails?.Call_Time || '-',
            data.userCallDetails?.Call_Status || '-',
            data.userCallDetails?.Call_Duration || '-',
            data.userCallDetails?.Call_Recording_URL ? { hyperlink: data.userCallDetails.Call_Recording_URL, text: 'Click here'}  : '-',
            data.userCallDetails?.Summary || '-',
            data.userCallDetails?.Analysis?.presentation_given || '-',
            data.userCallDetails?.Analysis?.policy_pitched || '-',
            data.userCallDetails?.Analysis?.call_disposition || '-',
            data.userCallDetails?.Analysis?.lead_status || '-',
            data.userCallDetails?.Analysis?.call_back_time || '-',
            data.userCallDetails?.Analysis?.dead_air || 0,
            data.userCallDetails?.Analysis?.remarks || '-',
        ])
    }

    return parsedData;
}