"use client";

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// ⚠️ For demo only — API key will be exposed client-side
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY, 
});

export default function GeminiChat() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendPrompt() {
    if (!prompt.trim()) return;
    setLoading(true);
    setReply("");

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      setReply(result.text || "⚠️ No response from Gemini.");
    } catch (err: any) {
      console.error(err);
      setReply("❌ Error: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-lg p-4 border rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3">Gemini Assistant</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask Gemini..."
        className="w-full p-2 border rounded mb-2"
        rows={3}
      />

      <button
        onClick={sendPrompt}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {reply && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>Gemini:</strong>
          <p className="whitespace-pre-wrap">{reply}</p>
        </div>
      )}
    </div>
  );
}
