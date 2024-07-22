export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Usercall from '@/app/models/Usercall';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
const { createClient } = require("@deepgram/sdk");
import Groq from "groq-sdk";
import mongoose from 'mongoose';
import OpenAI from "openai";
const llm_client:any = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPromptFolder = path.join(process.cwd(), 'src/system_prompts');

interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const getSystemPrompt = (filename: string): ChatCompletionMessageParam[] => {
  const systemPrompt: ChatCompletionMessageParam[] = [];
  const filePath = path.join(systemPromptFolder, filename);

  //OLD CODE
  /* const fileContent = fs.readFileSync(filePath, 'utf-8');
  fileContent.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length === 2) {
      const [key, value] = parts;
      systemPrompt.push({ role: "system", content: value });
    }
  }); */
  const fileContent = fs.readFileSync(filePath, 'utf-8').trim();
  const blocks = fileContent .split('\n\n'); // Split the content by blank lines

  for (const block of blocks) {
    systemPrompt.push({ role: 'system', content: block });
  }

  return systemPrompt;
};

const llmResponse = async (query: string, conversationHistory: ChatCompletionMessageParam[]) => {
  //OLD CODE
  /* const response = await groq.chat.completions.create({
    messages: conversationHistory.concat({ role: "user", content: query }),
    model: "llama3-8b-8192",
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  }); */
  const response = await llm_client.chat.completions.create({
    messages: conversationHistory.concat({ role: "user", content: query }),
    model: "gpt-4o-mini",
    response_format: { "type": "json_object" },
    temperature: 0.5,
    stream: false,
  });

  try {
    return response.choices[0]?.message?.content || '{}';
  } catch (error) {
    console.error('Failed to parse LLM response as JSON:', error);
    return response.choices[0]?.message?.content || '';
  }
};

const getCallAnalysis = async (systemPromptFile: string, transcriptWithSpeakers: any) => {
  const systemPrompt = getSystemPrompt(systemPromptFile);
  const conversationHistory: ChatCompletionMessageParam[] = [...systemPrompt];

  transcriptWithSpeakers.forEach((utterance: any) => {
    const role: 'user' | 'assistant' = utterance.speaker === 0 ? "user" : "assistant";
    conversationHistory.push({ role, content: utterance.transcript });
  });

  const initialQuery = "Below is the transcript of the call between agent and customer \n {transcript_with_speakers}. \n There could be ASR and speaker recognition errors, especially for numbers and proper nouns. I will be asking more questions in further queries, only reply 'okay, got it' in json format to this query."
  const initialOutput = await llmResponse(initialQuery, conversationHistory)
  conversationHistory.push({ role: "assistant", content: initialOutput });

  //OLD CODE
  /* const summaryQuery = "There could be ASR and speaker recognition errors. Assume the call is getting transferred to the supervisor. Please write a conversation summary with bullet points wherever applicable, for the supervisor to get an overall understanding of conversation so far.";
  const callSummary = await llmResponse(summaryQuery, conversationHistory);

  const analysisQuery = "There could be ASR and speaker recognition errors. I'm looking to analyze conversations for call center analytics. Perform Customer Sentiment Analysis, Customer Intent Analysis, Agent Empathy, Agent Promptness and Responsiveness, Agent Knowledge, Call Flow Optimization, Call Completion Status value as Completed or Not Completed only, Issue Resolved Status value as Resolved or Not Resolved only. Output should be in JSON format without headings. For ratings, use numbers like 8 instead of formats like 8/10. The JSON structure should follow this format: { Customer_Sentiment: {score, detail}, Customer_Intent: {score, detail}, Agent_Empathy: {score, detail}, Agent_Promptness_and_Responsiveness: {score, detail}, Agent_Knowledge: {score, detail}, Call_Flow_Optimization: {score, detail}, Call_Completion_Status , Issue_Resolved_Status }. Ensure each metric includes a score and a detail. Remove the heading and just provide the JSON ";
  const callAnalysis = await llmResponse(analysisQuery, conversationHistory); */

  const analysisQuery = "Perform call analysis by referring to metrics explained in system prompt. The output should be in JSON format, following this structure: {\
  \"problem_code\": \"\",\
  \"issue_resolution_status\": \"\",\
  \"action\": \"\",\
  \"estimated_time\": \"1 day\",\
  \"sentiment_analysis\": {\
      \"overall_score\": 0,\
      \"detail\": \"\",\
      \"empathy\": 0,\
      \"apology\": 0,\
      \"listening_rapport\": 0\
  },\
  \"call_opening\": {\
      \"overall_score\": 0,\
      \"detail\": \"\",\
      \"greetings\": \"\",\
      \"brand_name\": \"\",\
      \"name_exchange\": \"\"\
  },\
  \"context_setting\": {\
      \"score\": 0,\
      \"detail\": \"\"\
  },\
  \"privacy\": \"\",\
  \"dead_air\": 0,\
  \"process_information\": {\
      \"score\": 0,\
      \"detail\": \"\",\
      \"objection\": \"\",\
      \"escalation\": \"\",\
      \"information_disclosure\": 0\
  },\
  \"call_closing\": 0,\
  \"zero_tolerance\": {\
      \"rude_unprofessional\": \"\",\
      \"dead_air\": \"\",\
      \"misleading\": \"\",\
      \"fraudulent\": \"\"\
  }\
  }\
  Please provide only the JSON output, without any additional text or headers."
  const callAnalysis = await llmResponse(analysisQuery, conversationHistory);
  conversationHistory.push({ role: "assistant", content: callAnalysis });
  
  const summaryQuery = "Give customer profile and write a conversation summary with bullet points, in less than 50 words. Output should be in json foramt: {summary: \"\"}"
  const callSummary = await llmResponse(summaryQuery, conversationHistory);

  return [callSummary, callAnalysis];
};

