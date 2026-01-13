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
  
  return `You are summarizing website goals from a questionnaire. Use ONLY the information provided below. Do NOT invent or assume anything. Extract and organize the actual answers given.

Provide a DETAILED summary that includes:
- Main purpose of the website
- How it supports business strategy
- Must-have features and functionalities
- Performance, scalability, and maintenance expectations

Base your response STRICTLY on the questionnaire answers below. Do not add generic examples or assumptions.

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
  
  let prompt = `You are summarizing design and branding requirements from a questionnaire. Use ONLY the information provided below. Do NOT invent or add generic examples. Be DETAILED but CONCISE - focus on what was actually specified.

Provide a comprehensive summary covering:
- Brand identity (logo, colors, typography) - use exact specifications from answers
- Emotions and messages to convey - use exact quotes/phrases from answers
- Competitors and how to stand out - use specific competitors mentioned
- Primary design goals - use exact goals stated

CRITICAL: Include ALL file links provided in the Files column. List them clearly.

Base your response STRICTLY on the questionnaire answers below. Do not add filler content or generic design advice.

Questionnaire Answers:
${designAnswers}`
  
  if (fileLinks.length > 0) {
    prompt += `\n\nREQUIRED LINKS TO INCLUDE:\n${fileLinks.join('\n')}`
  }
  
  return prompt
}

