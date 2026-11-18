import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { PROFILE } from '../data/portfolioData';
import { VistaThemeAudioSession } from '../audio/aeroAudioEngine';

const BOOT_DURATION_MS = 5000;
const WELCOME_SWITCH_MS = 2300;
const THEME_TRIGGER_MS = 3200;

const BOOT_STATUS_MESSAGES = [
  'Starting AeroOS…',
  'Loading Frutiger Aero Desktop…',
];

export default function VistaBootScreen({ onPrimeAudio, onUserGesture, onComplete }) {
  const [phase, setPhase] = useState('boot'); // 'boot' -> 'welcome' -> 'exiting'
  const [elapsedMs, setElapsedMs] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const completedRef = useRef(false);
  const soundEnabledRef = useRef(true);
  const audioSessionRef = useRef(null);

  if (!audioSessionRef.current) {
    audioSessionRef.current = new VistaThemeAudioSession();
  }

  const tryStartAmbience = async () => {
    const session = audioSessionRef.current;
    if (!session || !soundEnabledRef.current || session.themePlayed) return;
    const ok = await session.startLoadingAmbience();
    setAutoplayBlocked(!ok);
  };

  const toggleSound = async () => {
    const next = !soundEnabledRef.current;
    soundEnabledRef.current = next;
    setSoundEnabled(next);
    const session = audioSessionRef.current;
    if (!session) return;
    session.setMuted(!next);

    if (next) {
      onPrimeAudio?.();
      if (!session.themePlayed) {
        const ok = await session.startLoadingAmbience();
        setAutoplayBlocked(!ok);
      }
    } else {
      setAutoplayBlocked(false);
    }
  };

  const unlockAudioIfEnabled = async () => {
    if (!soundEnabledRef.current) return;
    onPrimeAudio?.();
    await tryStartAmbience();
  };

  const finishBoot = (withUserGesture = false) => {
    if (withUserGesture) {
      onPrimeAudio?.();
      onUserGesture?.();
    }

    const session = audioSessionRef.current;
    if (session && soundEnabledRef.current && !session.themePlayed) {
      session.playStartupThemeAndRelease();
    }

    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('exiting');
    window.setTimeout(() => {
      onComplete({
        withUserGesture,
        pendingVistaSession:
          session && soundEnabledRef.current && !session.themePlayed ? session : null,
      });
    }, 480);
  };

  useEffect(() => {
    const session = audioSessionRef.current;
    const startTime = Date.now();

    if (soundEnabledRef.current) {
      session.startLoadingAmbience().then((ok) => {
        if (!completedRef.current && soundEnabledRef.current) {
          setAutoplayBlocked(!ok);
        }
      });
    }

    const progressTimer = window.setInterval(() => {
      const nextElapsed = Math.min(BOOT_DURATION_MS, Date.now() - startTime);
      setElapsedMs(nextElapsed);
    }, 200);

    const welcomeTimer = window.setTimeout(() => {
      setPhase((prev) => (prev === 'boot' ? 'welcome' : prev));
    }, WELCOME_SWITCH_MS);

    const themeTimer = window.setTimeout(() => {
      if (soundEnabledRef.current && !session.themePlayed) {
        session.playStartupThemeAndRelease().then((ok) => {
          if (ok) setAutoplayBlocked(false);
        });
      }
    }, THEME_TRIGGER_MS);

    const exitTimer = window.setTimeout(() => {
      finishBoot(false);
    }, BOOT_DURATION_MS);

    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        finishBoot(true);
      } else if (e.key === ' ') {
        e.preventDefault();
        unlockAudioIfEnabled();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(themeTimer);
      window.clearTimeout(exitTimer);
      window.removeEventListener('keydown', onKeyDown);
      if (!session.themePlayed && !completedRef.current) {
        session.dispose();
      }
    };
  }, []);

  const progressPct = Math.min(100, Math.round((elapsedMs / BOOT_DURATION_MS) * 100));
  const remainingSec = Math.max(0, Math.ceil((BOOT_DURATION_MS - elapsedMs) / 1000));
  const statusIndex = Math.min(
    BOOT_STATUS_MESSAGES.length - 1,
    Math.floor((elapsedMs / WELCOME_SWITCH_MS) * BOOT_STATUS_MESSAGES.length)
  );

  const soundPillLabel = !soundEnabled
    ? 'Vista Sound: Muted'
    : autoplayBlocked
      ? 'Tap Anywhere for Sound'
      : 'Vista Sound: ON';

  return (
    <div
      className={`vista-boot-overlay vista-phase-${phase}`}
      role="dialog"
      aria-label="Windows Vista style startup loading screen"
      onClick={unlockAudioIfEnabled}
    >
      <div className="vista-aurora-layer" aria-hidden="true">
        <div className="vista-aurora-ribbon ribbon-1" />
        <div className="vista-aurora-ribbon ribbon-2" />
        <div className="vista-aurora-ribbon ribbon-3" />
      </div>

      <button
        type="button"
        className={`vista-sound-btn ${soundEnabled && !autoplayBlocked ? 'active' : ''} ${autoplayBlocked ? 'needs-gesture' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (autoplayBlocked) {
            unlockAudioIfEnabled();
          } else {
            toggleSound();
          }
        }}
        aria-pressed={soundEnabled && !autoplayBlocked}
        title={soundPillLabel}
      >
        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>{soundPillLabel}</span>
      </button>

      <button
        type="button"
        className="vista-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          finishBoot(true);
        }}
      >
        <span>Skip &amp; Enter</span>
        <ArrowRight size={13} />
      </button>

      {phase === 'boot' ? (
        <div className="vista-boot-stage">
          <div className="vista-boot-orb" aria-hidden="true">
            <span>{PROFILE.monogram}</span>
          </div>

          <div
            className="vista-boot-track"
            role="progressbar"
            aria-label="Loading AeroOS"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="vista-boot-runner">
              <span className="vista-boot-bar" />
              <span className="vista-boot-bar" />
              <span className="vista-boot-bar" />
            </div>
          </div>

          <div className="vista-boot-label">{BOOT_STATUS_MESSAGES[statusIndex]}</div>
          <div className="vista-boot-meta">
            <span>{progressPct}%</span>
            <span>&bull;</span>
            <span>Entering desktop in {remainingSec}s</span>
          </div>
          {autoplayBlocked && (
            <div className="vista-sound-hint">
              Tap screen once to unlock browser audio
            </div>
          )}
          <div className="vista-boot-copy">
            &copy; {PROFILE.firstName} &ldquo;{PROFILE.nickname}&rdquo; {PROFILE.lastName}
          </div>
        </div>
      ) : (
        <div className="vista-welcome-stage">
          <div className="vista-welcome-card" onClick={(e) => { e.stopPropagation(); unlockAudioIfEnabled(); }}>
            <div className="vista-welcome-avatar-wrap">
              <img
                src={PROFILE.avatarUrl}
                alt={`${PROFILE.firstName} ${PROFILE.lastName}`}
                className="vista-welcome-avatar"
              />
              <span className="vista-wait-ring" aria-hidden="true" />
            </div>

            <div className="vista-welcome-heading">
              <span className="vista-spinner-dot" aria-hidden="true" />
              <span>Welcome</span>
            </div>

            <div className="vista-welcome-name">
              Thongek &ldquo;{PROFILE.nickname}&rdquo; Wongpomon
            </div>
            <div className="vista-welcome-sub">
              Preparing Frutiger Aero Desktop &bull; {progressPct}% ({remainingSec}s)
            </div>

            <button
              type="button"
              className="vista-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                finishBoot(true);
              }}
            >
              <Volume2 size={15} />
              <span>Enter Aero Desktop</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
