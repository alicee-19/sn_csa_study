// Script to parse examtopics_output.md and generate questions.json
import fs from 'fs';
import path from 'path';

interface Question {
  id: number;
  questionNumber: number;
  topic: number;
  question: string;
  options: string[];
  correctAnswer: string;
  suggestedAnswer: string;
}

const content = fs.readFileSync('examtopics_output.md', 'utf-8');

// Split by separator
const sections = content.split('----------------------------------------');

const questions: Question[] = [];

sections.forEach((section) => {
  const lines = section.trim().split('\n');
  
  // Extract question number and topic
  const headerMatch = section.match(/Question #: (\d+)/);
  const topicMatch = section.match(/Topic #: (\d+)/);
  
  if (!headerMatch || !topicMatch) return;
  
  const questionNumber = parseInt(headerMatch[1]);
  const topic = parseInt(topicMatch[1]);
  
  // Find the question text (after [All CSA Questions])
  const allQuestionsIndex = lines.findIndex(line => line.includes('[All CSA Questions]'));
  if (allQuestionsIndex === -1) return;
  
  // Get question text
  let questionText = '';
  let i = allQuestionsIndex + 2;
  while (i < lines.length && !lines[i].match(/^[A-Z]\./)) {
    if (lines[i].trim() && !lines[i].includes('Suggested Answer')) {
      questionText += lines[i].trim() + ' ';
    }
    i++;
  }
  
  // Extract options
  const options: string[] = [];
  const optionRegex = /^([A-Z])\.\s+(.+)/;
  
  for (let j = i; j < lines.length; j++) {
    const match = lines[j].match(optionRegex);
    if (match) {
      options.push(match[2].trim());
    }
  }
  
  // Extract suggested and correct answers
  const suggestedMatch = section.match(/Suggested Answer: ([A-Z]+)/);
  const answerMatch = section.match(/\*\*Answer: ([A-Z]+)\*\*/);
  
  if (questionText && options.length > 0 && answerMatch) {
    questions.push({
      id: questions.length + 1,
      questionNumber,
      topic,
      question: questionText.trim(),
      options,
      correctAnswer: answerMatch[1],
      suggestedAnswer: suggestedMatch ? suggestedMatch[1] : answerMatch[1]
    });
  }
});

// Write to JSON file
fs.writeFileSync(
  path.join('app', 'data', 'questions.json'),
  JSON.stringify(questions, null, 2)
);

console.log(`Parsed ${questions.length} questions`);
