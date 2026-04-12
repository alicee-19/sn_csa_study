import { ExamTrack, QuestionSource, StudyMode } from "./types";

export interface StudySourceConfig {
  id: QuestionSource;
  label: string;
  modes: StudyMode[];
}

export interface StudyExamConfig {
  label: string;
  sources: StudySourceConfig[];
}

export const STUDY_CONFIG: Record<ExamTrack, StudyExamConfig> = {
  cad: {
    label: "CAD",
    sources: [
      {
        id: "examtopics",
        label: "ExamTopics",
        modes: ["flashcard", "quiz", "exam"],
      },
      {
        id: "local",
        label: "Local",
        modes: ["flashcard"],
      },
      // {
      //   id: "all",
      //   label: "Mix All Sources",
      //   modes: ["flashcard", "quiz", "exam"],
      // },
    ],
  },
  "cis-df": {
    label: "CIS - DF",
    sources: [
      {
        id: "examtopics",
        label: "ExamTopics",
        modes: ["flashcard", "quiz", "exam"],
      },
    ],
  },
};
