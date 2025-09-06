import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, temperature = 0.2, max_tokens = 384, user_api_key } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use user's API key if provided, otherwise fall back to system key
    const GEMINI_API_KEY = user_api_key || Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('No Gemini API key available');
      return new Response(JSON.stringify({ error: "No API key available. Please add your Gemini API key in Settings." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making Gemini API request with messages:', messages.length, 'using', user_api_key ? 'user' : 'system', 'API key');

    // Convert messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      contents,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: max_tokens,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorMessage = data.error?.message || `Gemini API error: ${response.status}`;
      console.error('Gemini API error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Extract response content
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    // Return in expected format
    const result = {
      choices: [{
        message: {
          role: "assistant",
          content: content
        }
      }]
    };
    
    console.log('Successfully processed AI request');
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});