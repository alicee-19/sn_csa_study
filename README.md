# ServiceNow Exam Study App

Interactive study app for ServiceNow certification prep with multi-exam support, configurable study sources, and three study modes.

## What The App Supports

- Exam tracks:
   - CAD
   - CIS - DF
- Study sources are controlled by app/study-config.ts
- Study modes:
   - Flashcard
   - Quiz
   - Exam

## Core Features

- Settings-first flow to choose exam, source, and mode
- Question set options for study sessions:
   - All questions
   - Failed questions
   - Random set
- Exam mode behavior:
   - Select number of questions
   - No per-question answer reveal
   - Full answer review shown after exam completion
- Progress tracking (localStorage): attempts, correct count, mastery, accuracy
- Explanation support per question:
   - Quiz: explanation replaces success/failure feedback when available
   - Flashcard back: explanation replaces original question text when available
- Image support per question through imageUrl
- Support for MCQ and drag-and-drop question types

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Static export output for deployment to static hosts

## Run Locally

Prerequisite: Node.js 18+

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open http://localhost:3000

## Build And Serve Production Output

This project exports static files to out.

1. Build

```bash
npm run build
```

2. Serve exported files

```bash
npm start
```

npm start runs serve against out.

## Data Model

Question objects can include:

- id
- exam
- source
- questionType (mcq | drag_drop)
- question
- explanation (optional)
- options
- correctAnswer
- suggestedAnswer
- imageUrl (optional)
- imageAlt (optional)
- dragDrop (for drag_drop questions)

## Data Files

- app/data/questions.json
- app/data/examtopics-cad.json
- app/data/cad-questions.json (legacy/sample dataset)

Active exam/source behavior is determined by app/study-config.ts.

## Adding Question Images

Use public/imgs for image assets and reference them from question JSON.

Example naming convention:

- source-exam-questionId.jpg
- examtopics-cad-400003.jpg

Example imageUrl value in JSON:

```json
"imageUrl": "/imgs/examtopics-cad-400003.jpg"
```

## Project Structure

```text
.
├── app/
│   ├── components/
│   │   ├── ExamMode.tsx
│   │   ├── Flashcard.tsx
│   │   ├── Progress.tsx
│   │   └── Quiz.tsx
│   ├── data/
│   ├── imgs/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── study-config.ts
│   └── types.ts
├── public/
│   └── imgs/
├── package.json
└── README.md
```

## Notes

- Progress is stored locally in the browser.
- Exam sessions are intentionally separated from normal study feedback behavior.
- This project is for educational use.
