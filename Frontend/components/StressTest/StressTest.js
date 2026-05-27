"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Heart, Activity, ShieldAlert, Sparkles, BookOpen, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import styles from "./StressTest.module.scss";
import Link from "next/link";

const QUESTIONS = [
  {
    id: 1,
    text: "Feeling nervous, anxious, or on edge?",
    desc: "Refers to physical tension, jitteriness, or a state of constant high alert."
  },
  {
    id: 2,
    text: "Not being able to stop or control worrying?",
    desc: "A loop of recurring, stressful thoughts that feel difficult to escape."
  },
  {
    id: 3,
    text: "Trouble relaxing, sitting still, or winding down?",
    desc: "Restlessness, difficulty resting, or feeling like you always need to be active."
  },
  {
    id: 4,
    text: "Feeling down, depressed, unmotivated, or hopeless?",
    desc: "Persistent low energy, feelings of sadness, or lack of optimism."
  },
  {
    id: 5,
    text: "Little interest or pleasure in doing things you normally enjoy?",
    desc: "Apathy or feeling disconnected from hobbies, work, or social connections."
  }
];

const OPTIONS = [
  { value: 0, label: "Not at all", color: "#81C784" },
  { value: 1, label: "Several days", color: "#FFD54F" },
  { value: 2, label: "More than half the days", color: "#FFB74D" },
  { value: 3, label: "Nearly every day", color: "#E57373" }
];

export default function StressTest() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectOption = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);

    // Auto-advance after selection (with a minor delay for visual feedback)
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 200);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1 && answers[currentStep] !== null) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Please log in to submit your stress assessment.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URI}/mood/assessment`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      console.error("Submit Stress Test Error:", err);
      setError(err.response?.data?.message || "Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / QUESTIONS.length) * 100;
  const isFinished = answers.every(ans => ans !== null);

  const getSelfCareAdvice = (level) => {
    if (level === "Mild") {
      return {
        title: "Mild Stress / Well-balanced",
        text: "You seem to be handling things very well! Continue maintaining your current self-care routines. Mindfulness practices, light exercise, and journaling can help preserve this balance.",
        recommendations: ["10-minute daily breathing exercises", "Write in your personal journal", "Maintain a consistent sleep pattern"],
        icon: Sparkles,
        bgColor: "#E8F5E9",
        color: "#2E7D32"
      };
    } else if (level === "Moderate") {
      return {
        title: "Moderate Stress",
        text: "You are experiencing some moderate stress. Taking short breaks, practicing relaxation techniques, and organizing your study workload could reduce your burden. Connecting with friends and talking to a counselor can be very supportive.",
        recommendations: ["Try guided meditation links in the Self-Care Corner", "Schedule a stress-relief walk outdoors", "Consider booking a general check-in session with a counselor"],
        icon: Activity,
        bgColor: "#FFF9C4",
        color: "#F57F17"
      };
    } else {
      return {
        title: "High / Severe Stress",
        text: "Your responses suggest you are experiencing a high level of stress or anxiety. Remember that you do not have to go through this alone. We strongly recommend scheduling a session with one of our college counselors to discuss coping strategies in a supportive environment.",
        recommendations: ["Book a session with a counselor immediately", "Reach out to trusted friends or family members", "Practice guided mindfulness breathing to alleviate immediate anxiety"],
        icon: ShieldAlert,
        bgColor: "#FFEBEE",
        color: "#C62828"
      };
    }
  };

  if (result) {
    const advice = getSelfCareAdvice(result.level);
    const AdviceIcon = advice.icon;

    return (
      <div className={styles.resultCard}>
        <div className={styles.successIconWrapper}>
          <CheckCircle2 size={48} color="#A485E2" />
        </div>
        <h2 className={styles.resultTitle}>Assessment Completed</h2>
        <p className={styles.resultSubtitle}>Thank you for checking in on your well-being.</p>

        <div className={styles.scoreBox}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreNum}>{result.score}</span>
            <span className={styles.scoreMax}>/15</span>
          </div>
          <div className={styles.badge} style={{ backgroundColor: advice.bgColor, color: advice.color }}>
            <AdviceIcon size={16} style={{ marginRight: '6px' }} />
            {advice.title}
          </div>
        </div>

        <div className={styles.adviceSection}>
          <h3 className={styles.adviceHeader}>Self-Care Recommendations</h3>
          <p className={styles.adviceText}>{advice.text}</p>
          <ul className={styles.recommendationList}>
            {advice.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className={styles.actionButtons}>
          <Link href="/resources" className={`${styles.btn} ${styles.btnOutline}`}>
            <BookOpen size={18} /> Self-Care Corner
          </Link>
          <Link href="/book-counselor" className={`${styles.btn} ${styles.btnPrimary}`}>
            <Heart size={18} /> Schedule Counseling
          </Link>
        </div>

        <div className={styles.footerLink}>
          <Link href="/dashboard">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className={styles.assessmentContainer}>
      {/* Progress Bar */}
      <div className={styles.progressBarWrapper}>
        <div className={styles.progressText}>
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className={styles.questionCard}>
        <h2 className={styles.questionText}>{currentQuestion.text}</h2>
        <p className={styles.questionDesc}>{currentQuestion.desc}</p>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.optionsContainer}>
          {OPTIONS.map((opt) => {
            const isSelected = answers[currentStep] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`${styles.optionButton} ${isSelected ? styles.selected : ""}`}
                onClick={() => handleSelectOption(opt.value)}
              >
                <span className={styles.bullet} style={{ borderColor: opt.color, backgroundColor: isSelected ? opt.color : 'transparent' }}></span>
                <span className={styles.optionLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.navigationButtons}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={20} /> Back
          </button>

          {currentStep === QUESTIONS.length - 1 ? (
            <button
              type="button"
              className={`${styles.navBtn} ${styles.submitBtn}`}
              onClick={handleSubmit}
              disabled={!isFinished || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit Answers"}
            </button>
          ) : (
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNext}
              disabled={answers[currentStep] === null}
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
