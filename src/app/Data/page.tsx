//this is data page
"use client";
import { useState, useRef/* , useEffect */ } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
/* import { Progress } from "@/components/ui/progress"; */
import Link from "next/link";
import Loading from "@/app/components/Loading";
import axios from "axios";
/* import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"; */
import Cookies from "js-cookie";
/* import { headers } from "next/headers"; */
import { EUserRole } from "../interfaces/user.interface";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { CallStatuses, Dispositions, LeadStatuses, PresentationGiven, Time } from "../interfaces/user-calls.interface";
import { Label } from "@/components/ui/label";

interface TranscriptItem {
    transcript: string;
    start: number;
    speaker: number;
}

interface AnalysisItem {
    Customer_Sentiment: {
        score: string;
        detail: string;
    };
    Customer_Intent: {
        score: string;
        detail: string;
    };
    Agent_Empathy: {
        score: string;
        detail: string;
    };
    Agent_Promptness_and_Responsiveness: {
        score: string;
        detail: string;
    };
    Agent_Knowledge: {
        score: string;
        detail: string;
    };
    Call_Flow_Optimization: {
        score: string;
        detail: string;
    };
    Call_Completion_Status: string;
    Issue_Resolved_Status: string;
}

/* interface Userdata {
    Issue_Resolved_Status: any;
    Call_ID: number;
    Agent_Name: string;
    Customer_ID: string;
    Usecase: string;
    Call_Recording_URL: string;
    Analysis: AnalysisItem;

} */


