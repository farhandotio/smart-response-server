import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const analyzeLogWithAI = async (logContent) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    Context: You are the "SIRP AI Monitoring System". You are an autonomous, high-level diagnostic engine. 
    Your goal is to analyze logs from any environment (VPS, Cloud, Shared Hosting) and any tech stack (JavaScript, PHP, Python, Java, etc.).

    Log Data:
    ${logContent.slice(0, 15000)}

    Decision Logic:
    1. Identify the core failure: Is it a Database crash, a Frontend UI break, a Backend logic error, an Environment (.env) mismatch, or a VPS/Server-level issue (Nginx/Apache/Docker)?
    2. Expert Routing: Based on the error, decide which expertise is needed. 
       - If it's a memory leak or server crash -> "DevOps" or "System Admin".
       - If it's a query failure -> "Database" or "Backend".
       - If it's a missing env variable -> "DevOps" or "Backend".
    
    Strict Security & Privacy:
    1. NEVER expose full URLs, API Tokens, Secrets, or internal folder structures.
    2. Refer only to the host/domain (e.g., "localhost:5000" or "myapp.com").
    3. Mask any sensitive credentials found in logs as [REDACTED].

    Return JSON Format:
    {
      "isIssue": boolean,
      "title": "Professional summary of the incident",
      "description": "Deep technical breakdown + step-by-step resolution",
      "severity": "low" | "medium" | "high" | "critical",
      "affectedServices": ["ExpertiseRequired", "SpecificTechnology"] 
    }
    Example affectedServices: ["Backend", "Node.js"] or ["DevOps", "Nginx"] or ["Database", "MongoDB"].
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(text);
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await fallbackModel.generateContent(prompt);
        return JSON.parse(
          result.response
            .text()
            .replace(/```json|```/g, '')
            .trim()
        );
      } catch (innerError) {
        return { isIssue: false, error: 'Monitoring engine is offline' };
      }
    }
    return { isIssue: false };
  }
};
