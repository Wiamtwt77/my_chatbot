// api/chat.js - نسخة محسّنة
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, model } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // جرب generateContent أولاً
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: messages })
            }
        );

        const data = await response.json();
        
        if (response.ok && data.candidates) {
            return res.status(200).json(data);
        }
        
        // إذا فشل، جرب interactions
        throw new Error('generateContent failed');

    } catch (err1) {
        // fallback: جرب interactions API
        try {
            const lastMsg = messages[messages.length - 1]?.parts?.[0]?.text || 'Hello';
            
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/interactions',
                {
                    method: 'POST',
                    headers: {
                        'x-goog-api-key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model || 'gemini-2.0-flash',
                        input: lastMsg
                    })
                }
            );

            const data = await response.json();
            
            res.status(200).json({
                candidates: [{
                    content: {
                        parts: [{ text: data.output_text || data.error?.message || 'خطأ في API' }]
                    }
                }]
            });

        } catch (err2) {
            res.status(500).json({ error: 'فشل الاتصال بالذكاء الاصطناعي: ' + err2.message });
        }
    }
}