function convertsummarytojson(summary: string): { summary: string[] } {
  const points = summary.trim().split("\n* ");
  points.shift();

  const conversation: { summary: string[] } = { summary: [] };

  points.forEach(point => {
    conversation.summary.push(point.trim());
  });

  return conversation;
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const response = await axios.get("https://script.googleusercontent.com/macros/echo?user_content_key=VVwQS3Mc1ChjKEVPX8GOXliBCjB0RIVorj5PDLJ1blucuR1B1as6FWwnbPLoyIXkEfmuoYWQj_mHSZ6h4Y_WPsAX8o_ZbL8rm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFX5JBsQ8YM32klPfmWp55E08CQUnTMwKcuPxggUm5C3Op_pE8hjaKWkOEV_Er5mRozy-Hu42ASpw11Z7KWABBk7uK8d3rpbSw&lib=M6P1E-s_hX4OUe_H0twS18f0P_ayHuz1V");
    await dbConnect();

    const body = await req.json();
    const companyId = body.companyId;

    for (let i = 1; i < response.data.data.length; i++) {
      const callID = response.data.data[i].Call_ID;
      const existingRecord = await Usercall.findOne({ Call_ID: callID , companyId: new mongoose.Types.ObjectId(companyId)});       //Time Consumed

      if (existingRecord) {
        console.log(`Record already exists for Call_ID: ${callID}`);
        continue; // Skip this entry if it already exists
      }

      let usecase = response.data.data[i].Usecase;
      let audioUrl = response.data.data[i].Call_Recording_URL;
      //TODO get system prompt file name from new collection
      //let systemPromptFile = `${usecase}.txt`;
      let systemPromptFile = `system_prompt_hitachi.txt`;

      try {
        const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(   //Time Consumed
          { url: audioUrl },
          {
            model: "nova-2",
            utterances: true,
            language: "hi",
            detect_language: true,
            diarize: true,
            punctuate: true,
            smart_format: true,
            numerals: true,
            paragraphs: true,
          }
        );

        if (error) {
          console.error('Error during transcription: URL / Usecase Incorrect');
          continue;
        }

        const transcriptWithSpeakers = result.results.utterances.map((utterance: any) => ({
          speaker: utterance.speaker,
          start: utterance.start,
          transcript: utterance.transcript
        }));

        console.log("Transcription done for row:", i);

        const [callSummary, callAnalysis] = await getCallAnalysis(systemPromptFile, transcriptWithSpeakers);  //Time Consumed
        //const jsonconvertedsummary = convertsummarytojson(callSummary); //OLD CODE
        const jsonconvertedsummary = JSON.parse(callSummary);
        const jsonconvertedanalysis = JSON.parse(callAnalysis);


        console.log("Analysis Done for row:", i);

        try {
          await Usercall.create({
            Call_ID: callID,
            Customer_ID: response.data.data[i].Customer_ID,
            Agent_Name: response.data.data[i].Agent_Name,
            Call_Recording_URL: response.data.data[i].Call_Recording_URL,
            Usecase: response.data.data[i]?.Usecase || "-",
            Transcript: JSON.stringify(transcriptWithSpeakers),
            Summary: JSON.stringify(jsonconvertedsummary),
            Analysis: JSON.stringify(jsonconvertedanalysis),
            companyId: companyId
          });

          console.log("Data inserted successfully for row:", i,"in Database");
          
        } catch (e) {
          console.log(e)
          console.error('Data already present in database for row:', i);
        }
      } catch (e) {
        console.error('Error during transcription:', i);
      }
    }

    return NextResponse.json({ message: "Data Inserted Successfully" });
  } catch (axiosError) {
    console.error('Axios error:', axiosError);
    return NextResponse.json({ error: 'Failed to fetch data' });
  }
}