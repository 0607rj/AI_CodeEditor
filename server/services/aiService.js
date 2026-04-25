// server/services/aiService.js
// Wrapper around Groq SDK for structured AI responses
// WHY: Swapped from Gemini to Groq as per user request. 
// Uses llama-3.3-70b-specdec for fast and high-quality code analysis.

import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

let groq;

/**
 * Initialize Groq client lazily
 */
const getGroqClient = () => {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_')) {
      throw new Error('GROQ_API_KEY is not configured. Please set it in .env');
    }
    groq = new Groq({ apiKey });
  }
  return groq;
};

/**
 * Send a prompt to Groq and get a structured JSON response
 * @param {string} prompt - The full prompt string
 * @returns {Object} Parsed JSON response
 */
export const generateAIResponse = async (prompt) => {
  try {
    const client = getGroqClient();

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI code expert. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-specdec',
      temperature: 0.5,
      max_tokens: 8192,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Groq AI Service Error:', error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

/**
 * Analyze code using Intent Mode
 */
export const analyzeCode = async (prompt) => {
  return generateAIResponse(prompt);
};

/**
 * Explain code/codebase
 */
export const explainCode = async (prompt) => {
  return generateAIResponse(prompt);
};
