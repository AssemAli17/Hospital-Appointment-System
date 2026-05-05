const pool = require('../config/db');
const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const analyseSymptoms = async (req, res) => {
    const { symptoms } = req.body;
    const patient_id = req.user.user_id;

    if (!symptoms) {
        return res.status(400).json({ message: 'Please provide your symptoms' });
    }

    try {
        const completion = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a medical triage assistant for a hospital appointment system. 
                    Based on the patient's symptoms, recommend the most appropriate hospital department from this list only:
                    General Practice, Cardiology, Dermatology, Neurology, Orthopaedics, Psychiatry, Paediatrics, Gynaecology, Urology, Gastroenterology.
                    Respond in this exact JSON format only:
                    {
                        "recommended_department": "Department Name",
                        "reason": "Brief explanation in one sentence",
                        "urgency": "Low/Medium/High"
                    }
                    Do not include any other text outside the JSON.`
                },
                {
                    role: 'user',
                    content: `My symptoms are: ${symptoms}`
                }
            ],
            max_tokens: 200
        });

        const aiResponse = completion.choices[0].message.content;
const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
const parsed = JSON.parse(cleanResponse);

        const dept = await pool.query(
            'SELECT department_id FROM departments WHERE name = $1',
            [parsed.recommended_department]
        );

        const recommended_dept_id = dept.rows.length > 0 ? dept.rows[0].department_id : null;

        await pool.query(
            'INSERT INTO triage_logs (patient_id, recommended_dept, symptoms_text, ai_response) VALUES ($1, $2, $3, $4)',
            [patient_id, recommended_dept_id, symptoms, aiResponse]
        );

        res.status(200).json({
            message: 'Triage analysis complete',
            recommended_department: parsed.recommended_department,
            reason: parsed.reason,
            urgency: parsed.urgency,
            department_id: recommended_dept_id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Triage analysis failed. Please try again.' });
    }
};

module.exports = { analyseSymptoms };