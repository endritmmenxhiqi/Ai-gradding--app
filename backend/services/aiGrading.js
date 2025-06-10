const axios = require('axios');
const apiKey = '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';

async function evaluateWithAI(answerText, criteria) {
  try {
    const formattedCriteria = Array.isArray(criteria)
      ? criteria.join('\n- ')
      : `- ${criteria}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: `
Je një vlerësues AI për detyra studentore. Vlerëso përgjigjen vetëm në bazë të kritereve të mëposhtme:

Kriteret:
${formattedCriteria}

Përcakto nëse përgjigjja është në përputhje me kriteret. Jep një notë nga 5 deri në 10 dhe pastaj një koment të shkurtër që shpjegon pse u dha ajo notë.

Formati i kthimit:
Nota: [vlera]
Koment: [teksti]`
          },
          {
            role: "user",
            content: `Përgjigjja e studentit: ${answerText}`
          }
        ],
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content.trim();

    const gradeMatch = content.match(/Nota:\s*(\d+(\.\d+)?)/i);
    const commentMatch = content.match(/Koment:\s*(.*)/i);

    const grade = gradeMatch ? parseFloat(gradeMatch[1]) : NaN;
    const comment = commentMatch ? commentMatch[1].trim() : "Nuk ka koment.";

    if (isNaN(grade) || grade < 5 || grade > 10) {
      return {
        grade: 5,
        comment: "AI nuk mund të përcaktojë notën saktë."
      };
    }

    return { grade, comment };

  } catch (err) {
    console.error("Gabim nga AI:", err.message);
    return {
      grade: 5,
      comment: "Gabim gjatë vlerësimit nga AI."
    };
  }
}

module.exports = evaluateWithAI;
