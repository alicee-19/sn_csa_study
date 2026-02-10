export interface Question {
  id: number;
  questionNumber: number;
  topic: number;
  question: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  suggestedAnswer: string;
}

export interface StudyProgress {
  [questionId: string]: {
    attempts: number;
    correct: number;
    lastAttempt: number;
    mastered: boolean;
  };
}

export type StudyMode = 'flashcard' | 'quiz';
export type QuestionFilter = 'all' | 'failed' | 'random';
