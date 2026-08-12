export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, model } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

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
        
        if (!response.ok) {
            return res.status(200).json({
                candidates: [{
                    content: {
                        parts: [{ text: '❌ خطأ من API: ' + (data.error?.message || 'غير معروف') }]
                    }
                }]
            });
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(200).json({
            candidates: [{
                content: {
                    parts: [{ text: '❌ خطأ في الاتصال: ' + error.message }]
                }
            }]
        });
    }
}