export default function Data() {
    //const [showAudio, setShowAudio] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userdata, setuserdata] = useState<Array<any>>([]);
    const [apianalysis, setApianalysis] = useState<any>();
    const [apisummary, setApisummary] = useState<string[]>([]);
    const [apitranscript, setApitranscript] = useState<TranscriptItem[]>([]);
    const [contactNumber, setContactNumber] = useState("");

    // Function to handle playing audio from a specific time
    const playFromSpecificTime = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            audioRef.current.play();
        }
    };




    const getuserdatafromapi = async () => {
        setIsLoading(true);
        const response = await axios.post("/api/getcalldata",{companyId: Cookies.get('companyId'),agentId: Cookies.get('agentId')});
        setIsLoading(false);
        setuserdata(response.data);
        // console.log(response.data);
    };


    const fetchmyanalysis = async (Call_ID: string) => {
        setIsLoading(true);
        const response = await axios.post("/api/getcallanalysisdata", { Call_ID: Call_ID,companyId: Cookies.get("companyId"),agentId: Cookies.get('agentId') });
        const summary = response.data.jsonconvertedsummary ? response.data.jsonconvertedsummary.split('\n') : [];
        setApisummary(summary);
        setApitranscript(response.data.transcriptWithSpeakers);
        setApianalysis(response.data.jsonconvertedanalysis);
        setIsLoading(false);
        // console.log(response.data);
    };

    const callActionHandler = async (contactNumber: string) => {
        const response = await axios.post("/api/callAction", { contactNumber: contactNumber,agentId: Cookies.get("agentNumber") });
    }

    const handleClickToCallAction = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!contactNumber.trim()){
            return;
        }

        callActionHandler(contactNumber.trim())
    }

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <div></div>
            )}



            <div className="p-2 md:flex justify-between items-center px-5">
                <div className="md:flex items-center w-[50%]">
                    <Link href="/Admin">
                        <Button variant="outline">Back</Button>
                    </Link>
                    <div className="md:px-5">
                        <div className="grid grid-cols-1 md:flex w-full py-2">
                            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border sm:px-8 sm:py-2">
                                <span className="text-xs text-muted-foreground">
                                    Pending Calls
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    123
                                </span>
                            </div>
                            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border sm:px-8 sm:py-2">
                                <span className="text-xs text-muted-foreground">
                                    Calls Attempted
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    111
                                </span>
                            </div>
                            <div className="w-full relative z-30 flex flex-1 flex-col justify-center gap-1 border px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border sm:px-8 sm:py-2">
                                <span className="w-full text-xs text-muted-foreground">
                                    Show Follow-Ups
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    143
                                </span>
                            </div>
                            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border sm:px-8 sm:py-2">
                                <span className="text-xs text-muted-foreground">
                                    Total Call Duration
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    123 
                                    <span className="text-xs text-muted-foreground ml-2">mins</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                

                <Button className=" bg-blue-400 hover:bg-blue-500" onClick={getuserdatafromapi}>Load Data</Button>
            </div>
            <div className="md:flex justify-between px-5">
                <div className="md:flex items-center gap-2 lg:gap-4">
                    <div>
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectItem value={Time.ALL} className="cursor-pointer">{Time.ALL.replace(/_/g, " ")}</SelectItem>
                                <SelectItem value={Time.TODAY} className="cursor-pointer">{Time.TODAY.replace(/_/g, " ")}</SelectItem>
                                <SelectItem value={Time.THIS_MONTH} className="cursor-pointer">{Time.THIS_MONTH.replace(/_/g, " ")}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>  
                    </div>

                    <div>
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px] my-2 md:my-0">
                                <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectItem value="Agent1" className="cursor-pointer">Agent 1</SelectItem>
                                <SelectItem value="Agent2" className="cursor-pointer">Agent 2</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>  
                    </div>

                    <div className="mr-2 lg:mr-0">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Filter</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Filter Data</DialogTitle>
                                </DialogHeader>
                                <div className="">
                                    <div>
                                        <Label htmlFor="name" className="text-right">
                                        Call Disposition
                                        </Label>
                                        <Select>
                                            <SelectTrigger className="w-full mt-3">
                                                <SelectValue placeholder="Select Call Disposition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                <SelectItem value={Dispositions.CUSTOMER_HANGUP.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.CUSTOMER_HANGUP.replace(/_/g, " ")}</SelectItem>
                                                <SelectItem value={Dispositions.NOT_INTERESTED.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.NOT_INTERESTED.replace(/_/g, " ")}</SelectItem>
                                                <SelectItem value={Dispositions.CALLBACK_REQUESTED.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.CALLBACK_REQUESTED.replace(/_/g, " ")}</SelectItem>
                                                <SelectItem value={Dispositions.LEAD_GENERATED.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.LEAD_GENERATED.replace(/_/g, " ")}</SelectItem>
                                                <SelectItem value={Dispositions.WRONG_NUMBER.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.WRONG_NUMBER.replace(/_/g, " ")}</SelectItem>
                                                <SelectItem value={Dispositions.FAKE_LEAD.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.FAKE_LEAD.replace(/_/g, " ")}</SelectItem>
                                                <SelectItem value={Dispositions.BOUGHT_OTHER_POLICY.replace(/_/g, " ")} className="cursor-pointer">{Dispositions.BOUGHT_OTHER_POLICY.replace(/_/g, " ")}</SelectItem> 
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>  
                                    </div>
                                </div>
                                <div className="">
                                    <div>
                                        <Label htmlFor="name" className="text-right">
                                            Lead Status 
                                        </Label>
                                        <Select>
                                            <SelectTrigger className="w-full mt-3">
                                                <SelectValue placeholder="Select Lead Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value={LeadStatuses.NOT_INTERESTED.replace(/_/g, " ")} className="cursor-pointer">{LeadStatuses.NOT_INTERESTED.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={LeadStatuses.ASKED_TO_CALL_BACK.replace(/_/g, " ")} className="cursor-pointer">{LeadStatuses.ASKED_TO_CALL_BACK.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={LeadStatuses.INTEREST_SHOWN.replace(/_/g, " ")} className="cursor-pointer">{LeadStatuses.INTEREST_SHOWN.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={LeadStatuses.DOCUMENTS_SHARED.replace(/_/g, " ")} className="cursor-pointer">{LeadStatuses.DOCUMENTS_SHARED.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={LeadStatuses.PAYMENT_DONE.replace(/_/g, " ")} className="cursor-pointer">{LeadStatuses.PAYMENT_DONE.replace(/_/g, " ")}</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>  
                                    </div>
                                </div>

                                <div className="">
                                    <div>
                                        <Label htmlFor="name" className="text-right">
                                            Presentation given
                                        </Label>
                                        <Select>
                                            <SelectTrigger className="w-full mt-3">
                                                <SelectValue placeholder="Select Presentation given" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value={PresentationGiven.YES.replace(/_/g, " ")} className="cursor-pointer">{PresentationGiven.YES.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={PresentationGiven.NO.replace(/_/g, " ")} className="cursor-pointer">{PresentationGiven.NO.replace(/_/g, " ")}</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>  
                                    </div>
                                </div>

                                <div className="">
                                    <div>
                                        <Label htmlFor="name" className="text-right">
                                         Call Status
                                        </Label>
                                        <Select>
                                            <SelectTrigger className="w-full mt-3">
                                                <SelectValue placeholder="Select Call Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value={CallStatuses.CALL_ANSWERED.replace(/_/g, " ")} className="cursor-pointer">{CallStatuses.CALL_ANSWERED.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={CallStatuses.CALL_PENDING_WHEN_EMPTY.replace(/_/g, " ")} className="cursor-pointer">{CallStatuses.CALL_PENDING_WHEN_EMPTY.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={CallStatuses.CALL_REJECTED.replace(/_/g, " ")} className="cursor-pointer">{CallStatuses.CALL_REJECTED.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={CallStatuses.COULD_NOT_CONNECT.replace(/_/g, " ")} className="cursor-pointer">{CallStatuses.COULD_NOT_CONNECT.replace(/_/g, " ")}</SelectItem>
                                                    <SelectItem value={CallStatuses.DID_NOT_PICK_UO.replace(/_/g, " ")} className="cursor-pointer">{CallStatuses.DID_NOT_PICK_UO.replace(/_/g, " ")}</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>  
                                    </div>
                                </div>
                                <DialogFooter>
                                <Button type="submit">Apply</Button>
                                <Button>Reset</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="flex gap-2 py-2 justify-end">
                    <form className="w-full flex" onSubmit={handleClickToCallAction}>    
                        <Input placeholder="Enter Customer Number" className="rounded-r-none" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}/>
                        <Button className="rounded-l-none" disabled={contactNumber.trim()===""}>Click to Call</Button>
                    </form>
                </div>
            </div>
            
            <Table className="h-[60vh]">
                <TableCaption>To See Data Click on Top Right Button. :) </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Customer Name</TableHead>
                        <TableHead className="text-center">Policy No.</TableHead>
                        <TableHead className="text-center">Contact No.</TableHead>
                        {Cookies.get('role') === EUserRole.COMPANY? <TableHead className="text-center">Agent Name</TableHead>: null}
                        <TableHead className="text-center">Time</TableHead>
                        <TableHead className="text-center">Call Status</TableHead>
                        <TableHead className="text-center">Disposition</TableHead>
                        <TableHead className="text-center">Remarks</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                    
                </TableHeader>
                <TableBody>
                    {userdata.map((customer,index: number) => {
                        return <Collapsible asChild key={`customer-${index}`}>
                        <>
                          <TableRow>
                            <TableCell className="font-medium text-center flex">
                                <CollapsibleTrigger asChild className={customer.userCalls.length>1 ?"" : 'invisible'}><ChevronsUpDown className="cursor-pointer" /></CollapsibleTrigger>
                                <p className="flex flex-grow justify-center">
                                    <span className="break-words">{customer?.customerName || '-'}</span>
                                </p>
                            </TableCell>
                            <TableCell className="font-medium text-center">
                                {/* <Popover>
                                    <PopoverTrigger><Button className="w-[9vw]" variant="default">{customer.Agent_Name}</Button></PopoverTrigger>
                                    <PopoverContent className="flex-col justify-between">
                                        <div className="flex bg-zinc-700 justify-between my-2 px-2 py-1  rounded-xl">
                                            <div className="self-center font-semibold">Agent Empathy</div>
                                            <div className={getTextColor(customer.Analysis?.sentiment_analysis?.overall_score || 0)}>{customer.Analysis?.sentiment_analysis?.overall_score || '-'}/10</div>
                                        </div>
                                        <div className="flex bg-zinc-700 justify-between my-2 px-2 py-1  rounded-xl">
                                            <div className="self-center font-semibold">Responsiveness</div>
                                            <div className={getTextColor(customer.Analysis?.call_opening?.overall_score || 0)}>{customer.Analysis?.call_opening?.overall_score || '-'}/10</div>
                                        </div>
                                        <div className="flex bg-zinc-700 justify-between my-2 px-2 py-1  rounded-xl">
                                            <div className="self-center font-semibold">Agent Knowledge</div>
                                            <div className={getTextColor(customer.Analysis?.context_setting?.score || 0)}>{customer.Analysis?.context_setting?.score || '-'}/10</div>
                                        </div>
                                    </PopoverContent>
                                </Popover> */}
                                {customer?.policyLink? <Link href={customer.policyLink} target="_blank" className="text-blue-600 underline">{customer.policyId}</Link>: "-"}
                            </TableCell>
                            <TableCell className="text-center">{customer?.customerNumber || '-'}</TableCell>
                            {Cookies.get('role') === EUserRole.COMPANY?<TableCell className="text-center">-</TableCell>: null}
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.callTime || '-' : "-"}</TableCell>
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.callStatus || '-' : "-"}</TableCell>
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.analysis?.call_disposition || '-' : "-"}</TableCell>
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.analysis?.remarks || '-' : "-"}</TableCell>
                            <TableCell>
                               {Cookies.get('agentId')? <Button variant="outline" onClick={() => { callActionHandler(customer.customerNumber) }}>Click to Call</Button> : null}   
                               {/* TODO: For one user calls => call details button?  */}
                            </TableCell>
                          </TableRow>                     
                          {
                            customer.userCalls.length>1 ? customer.userCalls.map((userCall:any,index1:number) => {
                                const analysis = typeof userCall.analysis === "string" ? JSON.parse(userCall.analysis) : userCall.analysis;
                                return <CollapsibleContent asChild key={`customer-${index}-user-call-${index1}`}> 
                                  <>
                                    <TableRow className="w-full">
                                        <TableCell className="font-medium text-center"></TableCell>
                                        <TableCell className="font-medium text-center"></TableCell>
                                        <TableCell className="font-medium text-center"></TableCell>
                                        {Cookies.get('role') === EUserRole.COMPANY? <TableCell className="font-medium text-center">{userCall.agentName}</TableCell>: null} 
                                        <TableCell className="font-medium text-center">{userCall.callTime}</TableCell>
                                        <TableCell className="font-medium text-center">{userCall.callStatus}</TableCell>
                                        <TableCell className="font-medium text-center">{analysis ? analysis?.call_disposition || '-' : '-'}</TableCell>
                                        <TableCell className="font-medium text-center">{analysis ? analysis?.remarks || '-' : '-'}</TableCell>
                                        <TableCell>
                                            <Drawer>
                                                <DrawerTrigger asChild>
                                                    <Button variant="secondary" onClick={() => { fetchmyanalysis(userCall.callID.toString()); }}>Call Details</Button>
                                                </DrawerTrigger>
                                                <DrawerContent>
                                                    <div className="grid grid-cols-[40%_1fr] h-screen w-full bg-white text-white">
                                                        <div className="bg-muted p-6 flex flex-col gap-4">
                                                            <div className="flex items-center justify-between">
                                                                <h2 className="text-xl font-bold">SubverseAI</h2>
                                                            </div>
                                                            <div className="flex-1 overflow-auto">
                                                                <audio
                                                                    src={userCall.callRecordingURL}
                                                                    controls
                                                                    className="w-full"
                                                                    ref={audioRef}
                                                                />
                                                                <div className="mt-4">
                                                                    <h3 className="text-lg font-bold">Transcript</h3>
                                                                    <p className="mt-2 text-muted-foreground h-[75vh] overflow-auto">
                                                                        {apitranscript.map((call, index) => (
                                                                            <span key={index}>
                                                                                <span
                                                                                    className="cursor-pointer"
                                                                                    onClick={() => {
                                                                                        setCurrentTime(call.start);
                                                                                        playFromSpecificTime(call.start);
                                                                                    }}
                                                                                >
                                                                                    {call.speaker === 1 ? (
                                                                                        <>
                                                                                            <br />
                                                                                            <span className="text-red-500">Customer: </span> {call.transcript}
                                                                                            <br />
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <br />
                                                                                            <span className="text-blue-500">Agent: </span> {call.transcript}
                                                                                            <br />
                                                                                        </>
                                                                                    )}
                                                                                </span>{" "}
                                                                            </span>
                                                                        ))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>



                                                        <div className="h-screen bg-background p-6 flex flex-col gap-4">
                                                            <div className="flex items-center justify-between">
                                                                <h2 className="text-xl font-bold">Analysis</h2>
                                                                <DrawerClose asChild>
                                                                    <Button onClick={() => {
                                                                        setIsLoading(true);
                                                                        setApianalysis(undefined);
                                                                        setApisummary([]);
                                                                        setApitranscript([]);
                                                                        setIsLoading(false);
                                                                    }
                                                                    } variant="outline">Back</Button>
                                                                </DrawerClose>
                                                            </div>
                                                            <div className="flex-1 overflow-auto">

                                                                <div>
                                                                    {apianalysis && (
                                                                        <div className="flex flex-col gap-6 bg-[#27272A] text-black w-[97%] p-4 rounded-2xl ">
                                                                            {/* <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between">
                                                                                <span className="font-bold text-xl text-white">Sentiment Analysis</span><span className={getTextColor(apianalysis?.sentiment_analysis?.overall_score || 0)}>{apianalysis?.sentiment_analysis?.overall_score || '-'}/10</span>
                                                                                </div>
                                                                                {apianalysis?.sentiment_analysis?.detail ? <div className="border-2 border-white font-semibold w-fit px-5 py-1 rounded-xl text-[#27272A] bg-slate-300">{apianalysis.sentiment_analysis.detail}</div> : null}
                                                                                <div className="flex gap-3 md:gap-5 mt-3">
                                                                                    <p><span className="font-medium text-white">Empathy </span><span className={getTextColor(apianalysis?.sentiment_analysis?.empathy || 0)}>{apianalysis?.sentiment_analysis?.empathy || '-'}/10</span></p>
                                                                                    <p><span className="font-medium text-white">Apology </span><span className={getTextColor(apianalysis?.sentiment_analysis?.apology || 0)}>{apianalysis?.sentiment_analysis?.apology || '-'}/10</span></p>
                                                                                    <p><span className="font-medium text-white">Listening Rapport </span><span className={getTextColor(apianalysis?.sentiment_analysis?.listening_rapport || 0)}>{apianalysis?.sentiment_analysis?.listening_rapport || '-'}/10</span></p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between">
                                                                                <span className="font-bold text-xl text-white">Call Opening</span> <span className={getTextColor(apianalysis?.call_opening?.overall_score || 0)}>{apianalysis?.call_opening?.overall_score || '-'}/10</span>
                                                                                </div>
                                                                                {apianalysis?.call_opening?.detail ? <div className="border-2 border-white font-semibold w-fit px-5 py-1 rounded-xl text-[#27272A] bg-slate-300">{apianalysis.call_opening.detail}</div> : null}
                                                                                <div className="flex gap-3 md:gap-5 mt-3">
                                                                                    <p><span className="font-medium text-white">Greetings:  </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.call_opening?.greetings || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Brand Name:  </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.call_opening?.brand_name || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Name Exchange: </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.call_opening?.name_exchange || '-'}</span></p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between items-center">
                                                                                <span className="font-bold text-xl text-white">Context Setting</span> <span className={getTextColor(apianalysis?.context_setting?.score || '0')}>{apianalysis?.context_setting?.score || '-'}/10</span>
                                                                                </div>
                                                                                {apianalysis?.context_setting?.detail ? <div className="border-2 border-white font-semibold w-fit px-5 py-1 rounded-xl text-[#27272A] bg-slate-300">{apianalysis.context_setting.detail}</div> :null}
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between">
                                                                                <span className="font-bold text-xl text-white">Process Information</span> <span className={getTextColor(apianalysis?.process_information?.score || 0)}>{apianalysis?.process_information?.score || '-'}/10</span>
                                                                                </div>
                                                                                {apianalysis?.process_information?.detail ? <div className="border-2 border-white font-semibold w-fit px-5 py-1 rounded-xl text-[#27272A] bg-slate-300">{apianalysis.process_information.detail}</div> : null}
                                                                                <div className="flex gap-3 md:gap-5 mt-3">
                                                                                    <p><span className="font-medium text-white">Objection:  </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.process_information?.objection || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Escalation:  </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.process_information?.escalation || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Information Disclosure: </span><span className={getTextColor(apianalysis?.process_information?.information_disclosure || 0)}>{apianalysis?.process_information?.information_disclosure || '-'}/10</span></p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between">
                                                                                <span className="font-bold text-xl text-white">Zero Tolerance</span>
                                                                                </div>
                                                                                <div className="flex gap-3 md:gap-5 mt-3">
                                                                                    <p><span className="font-medium text-white">Rude Unprofessional:  </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.zero_tolerance?.rude_unprofessional || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Dead Air:  </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.zero_tolerance?.dead_air || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Misleading: </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.zero_tolerance?.misleading || '-'}</span></p>
                                                                                    <p><span className="font-medium text-white">Fraudulent: </span><span className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.zero_tolerance?.fraudulent || '-'}</span></p>
                                                                                </div>
                                                                            </div> */}

                                                                            {/* <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between">
                                                                                <span className="font-bold text-xl text-white">Zero Tolerance</span><span className={getTextColor(apianalysis.zero_tolerance.score)}>{apianalysis.zero_tolerance.score}/10</span>
                                                                                </div>
                                                                                <div className="border-2 border-white font-semibold w-fit px-5 py-1 rounded-xl text-[#27272A] bg-slate-300">{apianalysis.zero_tolerance.detail}</div>
                                                                            </div> */}

                                                                            {/* <div className="border p-3 rounded-xl bg-zinc-700">
                                                                                <div className="flex justify-between">
                                                                                <span className="font-bold text-xl text-white">Call Flow Optimization</span> <span className={getTextColor(apianalysis.Call_Flow_Optimization.score)}>{apianalysis.Call_Flow_Optimization.score}/10</span>
                                                                                </div>
                                                                                <div className="border-2 border-white font-semibold w-fit px-5 py-1 rounded-xl text-[#27272A] bg-slate-300">{apianalysis.Call_Flow_Optimization.detail}</div>
                                                                            </div> */}
                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Presentation Given</div>
                                                                                <div className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.presentation_given || '-'}</div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Policy Pitched</div>
                                                                                <div className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.policy_pitched || '-'}</div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Lead Status </div>
                                                                                <div className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.lead_status || '-'}</div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Call Disposition </div>
                                                                                <div className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl"> {apianalysis?.call_disposition || '-'}</div>
                                                                            </div>
                
                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Call Back Time</div>
                                                                                <div className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.call_back_time || '-'}</div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Dead Air</div>
                                                                                <div className={getTextColor(apianalysis?.dead_air || 0)}>{apianalysis.dead_air || 0}/10</div>
                                                                            </div>

                                                                            <div className="border p-3 rounded-xl bg-zinc-700 flex justify-between">
                                                                                <div className="font-bold text-xl text-white">Remarks</div>
                                                                                <div  className="font-bold p-2 bg-slate-300 text-[#27272A] rounded-2xl">{apianalysis?.remarks || '-'}</div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div><br /><br /><br />
                                                                <div className="flex flex-col gap-6 bg-[#27272A] text-white w-[97%] p-4 rounded-2xl ">
                                                                    <h3 className="text-2xl font-bold text-white">Summary</h3>
                                                                    {Array.isArray(apisummary)? apisummary.map((item, index) => (
                                                                        <div className="border rounded-2xl p-2 bg-zinc-700  font-semibold" key={`summary-${index}`}>
                                                                            {item}
                                                                        </div>
                                                                    )): <div className="border rounded-2xl p-2 bg-zinc-700  font-semibold">
                                                                    {apisummary}
                                                                </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DrawerContent>
                                            </Drawer>
                                        </TableCell>
                                    </TableRow>
                                  </>
                                </CollapsibleContent>
                            }) : null
                          }
                        </>
                      </Collapsible>
                    })}
                </TableBody>
            </Table>
        </>
    );
}





const getTextColor = (score:string) => {
    if (Number(score) > 7) {
        return "text-white p-2 bg-green-600 font-semibold rounded-2xl";
    } else if (Number(score) >= 4 && Number(score) <= 7) {
        return "text-white p-2 bg-yellow-500 font-semibold rounded-2xl";
    } else {
        return "text-white p-2 bg-red-500 font-semibold rounded-2xl";
    }
};