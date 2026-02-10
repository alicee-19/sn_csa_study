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
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">ServiceNow CSA Study App</h1>
          <p className="text-gray-600 mb-8">Prepare for your Certified System Administrator exam</p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Study Settings</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Study Mode</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('flashcard')}
                  className={`flex-1 py-3 px-4 rounded-md border-2 transition-colors ${
                    mode === 'flashcard'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Flashcard Mode
                </button>
                <button
                  onClick={() => setMode('quiz')}
                  className={`flex-1 py-3 px-4 rounded-md border-2 transition-colors ${
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
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors ${
                    filter === 'all'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  All Questions ({questions.length})
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors ${
                    filter === 'failed'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Failed Questions Only
                </button>
                <button
                  onClick={() => setFilter('random')}
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-colors ${
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
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={startStudy}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors"
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
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {mode === 'flashcard' ? 'Flashcard Mode' : 'Quiz Mode'}
          </h1>
          <button
            onClick={resetSettings}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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
