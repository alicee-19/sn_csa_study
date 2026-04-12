"use client";

import { useEffect, useState } from "react";
import Flashcard from "./components/Flashcard";
import Quiz from "./components/Quiz";
import ExamMode from "./components/ExamMode";
import Progress from "./components/Progress";
import {
  Question,
  StudyProgress,
  StudyMode,
  QuestionFilter,
  ExamTrack,
  QuestionSource,
} from "./types";
import { STUDY_CONFIG } from "./study-config";
import cisDfQuestionsData from "./data/examtopics-cis-df.json";
import examtopicsCadQuestionsData from "./data/examtopics-cad.json";
import localCadQuestionsData from "./data/local-cad.json";

export default function Home() {
  const [selectedExam, setSelectedExam] = useState<ExamTrack>("cad");
  const [selectedSource, setSelectedSource] =
    useState<QuestionSource>("examtopics");
  const [mode, setMode] = useState<StudyMode>("quiz");
  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [randomCount, setRandomCount] = useState<number>(10);
  const [examQuestionCount, setExamQuestionCount] = useState<number>(20);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [draftMode, setDraftMode] = useState<StudyMode>("flashcard");
  const [draftFilter, setDraftFilter] = useState<QuestionFilter>("all");
  const [draftRandomCount, setDraftRandomCount] = useState<number>(10);
  const [draftShuffleEnabled, setDraftShuffleEnabled] = useState(false);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    const saved =
      localStorage.getItem("sn-exam-progress") ||
      localStorage.getItem("csa-progress");
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sn-exam-progress", JSON.stringify(progress));
  }, [progress]);

  const examConfig = STUDY_CONFIG[selectedExam];
  const availableSources = examConfig.sources;
  const sourceConfig =
    availableSources.find((source) => source.id === selectedSource) ||
    availableSources[0];
  const availableModes = sourceConfig?.modes || ["flashcard"];

  useEffect(() => {
    const sourceExists = availableSources.some(
      (source) => source.id === selectedSource
    );
    if (!sourceExists && availableSources[0]) {
      setSelectedSource(availableSources[0].id);
    }
  }, [selectedExam, availableSources, selectedSource]);

  useEffect(() => {
    if (!availableModes.includes(mode)) {
      setMode(availableModes[0]);
    }
  }, [selectedSource, availableModes, mode]);

  const normalizeQuestions = (
    sourceQuestions: Question[],
    fallbackExam: ExamTrack,
    source: "examtopics" | "local"
  ): Question[] => {
    return sourceQuestions.map((question) => {
      const exam = question.exam ?? fallbackExam;
      const rawQuestionType = (question as { questionType?: string })
        .questionType;
      const hasNoMcqContent =
        (!question.options || question.options.length === 0) &&
        !question.correctAnswer;
      const questionType =
        rawQuestionType === "information" || rawQuestionType === "info"
          ? "information"
          : rawQuestionType === "drag_drop" || question.dragDrop
          ? "drag_drop"
          : hasNoMcqContent
          ? "information"
          : "mcq";
      return {
        ...question,
        explanation: question.explanation || "",
        exam,
        source,
        questionType,
        progressKey: `${source}-${exam}-${question.id}`,
      };
    });
  };

  const getQuestionsForSelection = (): Question[] => {
    if (selectedExam === "cad") {
      const examtopics = normalizeQuestions(
        examtopicsCadQuestionsData as Question[],
        "cad",
        "examtopics"
      );
      const local = normalizeQuestions(
        localCadQuestionsData as Question[],
        "cad",
        "local"
      );

      if (selectedSource === "examtopics") return examtopics;
      if (selectedSource === "local") return local;
      return [...examtopics, ...local];
    }

    const cisExamtopics = normalizeQuestions(
      cisDfQuestionsData as Question[],
      "cis-df",
      "examtopics"
    );
    return cisExamtopics;
  };

  const questions = getQuestionsForSelection();

  const updateProgress = (questionKey: string, isCorrect: boolean) => {
    setProgress((prev) => {
      const current = prev[questionKey] || {
        attempts: 0,
        correct: 0,
        lastAttempt: 0,
        mastered: false,
      };
      const newCorrect = current.correct + (isCorrect ? 1 : 0);
      const newAttempts = current.attempts + 1;

      return {
        ...prev,
        [questionKey]: {
          attempts: newAttempts,
          correct: newCorrect,
          lastAttempt: Date.now(),
          mastered: newCorrect >= 3 && newCorrect / newAttempts >= 0.8,
        },
      };
    });
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("sn-exam-progress");
    localStorage.removeItem("csa-progress");
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getFilteredQuestions = (
    studyMode: StudyMode = mode,
    studyFilter: QuestionFilter = filter,
    studyRandomCount: number = randomCount,
    studyShuffleEnabled: boolean = shuffleEnabled
  ): Question[] => {
    let filtered = [...questions];

    // Information cards are available only in flashcard mode.
    if (studyMode === "quiz" || studyMode === "exam") {
      filtered = filtered.filter((q) => q.questionType !== "information");
    }

    if (studyMode === "flashcard" && studyFilter === "information") {
      filtered = filtered.filter((q) => q.questionType === "information");
    }

    if (studyFilter === "failed") {
      filtered = filtered.filter((q) => {
        const p = q.progressKey ? progress[q.progressKey] : undefined;
        return p && p.attempts > 0 && p.correct / p.attempts < 0.5;
      });
    } else if (studyFilter === "random") {
      filtered = shuffleArray(filtered).slice(
        0,
        Math.min(studyRandomCount, filtered.length)
      );
      return filtered;
    }

    if (studyShuffleEnabled) {
      filtered = shuffleArray(filtered);
    }

    return filtered;
  };

  const getExamQuestions = (
    studyExamQuestionCount = examQuestionCount
  ): Question[] => {
    const examEligible = questions.filter(
      (q) => q.questionType !== "information"
    );
    const count = Math.max(
      1,
      Math.min(studyExamQuestionCount, examEligible.length)
    );
    return shuffleArray([...examEligible]).slice(0, count);
  };

  const applyStudySettings = () => {
    const nextMode = draftMode;
    const nextFilter =
      nextMode === "flashcard" || draftFilter !== "information"
        ? draftFilter
        : "all";
    const nextRandomCount = draftRandomCount;
    const nextShuffleEnabled = draftShuffleEnabled;

    setMode(nextMode);
    setFilter(nextFilter);
    setRandomCount(nextRandomCount);
    setShuffleEnabled(nextShuffleEnabled);
    setFilteredQuestions(
      nextMode === "exam"
        ? getExamQuestions(examQuestionCount)
        : getFilteredQuestions(
            nextMode,
            nextFilter,
            nextRandomCount,
            nextShuffleEnabled
          )
    );
    setShowSettings(false);
  };

  const resetSettings = () => {
    setShowSettings(true);
    setFilteredQuestions([]);
    setDraftMode(mode);
    setDraftFilter(filter);
    setDraftRandomCount(randomCount);
    setDraftShuffleEnabled(shuffleEnabled);
  };

  const modeLabel =
    mode === "flashcard"
      ? "Flashcard Mode"
      : mode === "quiz"
      ? "Quiz Mode"
      : "Exam Mode";

  if (showSettings) {
    return (
      <main className='min-h-screen p-4 sm:p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-2xl sm:text-4xl font-bold mb-2 text-gray-800'>
            ServiceNow Exam Study App
          </h1>
          <p className='text-sm sm:text-base text-gray-600 mb-6 sm:mb-8'>
            Prepare for your ServiceNow certification exams
          </p>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
            <div className='lg:col-span-7 order-1 space-y-6'>
              <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
                <h2 className='text-xl sm:text-2xl font-semibold mb-4 text-gray-700'>
                  Exam / Source / Mode
                </h2>

                <div className='space-y-5'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Exam
                    </label>
                    <div className='grid grid-cols-2 gap-3'>
                      {(Object.keys(STUDY_CONFIG) as ExamTrack[]).map(
                        (examId) => (
                          <button
                            key={examId}
                            onClick={() => setSelectedExam(examId)}
                            className={`py-3 px-4 rounded-md border-2 transition-colors text-sm sm:text-base ${
                              selectedExam === examId
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {STUDY_CONFIG[examId].label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Question Source
                    </label>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                      {availableSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => setSelectedSource(source.id)}
                          className={`py-3 px-4 rounded-md border-2 transition-colors text-sm sm:text-base ${
                            selectedSource === source.id
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {source.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Study Mode
                    </label>
                    <div className='grid grid-cols-3 gap-2'>
                      {availableModes.map((studyMode) => (
                        <button
                          key={studyMode}
                          onClick={() => {
                            setDraftMode(studyMode);
                            setDraftFilter("random");
                          }}
                          className={`py-2 px-3 rounded-md border-2 transition-colors text-xs sm:text-sm ${
                            draftMode === studyMode
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {studyMode === "flashcard"
                            ? "Flashcard"
                            : studyMode === "quiz"
                            ? "Quiz"
                            : "Exam"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {draftMode !== "exam" && (
                    <div>
                      <label className='flex items-center gap-3 cursor-pointer select-none'>
                        <div
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            draftShuffleEnabled ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              draftShuffleEnabled ? "translate-x-5" : ""
                            }`}
                          />
                        </div>
                        <span className='text-sm font-medium text-gray-700'>
                          Shuffle questions
                        </span>
                      </label>
                      <p className='text-xs text-gray-500 mt-1 ml-14'>
                        Randomize the order in this study session
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={applyStudySettings}
                  className='w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base'
                >
                  Start Studying
                </button>
              </div>
            </div>

            <div className='lg:col-span-5 order-2 space-y-6'>
              <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
                <h2 className='text-xl sm:text-2xl font-semibold mb-4 text-gray-700'>
                  Question Selection
                </h2>

                {draftMode !== "exam" ? (
                  <div className='space-y-2'>
                    <button
                      onClick={() => setDraftFilter("all")}
                      className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${
                        draftFilter === "all"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      All Questions ({questions.length})
                    </button>
                    <button
                      onClick={() => setDraftFilter("failed")}
                      className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${
                        draftFilter === "failed"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Failed Questions Only
                    </button>
                    <button
                      onClick={() => setDraftFilter("random")}
                      className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${
                        draftFilter === "random"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Random Selection
                    </button>
                    {draftMode === "flashcard" && (
                      <button
                        onClick={() => setDraftFilter("information")}
                        className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${
                          draftFilter === "information"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        Information Cards Only
                      </button>
                    )}
                    {draftFilter === "random" && (
                      <div className='ml-4 mt-2'>
                        <label className='block text-sm text-gray-600 mb-1'>
                          Number of questions
                        </label>
                        <input
                          type='number'
                          min='1'
                          max={questions.length || 1}
                          value={draftRandomCount}
                          onChange={(e) =>
                            setDraftRandomCount(parseInt(e.target.value) || 10)
                          }
                          className='w-full sm:w-36 px-3 py-2 border border-gray-300 rounded-md text-sm'
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='mt-4'>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Number of questions (Max: {questions.length})
                    </label>
                    <input
                      type='number'
                      min='1'
                      max={questions.length || 1}
                      value={draftRandomCount}
                      onChange={(e) =>
                        setDraftRandomCount(parseInt(e.target.value) || 10)
                      }
                      className='w-full sm:w-36 px-3 py-2 border border-gray-300 rounded-md text-sm'
                    />
                  </div>
                )}
              </div>

              {mode !== "exam" && (
                <Progress
                  progress={progress}
                  questions={questions}
                  onResetProgress={resetProgress}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen p-4 sm:p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
            {modeLabel}
          </h1>
          <button
            onClick={resetSettings}
            className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base self-start sm:self-auto'
          >
            Change Settings
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
          {mode !== "exam" && (
            <aside className='hidden lg:block lg:col-span-3 space-y-4'>
              <Progress
                progress={progress}
                questions={questions}
                onResetProgress={resetProgress}
              />

              <div className='bg-white rounded-lg shadow-md p-4 space-y-4'>
                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-2'>
                    Study Mode
                  </p>
                  <div className='space-y-2 gap-2 flex flex-row'>
                    {availableModes.map((studyMode) => (
                      <button
                        key={studyMode}
                        onClick={() => {
                          setDraftMode(studyMode);
                        }}
                        className={`w-1/3 p-2 px-3 rounded-md border text-sm transition-colors ${
                          draftMode === studyMode
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {studyMode === "flashcard"
                          ? "Flashcard"
                          : studyMode === "quiz"
                          ? "Quiz"
                          : "Exam"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-2'>
                    Question Set
                  </p>
                  <div className='space-y-2 gap-2 flex flex-row'>
                    {(["all", "failed", "random"] as QuestionFilter[]).map(
                      (selection) => (
                        <button
                          key={selection}
                          onClick={() => setDraftFilter(selection)}
                          className={`w-1/3 p-2 px-3 rounded-md border text-sm transition-colors ${
                            draftFilter === selection
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {selection === "all"
                            ? "All Questions"
                            : selection === "failed"
                            ? "Failed Only"
                            : "Random Set"}
                        </button>
                      )
                    )}
                    {draftMode === "flashcard" && (
                      <button
                        onClick={() => setDraftFilter("information")}
                        className={`w-1/3 p-2 px-3 rounded-md border text-sm transition-colors ${
                          draftFilter === "information"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        Info Only
                      </button>
                    )}
                  </div>

                  {draftFilter === "random" && (
                    <input
                      type='number'
                      min='1'
                      max={questions.length || 1}
                      value={draftRandomCount}
                      onChange={(e) =>
                        setDraftRandomCount(parseInt(e.target.value) || 10)
                      }
                      className='w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm'
                    />
                  )}
                </div>

                <button
                  onClick={applyStudySettings}
                  className='w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm'
                >
                  Apply & Restart Session
                </button>
              </div>
            </aside>
          )}

          <section
            className={mode === "exam" ? "lg:col-span-10" : "lg:col-span-7"}
          >
            {mode === "flashcard" ? (
              <Flashcard
                questions={filteredQuestions}
                progress={progress}
                onUpdateProgress={updateProgress}
                onComplete={resetSettings}
              />
            ) : mode === "quiz" ? (
              <Quiz
                questions={filteredQuestions}
                progress={progress}
                onUpdateProgress={updateProgress}
                onComplete={resetSettings}
              />
            ) : (
              <ExamMode
                questions={filteredQuestions}
                onComplete={resetSettings}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
