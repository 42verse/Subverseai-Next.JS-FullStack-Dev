"use client"
import { useState, useEffect } from "react";
import { toast } from "sonner"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner"
import Loading from "@/app/components/Loading"
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { EUserRole } from '../interfaces/user.interface';
import { ECallStatuses } from "../interfaces/user-calls.interface";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  customersReached: {
    label: "Customers Reached",
    color: "hsl(var(--chart-1))",
  },
  customerDiscussions: {
    label: "Customer Discussions",
    color: "hsl(var(--chart-2))",
  },
  activeLeads: {
    label: "Active Leads",
    color: "hsl(var(--chart-3))",
  },
  paymentDone: {
    label: "Payment Done",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig
 
const chartConfig1 = {
  callsHandled: {
    label: "Calls Handled",
    color: "hsl(var(--chart-1))",
  },
  avgCallDurationInMins: {
    label: "Avg Call Duration (In Minutes)",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig

const chartData3 = [
  { callStatus: "Call Answered", userCalls: 275, fill: "hsl(var(--chart-1))" },
  { callStatus: "Couldn't Connect", userCalls: 200, fill: "hsl(var(--chart-2))" },
  { callStatus: "Didn't pick up", userCalls: 187, fill: "hsl(var(--chart-3))" },
  { callStatus: "Call Rejected", userCalls: 173, fill: "hsl(var(--chart-4))" },
  { callStatus: "Call Pending", userCalls: 90, fill: "hsl(var(--chart-5))" },
]

const chartConfig3 = {
  userCalls: {
    label: "Calls",
  },
  callAnswered: {
    label: "call answered",
  },
  couldNotConnect: {
    label: "couldn't connect",
  },
  didNotPickup: {
    label: "didn't pick up",
  },
  callRejected: {
    label: "call rejected",
  },
  callPending: {
    label: "call pending",
  },
} satisfies ChartConfig

const chartData4 = [
  { callDisposition: "customer hangup", userCalls: 275, fill: "var(--color-customerHangup)" },
  { callDisposition: "not interested", userCalls: 200, fill: "var(--color-notInterested)" },
  { callDisposition: "call back requested", userCalls: 187, fill: "var(--color-callBackRequested)" },
  { callDisposition: "lead generated", userCalls: 173, fill: "var(--color-leadGenerated)" },
  { callDisposition: "wrong number", userCalls: 90, fill: "var(--color-wrongLead)" },
  { callDisposition: "fake lead", userCalls: 90, fill: "var(--color-fakeLead)" },
  { callDisposition: "bought other policy", userCalls: 90, fill: "var(--color-boughtOtherPolicy)" },
]

const chartConfig4 = {
  userCalls: {
    label: "Calls",
  },
  customerHangup: {
    label: "call answered",
    color: "hsl(var(--chart-1))",
  },
  notInterested: {
    label: "couldn't connect",
    color: "hsl(var(--chart-2))",
  },
  callBackRequested: {
    label: "didn't pick up",
    color: "hsl(var(--chart-3))",
  },
  leadGenerated: {
    label: "call rejected",
    color: "hsl(var(--chart-4))",
  },
  wrongLead: {
    label: "wrong lead",
    color: "hsl(var(--chart-5))",
  },
  fakeLead: {
    label: "fake lead",
    color: "hsl(var(--chart-3))",
  },
  boughtOtherPolicy: {
    label: "bought other policy",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

const chartData5 = [
  { presentationGiven: "Yes", userCalls: 275, fill: "var(--color-yes)" },
  { presentationGiven: "No", userCalls: 200, fill: "var(--color-no)" },
]

const chartConfig5 = {
  userCalls: {
    label: "Calls",
  },
  yes: {
    label: "Yes",
    color: "hsl(var(--chart-1))",
  },
  no: {
    label: "No",
    color: "hsl(var(--chart-2))",
  }
} satisfies ChartConfig

const chartData6 = [
  { leadStatus: "Not interested", userCalls: 275, fill: "var(--color-notInterested)" },
  { leadStatus: "Asked to call back", userCalls: 200, fill: "var(--color-askedToCall)" },
  { leadStatus: "Interest shown", userCalls: 200, fill: "var(--color-interestShown)" },
  { leadStatus: "Documents shared", userCalls: 200, fill: "var(--color-documentShared)" },
  { leadStatus: "Payment done", userCalls: 200, fill: "var(--color-paymentDone)" },
]

const chartConfig6 = {
  userCalls: {
    label: "Calls",
  },
  notInterested: {
    label: "Not interested",
    color: "hsl(var(--chart-1))",
  },
  askedToCall: {
    label: "Asked to call back",
    color: "hsl(var(--chart-2))",
  },
  interestShown: {
    label: "Interest shown",
    color: "hsl(var(--chart-3))",
  },
  documentShared: {
    label: "Documents shared",
    color: "hsl(var(--chart-4))",
  },
  paymentDone: {
    label: "Payment done",
    color: "hsl(var(--chart-5))",
  }
} satisfies ChartConfig

/* interface TranscriptItem {
  transcript: string;
  start: number;
  speaker: number;
} */

/* interface AnalysisItem {
  Customer_Sentiment: {
    score: string,
    detail: string
  },
  Customer_Intent: {
    score: string,
    detail: string    
  },
  Agent_Empathy: {
    score: string,
    detail: string
  },
  Agent_Promptness_and_Responsiveness: {
    score: string,
    detail: string
  },
  Agent_Knowledge: {
    score: string,
    detail: string  
  },
  Call_Flow_Optimization: {
    score: string,
    detail: string
  },
  Call_Completion_Status: { 
    score: string,
    detail: string
  },
  Issue_Resolved_Status: { 
    score: string,
    detail: string
  }
} */


export default function Component() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  /* const [audioUrl, setAudioUrl] = useState("");
  const [usecase, setUsecase] = useState(""); */
  const [isLoading, setIsLoading] = useState(false);
  const [customerUrl, setCustomerUrl] = useState("")
  /* const [apianalysis, setApianalysis] = useState<AnalysisItem>();
  const [apisummary, setApisummary] = useState<string[]>([]);
  const [apitranscript, setApitranscript] = useState<TranscriptItem[]>([]); */
  const [isCompany, setIsCompany] = useState(false);
  const [agentPerformanceChartData, setAgentPerformanceChartData] = useState([]);
  const [isGetAgentPerformanceRequestLoading, setIsGetAgentPerformanceRequestLoading] = useState(false);
  const [dailyMetricsChartData, setDailyMetricsChartData] = useState([]);
  const [isGetDailyMetricsRequestLoading, setIsGetDailyMetricsRequestLoading] = useState(false);
  const [leadFunnelChartsData, setLeadFunnelChartsData] = useState([]);
  const [isGetLeadFunnelChartsRequestLoading, setIsLeadFunnelChartsLoading] = useState(false);

  if(Cookies.get('role') === EUserRole.USER)
    {
      router.push("/Login");
    }

  useEffect(() => {
    if(Cookies.get('role') && Cookies.get('role') !== EUserRole.USER){
      const isRoleCompany = Cookies.get('role') === EUserRole.COMPANY;
      setIsCompany(isRoleCompany);
      if(isRoleCompany){
        getAgentPerformanceChartStats();
        getDailyMetricsChartStats();
        getLeadFunnelChartsData();
      }
    }else{
      router.push('/Login');
    }
  }, [])

  /* const runcsvtojsonapi = async () => {
    setIsLoading(true);
    const response = await axios.post("/api/savecsvtodb",{companyId: Cookies.get("companyId")});
    toast(response.data.message);
    setIsLoading(false);
  };

  const aitsacapi = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/aitsacapi', { audioUrl, usecase });

      setIsLoading(false);
      setApisummary(response.data.jsonconvertedsummary.summary);
      setApitranscript(response.data.transcriptWithSpeakers);
      setApianalysis(response.data.jsonconvertedanalysis);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }; */

  const saveCustomerInformation = async () => {
    setIsLoading(true);
    const response = await axios.post("/api/saveCustomerInfo",{
      companyId: Cookies.get("companyId"),
      inputFileUrl: customerUrl
    });
    if(response.data.message){
      toast.success(response.data.message);
    }
    if(response.data.error){
      toast.error(response.data.error);
    }
    setIsLoading(false);
  };

  const getAgentPerformanceChartStats = async () => {
    setIsGetAgentPerformanceRequestLoading(true);
    const response = await axios.post("/api/getAgentPerformanceOverviewStats",{
      companyId: Cookies.get("companyId")
    });
    if(response.data?.chartData){
      setAgentPerformanceChartData(response.data.chartData)
    }
    setIsGetAgentPerformanceRequestLoading(false);
  };

  const getDailyMetricsChartStats = async () => {
    setIsGetDailyMetricsRequestLoading(true);
    const response = await axios.post("/api/getDailyMetricsStats",{
      companyId: Cookies.get("companyId")
    });
    if(response.data?.chartData){
      setDailyMetricsChartData(response.data.chartData)
    }
    setIsGetDailyMetricsRequestLoading(false);
  };

  const getLeadFunnelChartsData = async () => {
    setIsLeadFunnelChartsLoading(true);
    const response = await axios.post("/api/getLeadFunnelStats",{
      companyId: Cookies.get("companyId")
    });
    if(response.data?.chartsData){
      setLeadFunnelChartsData(response.data.chartsData)
    }
    setIsLeadFunnelChartsLoading(false);
  };


  const deleteCookies = () => {
    Cookies.remove('name');
    Cookies.remove('username');
    Cookies.remove('email');
    Cookies.remove('phone');
    Cookies.remove('companyId');
    Cookies.remove('agentId');
    Cookies.remove('role');
    Cookies.remove('authToken');
    router.push('/Login');
  };



  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
            <div></div>
      )}

    <Toaster />
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                  <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                  <path d="M12 3v6" />
                </svg>
                <span className="">SubverseAI Analytics</span>
               
              </Link>
              

             


            </div>
            
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                {isCompany ? <Button
                  variant={"ghost"}
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                >

                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Dashboard
                </Button>: null}
                <Button
                  variant={"ghost"}
                  onClick={()=>{router.push('/Data', { scroll: false })}}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  Call History
                </Button>
                <Button
                  variant={"ghost"}
                  onClick={()=>{router.push(`/Data?callStatus=${ECallStatuses.CALL_PENDING}`,{ scroll: false })}}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                  Pending Calls
                </Button>
                {/* <Button
                  variant={"ghost"}
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  Upload
                </Button> */}
                {isCompany ? <Button
                  variant={"ghost"}
                  onClick={() => setActiveTab("uploadCustomer")}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  Upload Customer
                </Button>: null}
              </nav>
            </div>
          </div>
        </div>



        <div className="flex flex-col">
        <Link className='flex justify-end mx-5' onClick={deleteCookies} href="Login">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="sr-only">Logout</span>
          </Button>
          </Link>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8 xl:p-10">
            {isCompany && activeTab === "dashboard" && (
              <div className="grid gap-6 text-black">     
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardDescription></CardDescription>
                    <CardTitle>Agent Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <ChartContainer config={chartConfig} className="h-[30dvh] w-full">
                        <BarChart accessibilityLayer={true} data={agentPerformanceChartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="_id" tickMargin={0} tickLine={false} axisLine={true}  />
                          <YAxis  tickLine={false} axisLine={true} tickMargin={0} />
                          <ChartTooltip content={<ChartTooltipContent />} wrapperStyle={{color: 'white'}}/>
                          <ChartLegend content={<ChartLegendContent />} className="text-white" />
                          <Bar dataKey="customersReached" fill="var(--color-customersReached)" radius={4} />
                          <Bar dataKey="customerDiscussions" fill="var(--color-customerDiscussions)" radius={4} />
                          <Bar dataKey="activeLeads" fill="var(--color-activeLeads)" radius={4} />
                          <Bar dataKey="paymentDone" fill="var(--color-paymentDone)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardDescription></CardDescription>
                    <CardTitle>Daily Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <ChartContainer config={chartConfig1} className="h-[30dvh] w-full">
                        <BarChart accessibilityLayer data={dailyMetricsChartData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="agentName" tickMargin={0} tickLine={false} axisLine={true}  />
                          <ChartTooltip content={<ChartTooltipContent />} wrapperStyle={{color: 'white'}}/>
                          <ChartLegend content={<ChartLegendContent />} className="text-white" />
                          <Bar dataKey="callsHandled" fill="var(--color-callsHandled)" radius={4} />
                          <Bar dataKey="avgCallDurationInMins" fill="var(--color-avgCallDurationInMins)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardDescription></CardDescription>
                    <CardTitle>Lead Funnel Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="flex gap-1 flex-wrap">
                       {leadFunnelChartsData.map((chart:any,index) => <Card key={`pie-chart-${index}`} className="flex flex-1 justify-center">
                          <CardContent className="p-1">
                              <p className="text-center mt-2">{chart?.title || ''}</p>
                              <ChartContainer
                                config={{}}
                                className="mx-auto aspect-square h-[35dvh]"
                              >
                                <PieChart>
                                  <ChartTooltip
                                    labelClassName="!capitalize"
                                    content={<ChartTooltipContent hideLabel />}
                                  />
                                  <Pie data={chart?.chartData || []} dataKey={chart?.dataKey || ""} nameKey={chart?.nameKey || ""} />
                                </PieChart>
                              </ChartContainer>
                          </CardContent>
                       </Card>)}     
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* {activeTab === "upload" && (
              <div className="grid gap-6">

                <Card className="flex flex-col">
                  <CardHeader className="flex-row justify-between">
                    
                    <div>
                    <CardTitle>Upload Data</CardTitle>
                    <CardDescription>Upload a URL to analyze and get insights.</CardDescription>
                    </div>

                    <div className="flex gap-2 flex-col md:flex-row justify-around">
                      <Link href="https://docs.google.com/spreadsheets/d/1dAGnPNpNVZ2S7qjZQcYBRqFhwsXtHlgfllRAi18HFsk/edit?gid=0#gid=0"><Button>Upload Data Manually / .CSV</Button></Link>
                      
                        <Button onClick={runcsvtojsonapi}>Save Google Sheet Data to DB</Button>

                    </div>
                    
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-muted-foreground/20 hover:border-primary transition-colors">
                      <input
                        className="w-full h-full text-4xl p-5"
                        type="text"
                        placeholder="URL of AUDIO CALL REC"
                        onChange={(e) => setAudioUrl(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between">
                      <select
                        className="px-5 py-3 rounded-lg"
                        onChange={(e) => setUsecase(e.target.value)}
                        name="usecase"
                        id="usecase"
                      >
                        <option value="0">Select</option>
                        <option value="Bank_Service">Bank Service</option>
                        <option value="Credit_Card_Sales">Credit Card Sales</option>
                        <option value="Ecommerce_Sales">Ecommerce Sales</option>
                        <option value="Hotel_Booking">Hotel Booking</option>
                        <option value="Insurance_Sales">Insurance Sales</option>
                        <option value="Payments_Service">Payments Service</option>
                      </select>
                      
                        <Button onClick={aitsacapi}>Test Now</Button>
                    
                    </div>
                  </CardContent>

                  <CardContent>
                    <div>
                      Summary:
                      {apisummary.map((item, index) => (
                        <div key={index}>
                          <br />
                          {item}
                          <br />
                        </div>
                      ))}
                    </div>

                    <br /><br /><br /><br /><br />

                    

                    <div>
                      <h3>Analysis:</h3>
                      {apianalysis && (
                        <div>
                          <p>Customer Sentiment Analysis: {apianalysis.Customer_Sentiment.score} - {apianalysis.Customer_Sentiment.detail}</p>
                          <p>Customer Intent Analysis: {apianalysis.Customer_Intent.score} - {apianalysis.Customer_Intent.detail}</p>
                          <p>Agent Empathy: {apianalysis.Agent_Empathy.score} - {apianalysis.Agent_Empathy.detail}</p>
                          <p>Agent Promptness and Responsiveness: {apianalysis.Agent_Promptness_and_Responsiveness.score} - {apianalysis.Agent_Promptness_and_Responsiveness.detail}</p>
                          <p>Agent Knowledge: {apianalysis.Agent_Knowledge.score} - {apianalysis.Agent_Knowledge.detail}</p>
                          <p>Call Flow Optimization: {apianalysis.Call_Flow_Optimization.score} - {apianalysis.Call_Flow_Optimization.detail}</p>
                          <p>Call Completion Status: {apianalysis.Call_Completion_Status.score} - {apianalysis.Call_Completion_Status.detail}</p>
                          <p>Issue Resolved Status: {apianalysis.Issue_Resolved_Status.score} - {apianalysis.Issue_Resolved_Status.detail}</p>
                        </div>
                      )}
                    </div>




                    <br /><br /><br /><br /><br />

                    <div>
                      Transcript:
                      {apitranscript.map((item, index) => (
                        <div key={index}>
                          Start Timing: {item.start}
                          <br />
                          {item.speaker === 0 ? (
                            <div>
                              <span className="text-orange-700">Agent: </span>
                              {item.transcript}
                            </div>
                          ) : (
                            <div>
                              <span className="text-blue-600">Customer: </span>
                              {item.transcript}
                            </div>
                          )}
                          <br />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )} */}

            {isCompany && activeTab === "uploadCustomer" && (
              <div className="grid gap-6">

                <Card className="flex flex-col">
                  <CardHeader className="flex-row justify-between">
                    
                    <div>
                    <CardTitle>Upload Customer Data</CardTitle>
                    <CardDescription>Upload a URL to save customer details.</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-col md:flex-row justify-around">
                        <Button onClick={saveCustomerInformation}>Save</Button>
                    </div>       
                  </CardHeader>
                  <CardContent className="space-y-4"> 
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-muted-foreground/20 hover:border-primary transition-colors">
                      <input
                        className="w-full h-full text-4xl p-5"
                        type="text"
                        placeholder="URL of Customer Record"
                        onChange={(e) => setCustomerUrl(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}