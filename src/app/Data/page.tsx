//this is data page
"use client";
import { useState, useRef, useEffect } from "react";
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
import { AgentDropdownList, EUserRole } from "../interfaces/user.interface";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, EyeIcon, FilterIcon, Loader2, Phone, PhoneCallIcon, SearchIcon } from "lucide-react";
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
import {ECallDispositions, ECallStatuses, ELeadStatuses, EPresentationGiven, ETimeFilter } from "../interfaces/user-calls.interface";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface TranscriptItem {
    transcript: string;
    start: number;
    speaker: number;
}

/* interface AnalysisItem {
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
} */

/* interface Userdata {
    Issue_Resolved_Status: any;
    Call_ID: number;
    Agent_Name: string;
    Customer_ID: string;
    Usecase: string;
    Call_Recording_URL: string;
    Analysis: AnalysisItem;

} */
const followUpsFilter = [ECallDispositions.LEAD_GENERATED.replace(/_/g," "),ECallDispositions.CALLBACK_REQUESTED.replace(/_/g," ")]


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
    const [isCompany, setIsCompany] = useState(false);
    const router = useRouter();
    const [agentList, setAgentList] = useState<Array<AgentDropdownList>>([]);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");
    const [selectedAgent, setSelectedAgent] = useState("all");
    const [selectedCallDisposition, setSelectedCallDisposition] = useState("all");
    const [selectedLeadStatus, setSelectedLeadStatus] = useState("");
    const [selectedPresentationGiven, setSelectedPresentationGiven] = useState("");
    const [selectedCallStatus, setSelectedCallStatus] = useState("all");
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [callStats, setCallStats] = useState<any>(null);
    const [isCallHistory, setIsCallHistory] = useState(true);
    const searchParams = useSearchParams();
    const [isFollowUpFilter, setIsFollowUpFilter] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isExportRequestLoading, setIsExportRequestLoading] = useState(false);

    const getCompanyAgents = async () => {
        if(!Cookies.get("companyId")){
          router.push('/Login');
        }

        const response = await axios.post("/api/getAgents", { companyId: Cookies.get("companyId")});
        if(response.data?.agents){
            setAgentList(response.data.agents)
        }
    }

    useEffect(() => {
      if(Cookies.get('role') && Cookies.get('role') !== EUserRole.USER){
        const isRoleCompany = Cookies.get('role') === EUserRole.COMPANY;
        setIsCompany(isRoleCompany);

        if(isRoleCompany){
          getCompanyAgents();
        }

        const callStatus = searchParams.get('callStatus');
        if(callStatus === ECallStatuses.CALL_PENDING){
            setIsCallHistory(false);
            setSelectedCallStatus(ECallStatuses.CALL_PENDING);
        }
      }else{
        router.push('/Login');
      }
    }, [])
      
    // Function to handle playing audio from a specific time
    const playFromSpecificTime = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            audioRef.current.play();
        }
    };


    useEffect(() => {
      if((selectedCallDisposition || selectedCallStatus)){
        getuserdatafromapi();
      }
    },[selectedTimeFilter,selectedAgent,isCallHistory,selectedCallDisposition,selectedCallStatus,isFollowUpFilter])


    const getuserdatafromapi = async () => {
        setIsLoading(true);
        const companyId = Cookies.get('companyId');
        const agentId = isCompany ? selectedAgent : Cookies.get('agentId');
        const timeFilter = selectedTimeFilter;
        let callDisposition = '';
        let followUps = null;
        if(isFollowUpFilter){
            followUps = followUpsFilter;
        }
        if(!isFollowUpFilter && selectedCallDisposition !== 'all'){
            callDisposition = selectedCallDisposition;
        }
        const leadStatus = selectedLeadStatus;
        const presentationGiven = selectedPresentationGiven;
        const callStatus = selectedCallStatus === 'all' ? '' : selectedCallStatus;
        const role = Cookies.get('role');
        const search = searchValue.trim();

        const response = await axios.post("/api/getcalldata",{
            companyId,
            agentId: agentId === "all" ? "": agentId,
            timeFilter,
            callStatus,
            presentationGiven,
            leadStatus,
            callDisposition,
            role,
            isCallHistory,
            search,
            followUps
        });
        setIsLoading(false);
        if(response?.data){
            setuserdata(response.data.callData);
            setCallStats(response.data.callStats)
        }
    };


    const fetchmyanalysis = async (Call_ID: string) => {
        setIsLoading(true);
        const response = await axios.post("/api/getcallanalysisdata", { Call_ID: Call_ID,companyId: Cookies.get("companyId"),agentId: Cookies.get('agentId') });
        const summary = response.data.jsonconvertedsummary ? response.data.jsonconvertedsummary.split('\n') : [];
        setApisummary(summary);
        setApitranscript(response.data.transcriptWithSpeakers);
        setApianalysis(response.data.jsonconvertedanalysis);
        setIsLoading(false);
    };

    const callActionHandler = async (contactNumber: string) => {
        const response:any = await axios.post("/api/callAction", { contactNumber: contactNumber,agentId: Cookies.get("agentNumber") });
        if(response.data?.message){
            toast.success(response.data.message)
        }
        if(response.data?.error){
            toast.error(response.data.error)
        }
    }

    const handleClickToCallAction = async (e: React.FormEvent) => {
        e.preventDefault();

        if(!contactNumber.trim()){
            return;
        }

        callActionHandler(contactNumber.trim())
    }

    const resetFilter = () => {
        setSelectedLeadStatus("");
        setSelectedPresentationGiven("");
    }

    const applyFilter = (e:  React.FormEvent) => {
        e.preventDefault();
        setIsFilterDialogOpen(false);
        getuserdatafromapi();
    }

    const followUpFilterHandler = async () => {
        setIsLoading(true);
        setIsFollowUpFilter(true);
        setIsCallHistory(true)
        resetFilter();
        setSelectedCallDisposition('all');
        setSelectedCallStatus('all');
        const companyId = Cookies.get('companyId');
        const agentId = isCompany ? selectedAgent : Cookies.get('agentId');
        const timeFilter = selectedTimeFilter;
        const role = Cookies.get('role');
        const search = searchValue.trim();

        const response = await axios.post("/api/getcalldata",{
            companyId,
            agentId: agentId === "all" ? "": agentId,
            timeFilter,
            role,
            isCallHistory: true,
            followUps: followUpsFilter,
            search
        });
        setIsLoading(false);
        if(response.data){
            setuserdata(response.data.callData);
            setCallStats(response.data.callStats)
        }
    }

    const exportToExcelHandler = async () => {
        setIsExportRequestLoading(true);
        const companyId = Cookies.get('companyId');
        const agentId = isCompany ? selectedAgent : Cookies.get('agentId');
        const timeFilter = selectedTimeFilter;
        let callDisposition:string[] = [];
        if(selectedCallDisposition !== 'all' && !isFollowUpFilter){
            callDisposition = [selectedCallDisposition]
        }
        if(isFollowUpFilter){
            callDisposition = [...followUpsFilter]
        }
        const leadStatus = selectedLeadStatus;
        const presentationGiven = selectedPresentationGiven;
        const callStatus = selectedCallStatus === 'all' ? '' : selectedCallStatus;
        const search = searchValue.trim();

        const response = await axios.post("/api/exportToExcel",{
            companyId,
            agentId: agentId === "all" ? "": agentId,
            timeFilter,
            callStatus,
            presentationGiven,
            leadStatus,
            callDisposition,
            search
        },{
            responseType: "blob",
        });
        if(response.data){
            const blob = new Blob([response.data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `user-calls.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            toast.success('Exported successfully!')
        }else{
            toast.error('No data or Something went wrong!')
        }
        setIsExportRequestLoading(false);
    };

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : (
                <div></div>
            )}
            <Toaster position="bottom-right" />
            <div className="px-5 grid md:flex gap-5 mt-3">
                <Link href="/Admin">
                    <Button variant="outline">Back</Button>
                </Link>
                <div className="flex justify-end md:order-3 md:flex-1">
                    {isCallHistory ? <Button className=" bg-blue-400 hover:bg-blue-500" onClick={exportToExcelHandler} disabled={userdata.length === 0 || isExportRequestLoading}>{isExportRequestLoading ? <Loader2 className="animate-spin"/>: null}<span> Export</span></Button> :null}
                    <Button className=" ml-3 bg-blue-400 hover:bg-blue-500" onClick={getuserdatafromapi}>Load Data</Button>
                </div>
                <div className="max-md:col-span-2">
                    <div className="grid grid-cols-2 md:flex w-full">
                        <Card className={`rounded-none hover:bg-muted cursor-pointer ${isCallHistory && !isFollowUpFilter ?'bg-muted': ''}`}  onClick={() => { setIsFollowUpFilter(false); setIsCallHistory(true); setSelectedCallStatus('all'); }}>
                            <CardContent className="py-2">
                                <CardTitle className="text-sm text-muted-foreground">Calls Attempted</CardTitle>
                                <CardDescription className="text-lg text-center text-white">{callStats?.callsAttempted ? callStats.callsAttempted : 0}</CardDescription>
                            </CardContent>
                        </Card>
                        {isCompany ? <Card className="rounded-none">
                            <CardContent className="py-2">
                                <CardTitle className="text-sm text-muted-foreground">Total Call Duration</CardTitle>
                                <CardDescription className="text-lg text-center text-white">{callStats?.totalCallDuration ? (callStats.totalCallDuration/60).toFixed(1) : 0} mins</CardDescription>
                            </CardContent>
                        </Card> : null}
                        <Card className={`rounded-none hover:bg-muted cursor-pointer ${!isCallHistory && !isFollowUpFilter ?'bg-muted': ''}`} onClick={() => { setIsFollowUpFilter(false); setIsCallHistory(false); setSelectedCallStatus(ECallStatuses.CALL_PENDING); }}>
                            <CardContent className="py-2">
                                <CardTitle className="text-sm text-muted-foreground">Pending Calls</CardTitle>
                                <CardDescription className="text-lg text-center text-white">{callStats?.pendingCalls ? callStats.pendingCalls : 0}</CardDescription>
                            </CardContent>
                        </Card>
                        <Card className={`rounded-none hover:bg-muted cursor-pointer ${isFollowUpFilter?'bg-muted': ''}`} onClick={() => { followUpFilterHandler();}}>
                            <CardContent className="py-2">
                                <CardTitle className="text-sm text-muted-foreground">Follow Ups</CardTitle>
                                <CardDescription className="text-lg text-center text-white">{callStats?.followUps ? callStats.followUps : 0}</CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <div className={`grid sm:grid-cols-2 ${isCompany ? "lg:grid-cols-6" : isCallHistory ? "lg:grid-cols-4": "lg:grid-cols-3"} gap-x-2 gap-y-6 px-5 mt-6`}>
                    {isCallHistory ? <div className="flex flex-col gap-1">
                        <Label className="px-1">Time</Label>
                        <Select onValueChange={(value) => setSelectedTimeFilter(value)} value={selectedTimeFilter}>
                            <SelectTrigger className="w-full capitalize">
                                <SelectValue placeholder="Select Time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Object.values(ETimeFilter).map((value,index) => {
                                        return <SelectItem value={value} className="cursor-pointer capitalize" key={`time-filter-option-${index}`}>{value.replace(/_/g, " ")}</SelectItem>
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>  
                    </div> : null}
                    {isCompany ? <div className="flex flex-col gap-1">
                        <Label className="px-1">Agent</Label>
                         <Select onValueChange={(value) => setSelectedAgent(value)} value={selectedAgent}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all" className="cursor-pointer">All</SelectItem>
                                    {agentList.map((agent,index) => {
                                        return <SelectItem key={`agent-option-${index}`} value={agent._id} className="cursor-pointer">{agent.name}</SelectItem>
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>  
                    </div> : null}
                    {isCompany && isCallHistory
                        ?  <div className="flex flex-col gap-1">
                            <Label className="px-1">Call Disposition</Label>
                            <Select onValueChange={(value) => setSelectedCallDisposition(value)} value={selectedCallDisposition} disabled={isFollowUpFilter}>
                              <SelectTrigger className="w-full capitalize">
                                  <SelectValue placeholder="Call Disposition" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectGroup>
                                      {
                                          Object.values(ECallDispositions).map((value,index) => {
                                              return <SelectItem value={value} className="cursor-pointer capitalize" key={`call-disposition-option-${index}`}>{value.replace(/_/g," ")}</SelectItem>
                                          })
                                      }
                                  </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>  
                        : null}
                    {isCompany && isCallHistory
                      ?  <div className="flex flex-col gap-1">
                          <Label className="px-1">Call Status</Label>
                          <Select onValueChange={(value) => setSelectedCallStatus(value)} value={selectedCallStatus} disabled={isFollowUpFilter}>
                            <SelectTrigger className="w-full capitalize">
                                <SelectValue placeholder="Call Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {
                                        Object.values(ECallStatuses).map((value,index) => {
                                            if(value !== ECallStatuses.CALL_PENDING){
                                                return <SelectItem value={value} className="cursor-pointer capitalize" key={`call-status-option-${index}`}>{value.replace(/_/g," ")}</SelectItem>
                                            }
                                        })
                                    }
                                </SelectGroup>
                            </SelectContent>
                          </Select>  
                        </div>   
                      : null
                    }
                    {isCompany && isCallHistory ? <div className="flex items-end">
                        <Dialog open={isFilterDialogOpen} onOpenChange={(open) => setIsFilterDialogOpen(open)}>
                            <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => {setIsFilterDialogOpen(true)}}><FilterIcon/></Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Filter Data</DialogTitle>
                                </DialogHeader>
                                  <div>
                                      <Label htmlFor="name" className="text-right">
                                          Lead Status 
                                      </Label>
                                      <Select onValueChange={(value) => setSelectedLeadStatus(value)} value={selectedLeadStatus}>
                                          <SelectTrigger className="w-full mt-3 capitalize">
                                              <SelectValue placeholder="Select Lead Status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectGroup>
                                                  {
                                                      Object.values(ELeadStatuses).map((value,index) => {
                                                          return <SelectItem value={value} className="cursor-pointer capitalize" key={`lead-status-option-${index}`}>{value.replace(/_/g," ")}</SelectItem>
                                                      })
                                                  }
                                              </SelectGroup>
                                          </SelectContent>
                                      </Select>  
                                  </div>
                                  <div>
                                      <Label htmlFor="name" className="text-right">
                                          Presentation given
                                      </Label>
                                      <Select onValueChange={(value) => setSelectedPresentationGiven(value)} value={selectedPresentationGiven}>
                                          <SelectTrigger className="w-full mt-3 capitalize">
                                              <SelectValue placeholder="Select Presentation given" />
                                          </SelectTrigger>
                                          <SelectContent>
                                              <SelectGroup>
                                                  {
                                                      Object.values(EPresentationGiven).map((value,index) => {
                                                          return <SelectItem value={value} className="cursor-pointer capitalize" key={`presentation-given-option-${index}`}>{value.replace(/_/g," ")}</SelectItem>
                                                      })
                                                  }
                                              </SelectGroup>
                                          </SelectContent>
                                      </Select>  
                                  </div>
                                  
                                <DialogFooter>
                                <Button type="submit" onClick={applyFilter}>Apply</Button>
                                <Button onClick={resetFilter}>Reset</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div> : null}          
                <div className="flex gap-2 items-end">
                    <form className="w-full flex" onSubmit={(e)=> {e.preventDefault(); getuserdatafromapi()}}>    
                        <Input placeholder="Enter Mobile,Name,Policy No" className="rounded-r-none" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}/>
                        <Button className="rounded-l-none" disabled={searchValue.trim()===""}><SearchIcon /></Button>
                    </form>
                </div>
                {!isCompany? <div className="flex flex-1 w-full gap-2 items-end sm:justify-end sm:col-span-2">
                <form className="flex max-sm:w-full" onSubmit={handleClickToCallAction}>    
                    <Input placeholder="Enter Customer Number" className="rounded-r-none" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}/>
                    <Button className="rounded-l-none" disabled={contactNumber.trim()===""}><PhoneCallIcon /></Button>
                </form>
            </div>:null}
            </div>
            <div  className="h-[60vh] overflow-auto m-3">
            <Table>
                <TableCaption>To See Data Click on Top Right Button. :) </TableCaption>
                <TableHeader className="!sticky top-0 z-30">
                    <TableRow>
                        <TableHead className="text-center">Customer Name</TableHead>
                        <TableHead className="text-center">Policy No.</TableHead>
                        <TableHead className="text-center">Contact No.</TableHead>
                        {isCompany? <TableHead className="text-center">Agent Name</TableHead>: null}
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
                          <TableRow className="bg-muted/30">
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
                            {isCompany? <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.agentName || '-' : "-"}</TableCell>: null}
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.callTime || '-' : "-"}</TableCell>
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.callStatus || '-' : "-"}</TableCell>
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.analysis?.call_disposition || '-' : "-"}</TableCell>
                            <TableCell className="text-center">{customer.userCalls.length > 0 ? customer.userCalls[0]?.analysis?.remarks || '-' : "-"}</TableCell>
                            <TableCell className="flex gap-2">
                               {!isCompany? <Button size="sm" variant="secondary" onClick={() => { callActionHandler(customer.customerNumber) }}><PhoneCallIcon /></Button> : null}   
                               {customer.userCalls.length > 0 ? <Drawer>
                                    <DrawerTrigger asChild>
                                        <Button size="sm" variant="secondary" onClick={() => { fetchmyanalysis(customer.userCalls[0].callID.toString()); }}><EyeIcon/></Button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <div className="grid grid-cols-[40%_1fr] h-screen w-full bg-white text-white">
                                            <div className="bg-muted p-6 flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-bold">SubverseAI</h2>
                                                </div>
                                                <div className="flex-1 overflow-auto">
                                                    <audio
                                                        src={customer.userCalls[0].callRecordingURL}
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
                                    </Drawer>: null}
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
                                        {isCompany? <TableCell className="font-medium text-center">{userCall?.agentName || '-'}</TableCell>: null} 
                                        <TableCell className="font-medium text-center">{userCall?.callTime || '-'}</TableCell>
                                        <TableCell className="font-medium text-center">{userCall?.callStatus || '-'}</TableCell>
                                        <TableCell className="font-medium text-center">{analysis ? analysis?.call_disposition || '-' : '-'}</TableCell>
                                        <TableCell className="font-medium text-center">{analysis ? analysis?.remarks || '-' : '-'}</TableCell>
                                        <TableCell>
                                            <Drawer>
                                                <DrawerTrigger asChild>
                                                    <Button variant="secondary" size="sm" onClick={() => { fetchmyanalysis(userCall.callID.toString()); }}><EyeIcon /></Button>
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
            </div>
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