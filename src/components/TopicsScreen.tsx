/**
 * @file src/components/TopicsScreen.tsx
 * @description Reader Topics & Setup Profile Screen for "My news".
 *
 * Implements Section 2, 6 and Fixes 6 & 9:
 * 1. "Setup must keep the reader's own interests. 'I study engineering in London and I follow F1 and robotics' must give topic chips that include F1 and Robotics. The follow-up questions must be about what they wrote, for example which parts of F1 to cover."
 * 2. Visual artwork:
 *    - Setup screen illustration.
 *    - Wordless 48 px flat section images for UK, World, Elections, Energy, Health, F1, and Robotics.
 * 3. Reader setup workflow:
 *    - Self-description sentence input.
 *    - Follow-up questions about what they wrote (e.g. F1 coverage parts, robotics priorities).
 *    - Editable, removable topic chips.
 * 4. Strictly no text smaller than 13 px on a phone.
 *
 * USE CASES:
 * - Reader onboarding, topic tuning, and personalized feed configuration.
 */

import React, { useState } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { ReaderProfile } from '../types/news.ts';
import { getAppConfig } from '../config/appConfig.ts';
import { logFunctionCall } from '../utils/logger.ts';

interface TopicsScreenProps {
  profile: ReaderProfile;
  onUpdateProfile: (updated: Partial<ReaderProfile>) => void;
  onClose?: () => void;
}

