'use client';

import { useState, useEffect } from 'react';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Progress from './components/Progress';
import { Question, StudyProgress, StudyMode, QuestionFilter } from './types';
import questionsData from './data/questions.json';

export default function Home() {
  const [mode, setMode] = useState<StudyMode>('flashcard');
  const [filter, setFilter] = useState<QuestionFilter>('all');
  const [randomCount, setRandomCount] = useState<number>(10);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [showSettings, setShowSettings] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('csa-progress');
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem('csa-progress', JSON.stringify(progress));
    }
  }, [progress]);

  const questions = questionsData as Question[];

  const updateProgress = (questionId: number, isCorrect: boolean) => {
    setProgress(prev => {
      const current = prev[questionId] || { attempts: 0, correct: 0, lastAttempt: 0, mastered: false };
      const newCorrect = current.correct + (isCorrect ? 1 : 0);
      const newAttempts = current.attempts + 1;
      
      return {
        ...prev,
        [questionId]: {
          attempts: newAttempts,
          correct: newCorrect,
          lastAttempt: Date.now(),
          mastered: newCorrect >= 3 && (newCorrect / newAttempts) >= 0.8
        }
      };
    });
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
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
        const p = progress[q.id];
        return p && p.attempts > 0 && (p.correct / p.attempts) < 0.5;
      });
    } else if (filter === 'random') {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      filtered = shuffled.slice(0, Math.min(randomCount, shuffled.length));
    }

    if (shuffleQuestions) {
      filtered = shuffleArray(filtered);
    }

    return filtered;
  };

  const startStudy = () => {
    setFilteredQuestions(getFilteredQuestions());
    setShowSettings(false);
  };

  const resetSettings = () => {
    setShowSettings(true);
    setFilteredQuestions([]);
  };

  if (showSettings) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-gray-800">ServiceNow CSA Study App</h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Prepare for your Certified System Administrator exam</p>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-700">Study Settings</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Mode</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setMode('flashcard')}
                  className={`flex-1 py-3 px-4 rounded-md border-2 transition-colors text-sm md:text-base ${
                    mode === 'flashcard'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Flashcard Mode
                </button>
                <button
                  onClick={() => setMode('quiz')}
                  className={`flex-1 py-3 px-4 rounded-md border-2 transition-colors text-sm md:text-base ${
                    mode === 'quiz'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Quiz Mode
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Selection</label>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm md:text-base ${
                    filter === 'all'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  All Questions ({questions.length})
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm md:text-base ${
                    filter === 'failed'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Failed Questions Only
                </button>
                <button
                  onClick={() => setFilter('random')}
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors text-sm md:text-base ${
                    filter === 'random'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Random Selection
                </button>
                {filter === 'random' && (
                  <div className="ml-4 mt-2">
                    <label className="block text-sm text-gray-600 mb-1">Number of questions:</label>
                    <input
                      type="number"
                      min="1"
                      max={questions.length}
                      value={randomCount}
                      onChange={(e) => setRandomCount(parseInt(e.target.value) || 10)}
                      className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md text-sm md:text-base"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm md:text-base font-medium text-gray-700">Shuffle questions</span>
              </label>
              <p className="ml-8 mt-1 text-xs md:text-sm text-gray-500">Randomize the order of questions each time you start</p>
            </div>

            <button
              onClick={startStudy}
              className="w-full bg-blue-600 text-white py-3 md:py-4 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors text-base md:text-lg"
            >
              Start Studying
            </button>
          </div>

          <Progress progress={progress} questions={questions} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            {mode === 'flashcard' ? 'Flashcard Mode' : 'Quiz Mode'}
          </h1>
          <button
            onClick={resetSettings}
            className="w-full sm:w-auto px-4 py-2 md:py-3 md:px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            Change Settings
          </button>
        </div>

        {mode === 'flashcard' ? (
          <Flashcard 
            questions={filteredQuestions}
            progress={progress}
            onUpdateProgress={updateProgress}
          />
        ) : (
          <Quiz
            questions={filteredQuestions}
            progress={progress}
            onUpdateProgress={updateProgress}
          />
        )}
      </div>
    </main>
  );
}
