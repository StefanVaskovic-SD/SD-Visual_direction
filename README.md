# Visual Direction Discovery Summary Tool

A React-based tool that generates visual direction briefs for designers by analyzing questionnaire and persona CSV files using Google Gemini API.

## Features

- 📄 Upload Questionnaire CSV (required)
- 👥 Upload User Personas CSV (required)
- 🌐 Optional website URL for additional analysis
- 🤖 AI-powered summary generation using Gemini API
- 📊 Export results as CSV
- 🎨 Dark theme, minimal UI
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Add your API key to the `.env` file:
   ```bash
   # Copy .env.example to .env if it doesn't exist
   # Then edit .env and add your API key:
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

1. Your API key will be automatically loaded from `.env` file (or enter manually if not set)
2. Upload the **Questionnaire CSV** file (drag & drop or click to browse)
3. Upload the **User Personas CSV** file (drag & drop or click to browse)
4. Optionally enter a website URL for additional analysis
5. Click "Generate Summary" and wait for the AI to process
6. Review the generated summary
7. Click "Export CSV" to download the results

## CSV Format Requirements

### Questionnaire CSV
Required headers:
- Client Name
- Product Name
- Questionnaire Type
- Submitted At
- Section
- Question
- Answer
- Files

### User Personas CSV
Required headers:
- Persona Name
- Persona Type
- (Plus all other persona fields)

## Output Sections

The tool generates 5 sections:

1. **COMPANY & BUSINESS** - Concise summary of company mission, products, and differentiators
2. **TARGET AUDIENCE & USER PERSONAS** - Concise summary covering primary and secondary personas
3. **CUSTOMER JOURNEY** - Concise 2-3 sentence synthesis
4. **WEBSITE GOALS** - Detailed comprehensive goals and expectations
5. **DESIGN & BRANDING** - Detailed summary including all file links

## Section Filtering

The tool automatically:
- **Includes**: Company & Business, Target Audience and User Personas, Design and Branding
- **Excludes**: Tech requirements, Multilingual & Localization, CRM Integration, Analytics & Tracking, Custom Integrations & APIs, Content Management & Migration, SEO and Content, Martech

## Build

```bash
npm run build
```

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Papa Parse (CSV parsing)
- Google Generative AI SDK (Gemini API)

