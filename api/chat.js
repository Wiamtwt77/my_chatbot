export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, model } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    try {
        // ✅ API الجديد - interactions
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
                    input: messages[messages.length - 1]?.parts?.[0]?.text || 'Hello',
                    generation_config: {
                        temperature: 0.7
                    }
                })
            }
        );

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API Error');
        }

        // ✅ تحويل الرد إلى نفس الصيغة القديمة
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: data.output_text || 'لا يوجد رد' }]
                }
            }]
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
