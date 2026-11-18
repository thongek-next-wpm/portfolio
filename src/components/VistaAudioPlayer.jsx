import { useCallback, useEffect, useRef, useState } from 'react';
import { Disc3, Minimize2, Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import bgmAudioUrl from '../assets/audio/bgm.mp3';

const TRACK_TITLE = 'New Look (Wii U Mii Maker Lofi Mix)';

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function VistaAudioPlayer({
  bootCompleted,
  enteredWithGesture,
  registerAudioHandlers,
}) {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 560
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [awaitingGesture, setAwaitingGesture] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barLevels, setBarLevels] = useState([0.28, 0.45, 0.36, 0.52, 0.4, 0.24]);

  const playerWrapRef = useRef(null);
  const audioRef = useRef(null);
  const userPausedRef = useRef(false);
  const bootCompletedRef = useRef(bootCompleted);
  const mutedRef = useRef(muted);
  const volumeRef = useRef(volume);
  const primedRef = useRef(false);
  const autoPlayAttemptedRef = useRef(false);
  const fadeTimerRef = useRef(null);
  const pillBtnRef = useRef(null);
  const minimizeBtnRef = useRef(null);

  bootCompletedRef.current = bootCompleted;
  mutedRef.current = muted;
  volumeRef.current = volume;

  const effectiveVolume = muted ? 0 : volume;

  const clearFadeTimer = () => {
    if (fadeTimerRef.current !== null) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const startPlayback = useCallback(async (withFade = true) => {
    const audio = audioRef.current;
    if (!audio || userPausedRef.current) return false;

    clearFadeTimer();
    const targetVol = mutedRef.current ? 0 : volumeRef.current;
    audio.muted = mutedRef.current;
    audio.volume = withFade ? Math.min(targetVol, 0.18) : targetVol;

    try {
      await audio.play();
      setIsPlaying(true);
      setAwaitingGesture(false);

      if (withFade) {
        let step = 2;
        const steps = 6;
        fadeTimerRef.current = window.setInterval(() => {
          if (!audioRef.current) {
            clearFadeTimer();
            return;
          }
          const currentTarget = mutedRef.current ? 0 : volumeRef.current;
          const nextVol = (currentTarget * step) / steps;
          audioRef.current.volume = Math.max(0, Math.min(1, nextVol));
          step += 1;
          if (step > steps) {
            clearFadeTimer();
          }
        }, 70);
      }

      return true;
    } catch {
      setIsPlaying(false);
      setAwaitingGesture(true);
      return false;
    }
  }, []);

  // Synchronously prime HTML5 <audio> inside a user click during VistaBootScreen
  // so Safari/Chrome unlock the media element cleanly before boot ends.
  const primeAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || primedRef.current || !audio.paused) return;
    primedRef.current = true;
    audio.muted = true;
    audio
      .play()
      .then(() => {
        if (!bootCompletedRef.current) {
          audio.pause();
          audio.currentTime = 0;
        }
        audio.muted = mutedRef.current;
      })
      .catch(() => {
        primedRef.current = false;
        audio.muted = mutedRef.current;
      });
  }, []);

  useEffect(() => {
    if (!registerAudioHandlers) return undefined;
    registerAudioHandlers({
      primeAudio,
      onBootGestureExit: () => {
        userPausedRef.current = false;
      },
    });
    return () => registerAudioHandlers(null);
  }, [registerAudioHandlers, primeAudio]);

  // Keep live volume synced when slider/mute changes outside fade
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      if (fadeTimerRef.current === null) {
        audioRef.current.volume = effectiveVolume;
      }
    }
  }, [effectiveVolume, muted]);

  // Animate Aero equalizer bars gently while audio plays
  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = window.setInterval(() => {
      setBarLevels([
        0.24 + Math.random() * 0.68,
        0.34 + Math.random() * 0.62,
        0.38 + Math.random() * 0.6,
        0.3 + Math.random() * 0.66,
        0.26 + Math.random() * 0.64,
        0.2 + Math.random() * 0.56,
      ]);
    }, 210);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  // Attempt autoplay once after Vista loading screen finishes (deferred gently for Vista chime)
  useEffect(() => {
    if (!bootCompleted || autoPlayAttemptedRef.current || userPausedRef.current) {
      return undefined;
    }
    autoPlayAttemptedRef.current = true;

    const delayMs = enteredWithGesture ? 1500 : 1100;
    const timer = window.setTimeout(() => {
      if (!userPausedRef.current && audioRef.current?.paused) {
        startPlayback(true);
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [bootCompleted, enteredWithGesture, startPlayback]);

  // If browser blocked un-gestured autoplay, start playback on first click/keypress outside player
  useEffect(() => {
    if (!bootCompleted || !awaitingGesture || userPausedRef.current) return undefined;

    const unlockOnClick = (e) => {
      if (userPausedRef.current) return;
      if (playerWrapRef.current && e.target instanceof Node && playerWrapRef.current.contains(e.target)) {
        return;
      }
      startPlayback(true);
    };

    const unlockOnKey = () => {
      if (!userPausedRef.current) {
        startPlayback(true);
      }
    };

    window.addEventListener('pointerdown', unlockOnClick);
    window.addEventListener('click', unlockOnClick);
    window.addEventListener('keydown', unlockOnKey, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockOnClick);
      window.removeEventListener('click', unlockOnClick);
      window.removeEventListener('keydown', unlockOnKey);
    };
  }, [bootCompleted, awaitingGesture, startPlayback]);

  useEffect(() => {
    return () => clearFadeTimer();
  }, []);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      clearFadeTimer();
      userPausedRef.current = true;
      audio.pause();
      setIsPlaying(false);
      setAwaitingGesture(false);
      setBarLevels([0.18, 0.22, 0.2, 0.24, 0.2, 0.16]);
    } else {
      userPausedRef.current = false;
      startPlayback(false);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const nextTime = ratio * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleMinimize = () => {
    setCollapsed(true);
    window.requestAnimationFrame(() => {
      pillBtnRef.current?.focus();
    });
  };

  const handleExpand = () => {
    setCollapsed(false);
    if (audioRef.current?.paused && !userPausedRef.current) {
      startPlayback(false);
    }
    window.requestAnimationFrame(() => {
      minimizeBtnRef.current?.focus();
    });
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <aside
      ref={playerWrapRef}
      className={`vista-player-wrap ${collapsed ? 'collapsed' : ''}`}
      aria-label="Aero Music Player"
    >
      <audio
        ref={audioRef}
        src={bgmAudioUrl}
        loop
        preload="auto"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onPlay={() => {
          setIsPlaying(true);
          setAwaitingGesture(false);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {collapsed ? (
        <button
          ref={pillBtnRef}
          type="button"
          className={`vista-player-pill ${awaitingGesture ? 'needs-gesture' : ''}`}
          onClick={handleExpand}
          title={awaitingGesture ? 'Tap to play background music' : 'Open Aero Media Player'}
        >
          <span className={`vista-disc-mini ${isPlaying ? 'spinning' : ''}`}>
            <Music size={14} />
          </span>
          <span className="vista-pill-label">
            {isPlaying ? 'Playing BGM' : awaitingGesture ? 'Tap to Play Music' : 'Aero Music'}
          </span>
          <span className="vista-eq-mini" aria-hidden="true">
            {barLevels.slice(0, 4).map((lvl, idx) => (
              <span
                key={idx}
                style={{ transform: `scaleY(${isPlaying ? lvl : 0.25})` }}
              />
            ))}
          </span>
        </button>
      ) : (
        <div className="aero-window vista-player-window">
          <div className="aero-window-titlebar vista-player-titlebar">
            <div className="aero-window-caption">
              <span className={`aero-jewel ${isPlaying ? 'eco' : 'aqua'}`} aria-hidden="true" />
              <span>AERO MEDIA // VISTA</span>
            </div>

            <button
              ref={minimizeBtnRef}
              type="button"
              className="vista-mini-icon-btn"
              onClick={handleMinimize}
              aria-label="Minimize music player"
              title="Minimize player"
            >
              <Minimize2 size={13} />
            </button>
          </div>

          <div className="aero-window-body vista-player-body">
            <div className="vista-player-top">
              <div className={`vista-player-disc ${isPlaying ? 'spinning' : ''}`} aria-hidden="true">
                <Disc3 size={22} />
              </div>

              <div className="vista-player-meta">
                <div className="vista-track-title" title={TRACK_TITLE}>
                  {TRACK_TITLE}
                </div>
                <div className="vista-track-sub">
                  <span className="vista-source-badge">FULL MP3</span>
                  <span className="vista-time-readout">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  {awaitingGesture && (
                    <span className="vista-gesture-hint">Tap Play to listen</span>
                  )}
                </div>
              </div>

              <div className="vista-eq-bars" aria-hidden="true">
                {barLevels.map((lvl, idx) => (
                  <span
                    key={idx}
                    className="vista-eq-bar"
                    style={{
                      transform: `scaleY(${isPlaying ? Math.max(0.18, lvl) : 0.22})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="vista-progress-bar"
              role="slider"
              tabIndex={0}
              aria-label="Seek music progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(currentTime)}
              onClick={handleSeek}
              onKeyDown={(e) => {
                const audio = audioRef.current;
                if (!audio || !duration) return;
                if (e.key === 'ArrowRight') {
                  audio.currentTime = Math.min(duration, audio.currentTime + 5);
                } else if (e.key === 'ArrowLeft') {
                  audio.currentTime = Math.max(0, audio.currentTime - 5);
                }
              }}
            >
              <div
                className="vista-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="vista-player-controls">
              <button
                type="button"
                className={`vista-play-orb ${awaitingGesture ? 'pulse-cta' : ''}`}
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
              </button>

              <div className="vista-volume-wrap">
                <button
                  type="button"
                  className="vista-mute-btn"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                >
                  {muted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={effectiveVolume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (v > 0 && muted) setMuted(false);
                  }}
                  className="vista-volume-slider"
                  aria-label="Music volume"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
