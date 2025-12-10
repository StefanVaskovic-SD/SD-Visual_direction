/**
 * Build prompts for Gemini API to generate each section of the summary
 */

/**
 * Build prompt for Company & Business section
 */
export function buildCompanyBusinessPrompt(questionnaireData, websiteUrl) {
  const companyAnswers = questionnaireData.data
    .filter(item => item.section === 'Company & Business')
    .map(item => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n')
  
  let prompt = `Based on the following questionnaire answers about the company and business, provide a CONCISE summary (2-3 paragraphs maximum) of the company's mission, products/services, unique value proposition, and key differentiators.\n\n${companyAnswers}`
  
  if (websiteUrl) {
    prompt += `\n\nAdditionally, analyze the company's website at ${websiteUrl} and incorporate insights about what kind of company this is based on their website presence.`
  }
  
  return prompt
}

/**
 * Build prompt for Target Audience & User Personas section
 */
export function buildTargetAudiencePrompt(questionnaireData, personasData) {
  const audienceAnswers = questionnaireData.data
    .filter(item => item.section === 'Target Audience and User Personas')
    .map(item => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n')
  
  // Format personas data
  const personasText = personasData.map(persona => {
    return `Persona: ${persona.personaName} (${persona.personaType})
Age: ${persona.ageRange}
Gender: ${persona.gender}
Location: ${persona.location}
Income: ${persona.incomeLevel}
Net Worth: ${persona.netWorth}
Education: ${persona.education}
Occupation: ${persona.occupation}
Family Status: ${persona.familyStatus}
Values: ${persona.values}
Motivations: ${persona.motivations}
Lifestyle: ${persona.lifestyle}
Interests: ${persona.interests}
Goals: ${persona.goals}
Challenges: ${persona.challenges}
Needs: ${persona.needs}
Pain Points: ${persona.painPoints}
Quote: ${persona.quote}
Key Characteristics: ${persona.keyCharacteristics}`
  }).join('\n\n---\n\n')
  
  return `Based on the following questionnaire answers and detailed persona data, provide a CONCISE summary (2-3 paragraphs maximum) covering both Primary and Secondary personas. Focus on key characteristics, motivations, needs, and pain points.\n\nQuestionnaire Answers:\n${audienceAnswers}\n\nPersona Data:\n${personasText}`
}

/**
 * Build prompt for Customer Journey section
 */
export function buildCustomerJourneyPrompt(questionnaireData) {
  // Customer Journey might be in "Target Audience and User Personas" or separate section
  // Based on the CSV, it appears to be a separate section
  const journeyAnswers = questionnaireData.data
    .filter(item => 
      item.section === 'Customer Journey' || 
      (item.section === 'Target Audience and User Personas' && 
       item.question.toLowerCase().includes('journey'))
    )
    .map(item => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n')
  
  // Also include relevant answers from other included sections
  const allAnswers = questionnaireData.data
    .map(item => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n')
  
  return `Based on the following questionnaire answers, synthesize a CONCISE customer journey summary (2-3 sentences maximum) that describes how potential customers discover, evaluate, and engage with the business.\n\n${allAnswers}`
}

/**
 * Build prompt for Website Goals section
 */
export function buildWebsiteGoalsPrompt(questionnaireData) {
  const goalsAnswers = questionnaireData.data
    .filter(item => item.section === 'Website Goals')
    .map(item => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n')
  
  return `Analyze the following questionnaire answers about website goals and create a CONCISE, well-structured summary (2-3 paragraphs maximum) that synthesizes the client's needs and requirements.

Your task is to:
1. ANALYZE the answers to understand the client's true needs and priorities
2. SYNTHESIZE the information into clear, actionable insights
3. Write in a professional, summary format - NOT a copy-paste of the answers

Focus on:
- Main purpose and strategic role of the website
- Key features and functionalities that matter most to the client
- Performance and scalability expectations (summarize, don't list everything)
- How the website supports their business strategy

Write as if you're creating a brief for a design/development team - clear, actionable, and focused on what matters most. Do NOT simply copy the questionnaire answers verbatim.

Questionnaire Answers:
${goalsAnswers}`
}

/**
 * Build prompt for Design & Branding section
 */
export function buildDesignBrandingPrompt(questionnaireData) {
  const designAnswers = questionnaireData.data
    .filter(item => item.section === 'Design and Branding')
    .map(item => {
      let text = `Q: ${item.question}\nA: ${item.answer}`
      if (item.files) {
        text += `\nFiles/Links: ${item.files}`
      }
      return text
    })
    .join('\n\n')
  
  // Extract all file links
  const fileLinks = questionnaireData.data
    .filter(item => item.section === 'Design and Branding' && item.files)
    .map(item => item.files)
    .filter((link, index, self) => self.indexOf(link) === index) // Remove duplicates
  
  let prompt = `Analyze the following questionnaire answers about design and branding requirements and create a CONCISE, well-structured summary (2-3 paragraphs maximum) that synthesizes the client's visual direction needs.

Your task is to:
1. ANALYZE the answers to understand the client's brand identity, visual preferences, and design goals
2. SYNTHESIZE the information into clear, actionable design direction
3. Write in a professional, summary format - NOT a copy-paste of the answers

Focus on:
- Brand identity direction (colors, typography, logo approach) - summarize key specifications
- Core emotions and messages the design should convey - synthesize the essence, don't list everything
- Competitive positioning - how they want to differentiate visually
- Primary design objectives - what matters most to them

Write as if you're creating a visual direction brief for a design team - clear, actionable, and focused on what matters most. Do NOT simply copy the questionnaire answers verbatim.

CRITICAL FORMATTING REQUIREMENT:
At the very end of your response, you MUST include a "Files:" section. 
- If file links are provided below, list them one per line after "Files:"
- If no file links are provided, write exactly: "Files: no files found"

Questionnaire Answers:
${designAnswers}`
  
  if (fileLinks.length > 0) {
    prompt += `\n\nFiles to include in "Files:" section:\n${fileLinks.join('\n')}`
  } else {
    prompt += `\n\nNo files were provided in the questionnaire.`
  }
  
  return prompt
}

