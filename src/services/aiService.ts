import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class AIService {
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.DOCUMIND_API_KEY;
    if (!key) {
      throw new Error("❌ Gemini API Key is missing! Please provide it via -k or set DOCUMIND_API_KEY environment variable.");
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async generateDoc(fileContent: string): Promise<string> {
    const prompt = `
You are an expert Senior Backend Engineer and a world-class OpenAPI/Swagger Architect.
Analyze the following Express.js source code (including its routes, controllers, and validations).

Your absolute main task is to extract all API endpoints, methods, and schemas to populate a valid OpenAPI 3.0 JSON object.

Strict Instructions for High-Quality Documentation:
1. **DO NOT return an empty paths object**. You must extract the routes found in the code (e.g., /register, /login, /logout, /profile).
2. **RICH DESCRIPTIONS AND SUMMARIES (CRITICAL)**: For every single operation (get, post, put, delete, etc.) under each route, you MUST include:
   - "summary": A short, clear, one-sentence explanation of what the endpoint does.
   - "description": A highly detailed paragraph explaining the inner mechanics and business logic of the endpoint. For example, explain if it performs password hashing, check if user exists, generates a JWT session token, or requires specific middleware/roles. Do not make it generic.
3. For each route, trace its controller function to document the expected request body, parameters, and HTTP response status codes (like 200, 201, 400, 401, 500) with descriptive answers for each status.
4. Extract payload fields into components.schemas.
5. **CRITICAL REGEX HANDLING**: If you write any regular expressions inside string patterns, double-escape all backslashes (use \\\\ instead of \\) so the output is perfectly valid JSON.
6. Return ONLY a valid JSON object matching this schema style:
{
  "paths": {
    "/api/route": {
      "post": {
        "tags": ["Auth"],
        "summary": "...",
        "description": "...",
        "requestBody": { ... },
        "responses": { ... }
      }
    }
  },
  "components": {
    "schemas": { ... }
  }
}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: [prompt, fileContent],
        config: {
          responseMimeType: 'application/json',
        }
      });

      let cleanText = response.text || '{}';
      
      if (cleanText.includes('\`\`\`')) {
        cleanText = cleanText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      }

      return cleanText;
    } catch (apiError: any) {
      console.error(`\n❌ Gemini API Error: ${apiError.message}`);
      return '{}';
    }
  }
}