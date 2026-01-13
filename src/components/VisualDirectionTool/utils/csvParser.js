import Papa from 'papaparse'

/**
 * Sections to INCLUDE in the summary
 */
const INCLUDED_SECTIONS = [
  'Company & Business',
  'Target Audience and User Personas',
  'Design and Branding'
]

/**
 * Sections to EXCLUDE completely
 */
const EXCLUDED_SECTIONS = [
  'Tech requirements',
  'Multilingual & Localization',
  'CRM Integration',
  'Analytics & Tracking',
  'Custom Integrations & APIs',
  'Content Management & Migration',
  'SEO and Content',
  'Martech'
]

/**
 * Parse questionnaire CSV and filter sections
 * CSV structure: metadata rows first, then header row, then data rows
 */
export function parseQuestionnaireCSV(csvText) {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvText.split('\n')
      const metadata = {}
      let headerRowIndex = -1
      
      // Find the header row (Section, Question, Answer, Files)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase()
        if (line.includes('section') && line.includes('question') && 
            line.includes('answer') && line.includes('files')) {
          headerRowIndex = i
          break
        }
      }
      
      if (headerRowIndex === -1) {
        reject(new Error('Could not find header row with Section, Question, Answer, Files'))
        return
      }
      
      // Extract metadata from rows before header (parse synchronously)
      const metadataSection = lines.slice(0, headerRowIndex).join('\n')
      if (metadataSection.trim()) {
        const metaResults = Papa.parse(metadataSection, {
          header: false,
          skipEmptyLines: true
        })
        
        metaResults.data.forEach((row) => {
          if (Array.isArray(row) && row.length >= 2) {
            const key = row[0]?.trim()
            const value = row.slice(1).join(',').trim().replace(/^"|"$/g, '')
            
            if (key === 'Client Name') metadata.clientName = value
            if (key === 'Product Name') metadata.productName = value
            if (key === 'Questionnaire Type') metadata.questionnaireType = value
            if (key === 'Submitted At') metadata.submittedAt = value
          }
        })
      }
      
      // Parse data section starting from header row
      const dataSection = lines.slice(headerRowIndex).join('\n')
      
      Papa.parse(dataSection, {
        header: true,
        skipEmptyLines: true,
        complete: (dataResults) => {
          const dataRows = []
          
          dataResults.data.forEach((row) => {
            if (row['Section'] && row['Question']) {
              const section = row['Section'].trim()
              
              // Filter: include only specified sections, exclude others
              if (INCLUDED_SECTIONS.includes(section)) {
                dataRows.push({
                  section: section,
                  question: row['Question'],
                  answer: row['Answer'] || '',
                  files: row['Files'] || ''
                })
              } else if (EXCLUDED_SECTIONS.includes(section)) {
                // Explicitly skip excluded sections
                return
              }
            }
          })
          
          resolve({
            metadata,
            data: dataRows
          })
        },
        error: (error) => {
          reject(new Error(`Failed to parse data section: ${error.message}`))
        }
      })
    } catch (error) {
      reject(new Error(`Failed to parse questionnaire CSV: ${error.message}`))
    }
  })
}

/**
 * Parse personas CSV
 */
export function parsePersonasCSV(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const personas = results.data
            .filter(row => row['Persona Name']) // Filter out empty rows
            .map(row => ({
              personaName: row['Persona Name'],
              personaType: row['Persona Type'],
              ageRange: row['Age Range'],
              gender: row['Gender'],
              location: row['Location'],
              incomeLevel: row['Income Level'],
              netWorth: row['Net Worth'],
              education: row['Education'],
              occupation: row['Occupation'],
              familyStatus: row['Family Status'],
              values: row['Values'],
              motivations: row['Motivations'],
              lifestyle: row['Lifestyle'],
              interests: row['Interests'],
              goals: row['Goals'],
              challenges: row['Challenges'],
              needs: row['Needs'],
              painPoints: row['Pain Points'],
              quote: row['Quote'],
              keyCharacteristics: row['Key Characteristics']
            }))
          
          resolve(personas)
        } catch (error) {
          reject(new Error(`Failed to parse personas CSV: ${error.message}`))
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`))
      }
    })
  })
}

/**
 * Validate questionnaire CSV structure
 * CSV has metadata rows first, then actual headers on line 6
 */
export function validateQuestionnaireCSV(csvText) {
  return new Promise((resolve, reject) => {
    // Parse without header first to check structure
    Papa.parse(csvText, {
      header: false,
      complete: (results) => {
        const lines = results.data
        if (lines.length === 0) {
          reject(new Error('CSV file is empty'))
          return
        }
        
        // Check if we have the data header row (Section, Question, Answer, Files)
        // This should be around line 6 (index 5) after metadata rows
        let foundDataHeaders = false
        let foundMetadata = false
        
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
          const line = lines[i]
          if (Array.isArray(line)) {
            const lineStr = line.join(',').toLowerCase()
            
            // Check for metadata headers
            if (lineStr.includes('client name') && lineStr.includes('product name')) {
              foundMetadata = true
            }
            
            // Check for data headers
            if (lineStr.includes('section') && lineStr.includes('question') && 
                lineStr.includes('answer') && lineStr.includes('files')) {
              foundDataHeaders = true
              break
            }
          }
        }
        
        if (!foundDataHeaders) {
          reject(new Error('CSV file is missing required headers: Section, Question, Answer, Files'))
          return
        }
        
        resolve(true)
      },
      error: (error) => {
        reject(new Error(`CSV validation error: ${error.message}`))
      }
    })
  })
}

/**
 * Validate personas CSV structure
 */
export function validatePersonasCSV(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        const requiredHeaders = ['Persona Name', 'Persona Type']
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
        
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`))
          return
        }
        
        resolve(true)
      },
      error: (error) => {
        reject(new Error(`CSV validation error: ${error.message}`))
      }
    })
  })
}

