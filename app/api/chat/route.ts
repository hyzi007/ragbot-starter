import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Astra DB HTTP API helper
async function searchKnowledgeBase(query: string, limit: number = 5) {
  const url = `${process.env.ASTRA_DB_API_ENDPOINT}/api/json/v1/default_keyspace/knowledge_base`;
  
  const headers = {
    'Token': process.env.ASTRA_DB_APPLICATION_TOKEN!,
    'Content-Type': 'application/json'
  };

  const body = {
    "find": {
      "filter": {},
      "sort": { "$vectorize": query },
      "options": {
        "limit": limit,
        "includeSimilarity": true
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.documents;
  } catch (error) {
    console.error('Error searching Astra DB:', error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { messages, useRag, llm, similarityMetric } = await req.json();

    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = '';
    
    if (useRag) {
      // Search using HTTP API
      const documents = await searchKnowledgeBase(latestMessage);
      
      // Format the context with title and content
      docContext = `
        START CONTEXT
        ${documents?.map((doc: any) => {
          return `Title: ${doc.title}
Content: ${doc.content}
URL: ${doc.url || 'N/A'}
Tags: ${doc.tags?.join(', ') || 'N/A'}
Relevance: ${((doc.$similarity || 0) * 100).toFixed(1)}%
---`;
        }).join("\n\n")}
        END CONTEXT
      `;
    }

    const ragPrompt = [
      {
        role: 'system',
        content: `You are an AI assistant answering questions based on a knowledge base. 
        ${useRag ? `Use the following context to answer questions. The context includes article titles, content, URLs, tags, and relevance scores.
        ${docContext}` : ''}
        
        Instructions:
        - If using context, prioritize information from higher relevance scores
        - ALWAYS cite sources by mentioning the article title in **bold** format like this: **Article Title**
        - When you use information from a specific article, include its relevance score in parentheses, e.g., (95.2% relevance)
        - If the context contains a URL, ALWAYS include it at the end of the relevant section as a markdown link: [Číst více](URL)
        - Format URLs with underline using this syntax: [<u>Číst více</u>](URL)
        - If the answer is not in the context, say "Nemám k této otázce informace ve znalostní databázi"
        - Be concise but thorough in your responses
        - Use markdown formatting:
          - **Bold** for article titles/sources
          - *Italic* for emphasis
          - Lists where appropriate
          - Code blocks for technical content
        - At the end of your response, if there are relevant URLs, create a section:
          
          ### 📚 Další zdroje:
          - [<u>Article Title</u>](URL) (relevance %)
          
        - Respond in Czech language`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: llm ?? 'gpt-3.5-turbo',
      stream: true,
      messages: [...ragPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}