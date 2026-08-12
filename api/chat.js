export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: messages.map(m => ({
                    role: m.role === 'model' ? 'assistant' : m.role,
                    content: m.parts[0].text
                })),
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'خطأ ' + response.status);
        }

        const reply = data.choices[0].message.content;
        
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: reply }]
                }
            }]
        });

    } catch (error) {
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: '❌ خطأ: ' + error.message }]
                }
            }]
        });
    }
}
