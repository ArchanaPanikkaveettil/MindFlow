"use client";
import React, { useState, useEffect } from "react";
import { Heart, ShieldAlert, Phone, HelpCircle, BookOpen, Volume2, Wind, Play, Square } from "lucide-react";
import styles from "./Resources.module.scss";

const HELPLINES = [
  {
    name: "MindFlow Campus Support Cell",
    number: "0484-257-7777",
    desc: "Available Monday - Friday, 9:00 AM - 5:00 PM for on-campus counseling bookings and assistance."
  },
  {
    name: "Kiran Mental Health Helpline (Govt of India)",
    number: "1800-599-0019",
    desc: "24/7 free and confidential mental health support and rehabilitation helpline service."
  },
  {
    name: "Tele-MANAS (Govt of India Initiative)",
    number: "14416 / 1800 891 4416",
    desc: "24/7 mental health counseling service with trained mental health professionals."
  },
  {
    name: "Vandrevala Foundation for Mental Health",
    number: "+91 9999 666 555",
    desc: "24/7 crisis support and counseling via phone call or chat online."
  }
];

const MEDITATIONS = [
  {
    title: "5-Minute Grounding Exercise (5-4-3-2-1 Technique)",
    category: "Anxiety Relief",
    duration: "5 Mins",
    link: "https://www.urmc.rochester.edu/behavioral-health-partners/register/bhp-blog/april-2018/5-4-3-2-1-coping-technique-for-anxiety.aspx"
  },
  {
    title: "10-Minute Deep Relaxation Guided Meditation",
    category: "Mindfulness",
    duration: "10 Mins",
    link: "https://www.youtube.com/watch?v=z6X5oEIg6Ak"
  },
  {
    title: "Box Breathing Technique for Focus & Stress Management",
    category: "Breathing Exercise",
    duration: "4 Mins",
    link: "https://www.youtube.com/watch?v=FJJazydEzPM"
  }
];

export default function Resources() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("Idle"); // Idle, In, Hold1, Out, Hold2
  const [secondsLeft, setSecondsLeft] = useState(4);

  // Breathing Cycle Logic (Box Breathing: 4s In, 4s Hold, 4s Out, 4s Hold)
  useEffect(() => {
    if (!isBreathing) {
      setBreathingPhase("Idle");
      return;
    }

    setBreathingPhase("Breathe In");
    setSecondsLeft(4);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          setBreathingPhase((currentPhase) => {
            switch (currentPhase) {
              case "Breathe In":
                return "Hold";
              case "Hold":
                return "Breathe Out";
              case "Breathe Out":
                return "Rest";
              case "Rest":
              default:
                return "Breathe In";
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
  };

  const getPhaseClass = () => {
    if (breathingPhase === "Breathe In") return styles.expand;
    if (breathingPhase === "Hold") return styles.hold;
    if (breathingPhase === "Breathe Out") return styles.contract;
    return styles.idle;
  };

  return (
    <div className={`wrap pt_50 pb_100`}>
      <div className={styles.container}>
        {/* ==================== 1. BREATHING SECTION ==================== */}
        <div className={styles.breathingCard}>
          <div className={styles.breathingText}>
            <h3><Wind size={24} style={{ verticalAlign: "middle", marginRight: "8px", color: "var(--color2)" }} /> Guided Breathing Space</h3>
            <p>Box Breathing is a simple, scientifically-backed technique to calm your nervous system, reduce cortisol levels, and reset your mind.</p>
          </div>

          <div className={styles.breathingVisualizer}>
            <div className={`${styles.circleOuter} ${getPhaseClass()}`}>
              <div className={styles.circleInner}>
                <span className={styles.phaseLabel}>{isBreathing ? breathingPhase : "Ready"}</span>
                {isBreathing && <span className={styles.timerNum}>{secondsLeft}s</span>}
              </div>
            </div>

            <button
              onClick={toggleBreathing}
              className={`${styles.breathingButton} common_btn`}
            >
              {isBreathing ? (
                <>
                  <Square size={16} style={{ marginRight: "6px" }} /> Stop Guide
                </>
              ) : (
                <>
                  <Play size={16} style={{ marginRight: "6px" }} /> Start Breathing Guide
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {/* ==================== 2. HELPLINES SECTION ==================== */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle} style={{ color: "#d32f2f" }}>
              <Phone size={20} /> 24/7 Helpline & Crisis Support
            </h3>
            <p className={styles.sectionDesc}>If you or someone you know is struggling or in immediate distress, help is available. Speak to a professional now.</p>
            
            <div className={styles.helplineList}>
              {HELPLINES.map((hl, i) => (
                <div key={i} className={styles.helplineCard}>
                  <div className={styles.hlHeader}>
                    <span className={styles.hlName}>{hl.name}</span>
                    <a href={`tel:${hl.number}`} className={styles.hlNumber}>{hl.number}</a>
                  </div>
                  <p className={styles.hlDesc}>{hl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ==================== 3. MEDITATIONS SECTION ==================== */}
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>
              <BookOpen size={20} /> Mindful Exercises & Guides
            </h3>
            <p className={styles.sectionDesc}>Curated materials and practices to cultivate calm, increase focus, and build mental resilience.</p>
            
            <div className={styles.meditationList}>
              {MEDITATIONS.map((med, i) => (
                <div key={i} className={styles.meditationCard}>
                  <div className={styles.medHeader}>
                    <span className={styles.medCategory}>{med.category}</span>
                    <span className={styles.medDuration}>{med.duration}</span>
                  </div>
                  <h4 className={styles.medTitle}>{med.title}</h4>
                  <a
                    href={med.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.medLink}
                  >
                    Launch Guide <Volume2 size={14} style={{ marginLeft: "4px" }} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
