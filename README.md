# ServiceNow CSA Study App

A modern, interactive study application for the ServiceNow Certified System Administrator (CSA) exam. Built with Next.js and React, this app helps you prepare efficiently with flashcards, quizzes, and progress tracking.

## Features

### 📚 Study Modes
- **Flashcard Mode**: Test your knowledge and reveal answers at your own pace
- **Quiz Mode**: Take practice quizzes with instant feedback

### 🎯 Smart Question Selection
- **All Questions**: Study all 374 exam questions
- **Failed Questions**: Focus on questions you've struggled with
- **Random Selection**: Generate custom quizzes with a specified number of random questions

### 📊 Progress Tracking
- Track attempts and accuracy for each question
- Monitor overall study progress
- Identify mastered questions (3+ correct answers with 80%+ accuracy)
- All progress saved locally in your browser

### 🎨 Clean, Minimal UI
- Simple, distraction-free interface
- Easy navigation and intuitive controls
- Responsive design works on all devices

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This app is configured for easy deployment to Vercel or Netlify.

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

Or use the Vercel CLI:
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

1. Push your code to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
6. Click "Deploy site"

Or use the Netlify CLI:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=out
```

## Study Tips

1. **Start with Flashcards**: Get familiar with questions first
2. **Use Quiz Mode**: Test yourself under exam-like conditions
3. **Focus on Failed Questions**: Review questions you've missed
4. **Track Your Progress**: Aim for 80%+ accuracy on all questions
5. **Regular Practice**: Study a little each day for best retention

## Data Source

Questions are parsed from the ExamTopics ServiceNow CSA question bank. The app contains 374 real exam questions with verified answers.

## Technology Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Storage**: LocalStorage (browser-based)
- **Deployment**: Static export (works on any static host)

## Project Structure

```
csa-study-app/
├── app/
│   ├── components/
│   │   ├── Flashcard.tsx    # Flashcard study mode
│   │   ├── Quiz.tsx          # Quiz study mode
│   │   └── Progress.tsx      # Progress tracking display
│   ├── data/
│   │   └── questions.json    # Parsed question data
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # App layout
│   ├── page.tsx              # Main app page
│   └── types.ts              # TypeScript types
├── package.json
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
└── README.md
```

## License

This project is for educational purposes only. Questions are sourced from publicly available exam preparation materials.

## Support

Good luck with your ServiceNow CSA certification exam! 🎓
