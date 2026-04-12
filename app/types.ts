export interface Question {
  id: number;
  questionNumber: number;
  topic: number;
  question: string;
  explanation?: string;
  exam?: ExamTrack;
  source?: QuestionDataSource;
  questionType?: QuestionType;
  imageUrl?: string;
  imageAlt?: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  suggestedAnswer: string;
  dragDrop?: DragDropQuestion;
  progressKey?: string;
}

export interface DragDropQuestion {
  columnA: { id: string; text: string }[];
  columnB: { id: string; text: string }[];
  correctMatches: { leftId: string; rightId: string }[];
}

export interface StudyProgress {
  [questionId: string]: {
    attempts: number;
    correct: number;
    lastAttempt: number;
    mastered: boolean;
  };
}

export type StudyMode = "flashcard" | "quiz" | "exam";
export type QuestionFilter = "all" | "failed" | "random" | "information";
export type ExamTrack = "cis-df" | "cad";
export type QuestionType = "mcq" | "drag_drop" | "information";
export type QuestionDataSource = "examtopics" | "local";
export type QuestionSource = QuestionDataSource | "all";
