import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { amount, name } = await req.json();

        // Prompt engineering based on amount
        let prompt = `Write a short, funny, and rhyming Vietnamese New Year wish for a person named "${name}". `;

        if (amount >= 500000) {
            prompt += `They just received a huge lucky money (${amount} VND). Make it sound grand and slightly jealous but congratulatory.`;
        } else if (amount >= 50000) {
            prompt += `They received a decent amount (${amount} VND). Wish them health and more money.`;
        } else {
            prompt += `They received a tiny amount (${amount} VND) or a funny gift. Make it a humorous, roasting wish about "poverty" or "luck next time".`;
        }

        // Call OpenAI or Lovable AI here
        // For demo purposes, we mock the response since we don't have the key yet
        // const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', ...);

        // Mock Response
        const mockWishes = [
            "Tiền ít lòng nhiều, bao nhiêu cũng quý!",
            "Chúc bạn năm mới tiền đầy túi, tình đầy tim!",
            "Năm nay nghèo thì năm sau giàu, lo gì!",
            "Đại gia đây rồi, xin vía xin vía!"
        ];
        const generatedWish = mockWishes[Math.floor(Math.random() * mockWishes.length)];

        return new Response(
            JSON.stringify({ wish: generatedWish }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
});
