'use client';

import { useEffect, useState } from 'react';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import ExamMode from './components/ExamMode';
import Progress from './components/Progress';
import { Question, StudyProgress, StudyMode, QuestionFilter, ExamTrack, QuestionSource } from './types';
import { STUDY_CONFIG } from './study-config';
import cisDfQuestionsData from './data/questions.json';
import examtopicsCadQuestionsData from './data/examtopics-cad.json';
//import kyleCadQuestionsData from './data/kyle-cad.json';

export default function Home() {
  const [selectedExam, setSelectedExam] = useState<ExamTrack>('cis-df');
  const [selectedSource, setSelectedSource] = useState<QuestionSource>('examtopics');
  const [mode, setMode] = useState<StudyMode>('flashcard');
  const [filter, setFilter] = useState<QuestionFilter>('all');
  const [randomCount, setRandomCount] = useState<number>(10);
  const [examQuestionCount, setExamQuestionCount] = useState<number>(20);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sn-exam-progress') || localStorage.getItem('csa-progress');
    if (saved) setProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sn-exam-progress', JSON.stringify(progress));
  }, [progress]);

  const examConfig = STUDY_CONFIG[selectedExam];
  const availableSources = examConfig.sources;
  const sourceConfig =
    availableSources.find((source) => source.id === selectedSource) ||
    availableSources[0];
  const availableModes = sourceConfig?.modes || ['flashcard'];

  useEffect(() => {
    const sourceExists = availableSources.some((source) => source.id === selectedSource);
    if (!sourceExists && availableSources[0]) {
      setSelectedSource(availableSources[0].id);
    }
  }, [selectedExam, availableSources, selectedSource]);

  useEffect(() => {
    if (!availableModes.includes(mode)) {
      setMode(availableModes[0]);
    }
  }, [selectedSource, availableModes, mode]);

  const normalizeQuestions = (sourceQuestions: Question[], fallbackExam: ExamTrack, source: 'examtopics' | 'kyle'): Question[] => {
    return sourceQuestions.map((question) => {
      const exam = question.exam ?? fallbackExam;
      const questionType = question.questionType ?? (question.dragDrop ? 'drag_drop' : 'mcq');
      return {
        ...question,
        exam,
        source,
        questionType,
        progressKey: `${source}-${exam}-${question.id}`,
      };
    });
  };

  const getQuestionsForSelection = (): Question[] => {
    if (selectedExam === 'cad') {
      const examtopics = normalizeQuestions(examtopicsCadQuestionsData as Question[], 'cad', 'examtopics');
      //const kyle = normalizeQuestions(kyleCadQuestionsData as Question[], 'cad', 'kyle');

      if (selectedSource === 'examtopics') return examtopics;
      //if (selectedSource === 'kyle') return kyle;
      //return [...examtopics, ...kyle];
      return [...examtopics];
    }

    const cisExamtopics = normalizeQuestions(cisDfQuestionsData as Question[], 'cis-df', 'examtopics');
    if (selectedSource === 'kyle') return [];
    return cisExamtopics;
  };

  const questions = getQuestionsForSelection();

  const updateProgress = (questionKey: string, isCorrect: boolean) => {
    setProgress(prev => {
      const current = prev[questionKey] || { attempts: 0, correct: 0, lastAttempt: 0, mastered: false };
      const newCorrect = current.correct + (isCorrect ? 1 : 0);
      const newAttempts = current.attempts + 1;

      return {
        ...prev,
        [questionKey]: {
          attempts: newAttempts,
          correct: newCorrect,
          lastAttempt: Date.now(),
          mastered: newCorrect >= 3 && (newCorrect / newAttempts) >= 0.8,
        },
      };
    });
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem('sn-exam-progress');
    localStorage.removeItem('csa-progress');
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getFilteredQuestions = (): Question[] => {
    let filtered = [...questions];

    if (filter === 'failed') {
      filtered = filtered.filter(q => {
        const p = q.progressKey ? progress[q.progressKey] : undefined;
        return p && p.attempts > 0 && (p.correct / p.attempts) < 0.5;
      });
    } else if (filter === 'random') {
      filtered = shuffleArray(filtered).slice(0, Math.min(randomCount, filtered.length));
      return filtered;
    }

    if (shuffleEnabled) {
      filtered = shuffleArray(filtered);
    }

    return filtered;
  };

  const getExamQuestions = (): Question[] => {
    const count = Math.max(1, Math.min(examQuestionCount, questions.length));
    return shuffleArray([...questions]).slice(0, count);
  };

  const startStudy = (studyMode: StudyMode = mode) => {
    setFilteredQuestions(studyMode === 'exam' ? getExamQuestions() : getFilteredQuestions());
    setShowSettings(false);
  };

  const resetSettings = () => {
    setShowSettings(true);
    setFilteredQuestions([]);
  };

  const modeLabel = mode === 'flashcard' ? 'Flashcard Mode' : mode === 'quiz' ? 'Quiz Mode' : 'Exam Mode';

  if (showSettings) {
    return (
      <main className='min-h-screen p-4 sm:p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-2xl sm:text-4xl font-bold mb-2 text-gray-800'>ServiceNow Exam Study App</h1>
          <p className='text-sm sm:text-base text-gray-600 mb-6 sm:mb-8'>Prepare for your ServiceNow certification exams</p>

          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
            <div className='lg:col-span-7 order-1 space-y-6'>
              <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
                <h2 className='text-xl sm:text-2xl font-semibold mb-4 text-gray-700'>Exam / Source / Mode</h2>

                <div className='space-y-5'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Exam</label>
                    <div className='grid grid-cols-2 gap-3'>
                      {(Object.keys(STUDY_CONFIG) as ExamTrack[]).map((examId) => (
                        <button
                          key={examId}
                          onClick={() => setSelectedExam(examId)}
                          className={`py-3 px-4 rounded-md border-2 transition-colors text-sm sm:text-base ${selectedExam === examId ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                        >
                          {STUDY_CONFIG[examId].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Question Source</label>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                      {availableSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => setSelectedSource(source.id)}
                          className={`py-3 px-4 rounded-md border-2 transition-colors text-sm sm:text-base ${selectedSource === source.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                        >
                          {source.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Study Mode</label>
                    <div className='grid grid-cols-3 gap-2'>
                      {availableModes.map((studyMode) => (
                        <button
                          key={studyMode}
                          onClick={() => setMode(studyMode)}
                          className={`py-2 px-3 rounded-md border-2 transition-colors text-xs sm:text-sm ${mode === studyMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                        >
                          {studyMode === 'flashcard' ? 'Flashcard' : studyMode === 'quiz' ? 'Quiz' : 'Exam'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {mode === 'exam' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Exam question count</label>
                      <input
                        type='number'
                        min='1'
                        max={questions.length || 1}
                        value={examQuestionCount}
                        onChange={(e) => setExamQuestionCount(parseInt(e.target.value) || 20)}
                        className='w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-md text-sm'
                      />
                    </div>
                  )}

                  {mode !== 'exam' && (
                    <div>
                      <label className='flex items-center gap-3 cursor-pointer select-none'>
                        <div className={`relative w-11 h-6 rounded-full transition-colors ${shuffleEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${shuffleEnabled ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className='text-sm font-medium text-gray-700'>Shuffle questions</span>
                      </label>
                      <p className='text-xs text-gray-500 mt-1 ml-14'>Randomize the order in this study session</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => startStudy(mode)}
                  className='w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base'
                >
                  Start Studying
                </button>
              </div>
            </div>

            <div className='lg:col-span-5 order-2 space-y-6'>
              <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
                <h2 className='text-xl sm:text-2xl font-semibold mb-4 text-gray-700'>Question Selection</h2>
                <div className='space-y-2'>
                  <button
                    onClick={() => setFilter('all')}
                    className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${filter === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                  >
                    All Questions ({questions.length})
                  </button>
                  <button
                    onClick={() => setFilter('failed')}
                    className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${filter === 'failed' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                  >
                    Failed Questions Only
                  </button>
                  <button
                    onClick={() => setFilter('random')}
                    className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm sm:text-base ${filter === 'random' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                  >
                    Random Selection
                  </button>
                </div>

                {filter === 'random' && mode !== 'exam' && (
                  <div className='mt-4'>
                    <label className='block text-sm text-gray-600 mb-1'>Number of questions:</label>
                    <input
                      type='number'
                      min='1'
                      max={questions.length || 1}
                      value={randomCount}
                      onChange={(e) => setRandomCount(parseInt(e.target.value) || 10)}
                      className='w-full sm:w-36 px-3 py-2 border border-gray-300 rounded-md text-sm'
                    />
                  </div>
                )}
              </div>

              <Progress progress={progress} questions={questions} onResetProgress={resetProgress} />
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
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>{modeLabel}</h1>
          <button
            onClick={resetSettings}
            className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base self-start sm:self-auto'
          >
            Change Settings
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
          <aside className='hidden lg:block lg:col-span-3 space-y-4'>
            <Progress progress={progress} questions={questions} onResetProgress={resetProgress} />

            <div className='bg-white rounded-lg shadow-md p-4 space-y-4'>
              <div>
                <p className='text-sm font-semibold text-gray-700 mb-2'>Study Mode</p>
                <div className='space-y-2'>
                  {availableModes.map((studyMode) => (
                    <button
                      key={studyMode}
                      onClick={() => {
                        setMode(studyMode);
                        startStudy(studyMode);
                      }}
                      className={`w-full py-2 px-3 rounded-md border text-sm transition-colors ${mode === studyMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                    >
                      {studyMode === 'flashcard' ? 'Flashcard' : studyMode === 'quiz' ? 'Quiz' : 'Exam'}
                    </button>
                  ))}
                </div>
              </div>

              {mode !== 'exam' ? (
                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-2'>Question Set</p>
                  <div className='space-y-2'>
                    {(['all', 'failed', 'random'] as QuestionFilter[]).map((selection) => (
                      <button
                        key={selection}
                        onClick={() => setFilter(selection)}
                        className={`w-full py-2 px-3 rounded-md border text-sm transition-colors ${filter === selection ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}
                      >
                        {selection === 'all' ? 'All Questions' : selection === 'failed' ? 'Failed Only' : 'Random Set'}
                      </button>
                    ))}
                  </div>

                  {filter === 'random' && (
                    <input
                      type='number'
                      min='1'
                      max={questions.length || 1}
                      value={randomCount}
                      onChange={(e) => setRandomCount(parseInt(e.target.value) || 10)}
                      className='w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm'
                    />
                  )}
                </div>
              ) : (
                <div>
                  <p className='text-sm font-semibold text-gray-700 mb-2'>Exam Size</p>
                  <input
                    type='number'
                    min='1'
                    max={questions.length || 1}
                    value={examQuestionCount}
                    onChange={(e) => setExamQuestionCount(parseInt(e.target.value) || 20)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
                  />
                </div>
              )}

              <button
                onClick={() => startStudy(mode)}
                className='w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors text-sm'
              >
                Apply & Restart Session
              </button>
            </div>
          </aside>

          <section className='lg:col-span-7'>
            {mode === 'flashcard' ? (
              <Flashcard questions={filteredQuestions} progress={progress} onUpdateProgress={updateProgress} onComplete={resetSettings} />
            ) : mode === 'quiz' ? (
              <Quiz questions={filteredQuestions} progress={progress} onUpdateProgress={updateProgress} onComplete={resetSettings} />
            ) : (
              <ExamMode questions={filteredQuestions} progress={progress} onUpdateProgress={updateProgress} onComplete={resetSettings} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
