import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
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

  const completedRef = useRef(false);
  const audioSessionRef = useRef(null);
  const mountTimeRef = useRef(Date.now());

  if (!audioSessionRef.current) {
    audioSessionRef.current = new VistaThemeAudioSession();
  }

  const unlockAudio = async () => {
    onPrimeAudio?.();
    const session = audioSessionRef.current;
    if (!session || session.themePlayed) return;
    if (Date.now() - mountTimeRef.current >= THEME_TRIGGER_MS) {
      await session.playStartupThemeAndRelease();
    } else {
      await session.startLoadingAmbience();
    }
  };

  const finishBoot = (withUserGesture = false) => {
    if (withUserGesture) {
      onPrimeAudio?.();
      onUserGesture?.();
    }

    const session = audioSessionRef.current;
    if (session && !session.themePlayed) {
      session.playStartupThemeAndRelease();
    }

    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('exiting');
    window.setTimeout(() => {
      onComplete({
        withUserGesture,
        pendingVistaSession:
          session && !session.themePlayed ? session : null,
      });
    }, 480);
  };

  useEffect(() => {
    const session = audioSessionRef.current;
    const startTime = Date.now();
    mountTimeRef.current = startTime;

    session.startLoadingAmbience();

    const progressTimer = window.setInterval(() => {
      const nextElapsed = Math.min(BOOT_DURATION_MS, Date.now() - startTime);
      setElapsedMs(nextElapsed);
    }, 200);

    const welcomeTimer = window.setTimeout(() => {
      setPhase((prev) => (prev === 'boot' ? 'welcome' : prev));
    }, WELCOME_SWITCH_MS);

    const themeTimer = window.setTimeout(() => {
      if (!session.themePlayed) {
        session.playStartupThemeAndRelease();
      }
    }, THEME_TRIGGER_MS);

    const exitTimer = window.setTimeout(() => {
      finishBoot(false);
    }, BOOT_DURATION_MS);

    const onPointerGesture = () => {
      unlockAudio();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        finishBoot(true);
      } else {
        unlockAudio();
      }
    };

    window.addEventListener('pointerdown', onPointerGesture, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(themeTimer);
      window.clearTimeout(exitTimer);
      window.removeEventListener('pointerdown', onPointerGesture);
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

  return (
    <div
      className={`vista-boot-overlay vista-phase-${phase}`}
      role="dialog"
      aria-label="Windows Vista style startup loading screen"
      onClick={unlockAudio}
    >
      <div className="vista-aurora-layer" aria-hidden="true">
        <div className="vista-aurora-ribbon ribbon-1" />
        <div className="vista-aurora-ribbon ribbon-2" />
        <div className="vista-aurora-ribbon ribbon-3" />
      </div>

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
          <div className="vista-boot-copy">
            &copy; {PROFILE.firstName} &ldquo;{PROFILE.nickname}&rdquo; {PROFILE.lastName}
          </div>
        </div>
      ) : (
        <div className="vista-welcome-stage">
          <div
            className="vista-welcome-card"
            onClick={(e) => {
              e.stopPropagation();
              unlockAudio();
            }}
          >
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
              <span>Enter Aero Desktop</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