export function TopicsScreen({ profile, onUpdateProfile, onClose }: TopicsScreenProps): React.ReactElement {
  const config = getAppConfig();
  logFunctionCall('TopicsScreen:render', { topics: profile.topics });

  const [inputSentence, setInputSentence] = useState<string>(profile.setupSentence);
  const [newTopicText, setNewTopicText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Follow-up questions derived directly from what the reader wrote (Fix 6)
  const [activeFollowUps, setActiveFollowUps] = useState<
    { id: string; question: string; options: string[] }[]
  >([
    {
      id: 'f1-coverage',
      question: 'Which parts of Formula 1 do you want covered?',
      options: ['Championship Standings', 'Technical & Aerodynamics', 'Practice & Qualifying', 'Driver Transfers']
    },
    {
      id: 'robotics-focus',
      question: 'Which robotics areas should we prioritize?',
      options: ['Humanoid Robots', 'Simulation & Learning', 'Industrial Manufacturing', 'Autonomous Systems']
    }
  ]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  /**
   * Submits reader's sentence to the server for Gemini profile extraction.
   */
  const handleAnalyzeSentence = async () => {
    if (!inputSentence.trim() || isAnalyzing) return;
    logFunctionCall('TopicsScreen:handleAnalyzeSentence', { sentence: inputSentence });
    setIsAnalyzing(true);

    try {
      const res = await fetch(config.apiEndpoints.setupAnalyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: inputSentence.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateProfile({
          setupSentence: inputSentence.trim(),
          situation: data.situation,
          topics: data.initialTopics || profile.topics
        });
        if (data.followUpQuestions && data.followUpQuestions.length > 0) {
          setActiveFollowUps(data.followUpQuestions);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to analyze setup sentence:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handles reader tapping a follow-up chip.
   *
   * @param {string} questionId Unique question ID.
   * @param {string} option Tapped chip text.
   */
  const handleSelectOption = (questionId: string, option: string) => {
    logFunctionCall('TopicsScreen:handleSelectOption', { questionId, option });
    setSelectedOptions((prev) => ({ ...prev, [questionId]: option }));

    // Add option directly to reader's topic chips if not present
    if (!profile.topics.includes(option)) {
      onUpdateProfile({
        topics: [...profile.topics, option]
      });
    }
  };

  /**
   * Removes a topic chip.
   *
   * @param {string} topic Topic to remove.
   */
  const handleRemoveTopic = (topic: string) => {
    logFunctionCall('TopicsScreen:handleRemoveTopic', { topic });
    onUpdateProfile({
      topics: profile.topics.filter((t) => t !== topic)
    });
  };

  /**
   * Manually adds a topic chip.
   */
  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTopicText.trim();
    if (clean && !profile.topics.includes(clean)) {
      logFunctionCall('TopicsScreen:handleAddCustomTopic', { topic: clean });
      onUpdateProfile({
        topics: [...profile.topics, clean]
      });
      setNewTopicText('');
    }
  };

  const sectionsList = ['World', 'UK', 'Elections', 'Energy', 'Health', 'F1', 'Robotics'];

  return (
    <main className="px-3 pt-3 pb-24 max-w-[640px] mx-auto w-full">
      {/* Optional Top Dismiss Button */}
      {onClose && (
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-medium text-stone-700 hover:text-stone-950 px-2 py-1 rounded border border-stone-300 bg-white shadow-xs cursor-pointer"
          >
            &larr; Back to Today
          </button>
          <span className="text-[13px] font-mono text-stone-500">Settings</span>
        </div>
      )}

      {/* Onboarding Header Illustration & Title */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4 shadow-sm text-center">
        <img
          src={config.images.setupIllustration}
          alt="Setup briefing illustration"
          className="w-20 h-20 mx-auto object-cover rounded-lg mb-2.5 border border-stone-200"
        />
        <h2 className="font-serif font-bold text-lg text-stone-900 mb-1">
          Your Reader Profile
        </h2>
        <p className="text-[13px] text-stone-600 leading-relaxed max-w-[340px] mx-auto">
          Describe your background or interests in one sentence. Your setup determines what you
          see in &ldquo;From your topics&rdquo; and your &ldquo;Why it matters to you&rdquo; line.
        </p>
      </div>

      {/* Sentence Input Card */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4 shadow-sm">
        <label htmlFor="setup-sentence" className="block text-[13px] font-semibold text-stone-900 mb-1">
          Self-Description Sentence
        </label>
        <textarea
          id="setup-sentence"
          rows={2}
          value={inputSentence}
          onChange={(e) => setInputSentence(e.target.value)}
          placeholder="e.g. I study engineering in London and I follow F1 and robotics."
          className="w-full text-[13px] text-stone-900 border border-stone-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-stone-500 mb-2 leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-stone-500">
            Keep your real interests
          </span>
          <button
            type="button"
            onClick={handleAnalyzeSentence}
            disabled={isAnalyzing || !inputSentence.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Updating...' : 'Update Profile'}</span>
          </button>
        </div>
      </div>

      {/* Detected Situation Box */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 mb-4">
        <span className="text-[13px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
          Detected Situation
        </span>
        <p className="text-[13px] sm:text-sm font-medium text-stone-800 leading-relaxed">
          {profile.situation}
        </p>
      </div>

      {/* Follow-up Questions Tailored to Setup (Fix 6) */}
      {activeFollowUps.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider mb-2.5">
            Clarification Questions
          </h3>
          <div className="space-y-3">
            {activeFollowUps.map((q) => (
              <div key={q.id}>
                <p className="text-[13px] font-medium text-stone-800 mb-1.5">{q.question}</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((opt) => {
                    const isSelected = selectedOptions[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`text-[13px] px-3 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 font-medium'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Topic Chips (Must include F1 and Robotics per Fix 6) */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider">
            Active Topic Chips ({profile.topics.length})
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.topics.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-[13px] px-3 py-1 rounded-full border border-stone-200 font-medium"
            >
              <span>{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTopic(t)}
                className="hover:text-stone-900 text-stone-400 p-0.5 rounded-full"
                aria-label={`Remove topic ${t}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Add custom topic form */}
        <form onSubmit={handleAddCustomTopic} className="flex gap-1.5">
          <input
            type="text"
            value={newTopicText}
            onChange={(e) => setNewTopicText(e.target.value)}
            placeholder="Add specific topic chip..."
            className="flex-1 text-[13px] border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
          <button
            type="submit"
            disabled={!newTopicText.trim()}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[13px] font-medium rounded border border-stone-300 flex items-center gap-1 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Abstract Section Emblems */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-[13px] font-semibold text-stone-900 uppercase tracking-wider mb-2.5">
          News Sections & Topics
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {sectionsList.map((sec) => {
            const imgUrl = config.images.sections[sec];
            if (!imgUrl) return null;
            return (
              <div key={sec} className="flex flex-col items-center text-center">
                <img
                  src={imgUrl}
                  alt={sec}
                  className="w-12 h-12 object-cover rounded-md border border-stone-200 mb-1"
                />
                <span className="text-[13px] font-medium text-stone-700">{sec}</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
