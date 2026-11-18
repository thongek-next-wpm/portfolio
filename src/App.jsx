import { useCallback, useEffect, useRef, useState } from "react";
import { PROFILE } from "./data/portfolioData";
import { AERO_THEME_MAP } from "./data/aeroThemes";
import AeroAtmosphereCanvas from "./components/AeroAtmosphereCanvas";
import VistaBootScreen from "./components/VistaBootScreen";
import VistaAudioPlayer from "./components/VistaAudioPlayer";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import WorksSection from "./components/WorksSection";
import StackSection from "./components/StackSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import ProjectModal from "./components/ProjectModal";
import HireModal from "./components/HireModal";

function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem("aero-palette");
    if (saved && AERO_THEME_MAP[saved]) return saved;
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return "eco";
}

export default function App() {
  const [aeroTheme, setAeroTheme] = useState(getInitialTheme);
  const [bootCompleted, setBootCompleted] = useState(false);
  const [enteredWithGesture, setEnteredWithGesture] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const audioHandlersRef = useRef(null);
  const pendingVistaSessionRef = useRef(null);
  const [githubStats, setGithubStats] = useState({
    repos: PROFILE.baselineStats.repos,
    followers: PROFILE.baselineStats.followers,
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-aero-theme", aeroTheme);
    try {
      window.localStorage.setItem("aero-palette", aeroTheme);
    } catch {
      // Ignore storage access errors
    }
  }, [aeroTheme]);

  useEffect(() => {
    if (bootCompleted) {
      document.body.style.overflow = "";
      return undefined;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [bootCompleted]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://api.github.com/users/${PROFILE.handle}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setGithubStats({
          repos:
            typeof data.public_repos === "number"
              ? data.public_repos
              : PROFILE.baselineStats.repos,
          followers:
            typeof data.followers === "number"
              ? data.followers
              : PROFILE.baselineStats.followers,
        });
      })
      .catch(() => {
        // Fallback silently to verified baseline stats when offline or rate-limited
      });

    return () => controller.abort();
  }, []);

  const registerAudioHandlers = useCallback((handlers) => {
    audioHandlersRef.current = handlers;
  }, []);

  const handlePrimeAudio = useCallback(() => {
    audioHandlersRef.current?.primeAudio?.();
  }, []);

  const handleUserGestureFromBoot = useCallback(() => {
    audioHandlersRef.current?.onBootGestureExit?.();
  }, []);

  const handleBootComplete = ({ withUserGesture, pendingVistaSession }) => {
    setEnteredWithGesture(Boolean(withUserGesture));
    setBootCompleted(true);

    if (pendingVistaSession) {
      pendingVistaSessionRef.current = pendingVistaSession;
      const playPendingVista = () => {
        const session = pendingVistaSessionRef.current;
        if (!session) return;
        pendingVistaSessionRef.current = null;
        session.playStartupThemeAndRelease();
      };
      window.addEventListener("click", playPendingVista, { once: true });
      window.addEventListener("keydown", playPendingVista, { once: true });
    }
  };

  return (
    <>
      {!bootCompleted && (
        <VistaBootScreen
          onPrimeAudio={handlePrimeAudio}
          onUserGesture={handleUserGestureFromBoot}
          onComplete={handleBootComplete}
        />
      )}

      <div className="aero-sky-backdrop" aria-hidden="true" />
      <AeroAtmosphereCanvas theme={aeroTheme} />
      <div
        className={`app-shell ${bootCompleted ? "app-ready" : "app-booting"}`}
      >
        <Navbar
          aeroTheme={aeroTheme}
          onChangeTheme={setAeroTheme}
          onOpenHireModal={() => setHireModalOpen(true)}
        />
        <main>
          <Hero theme={aeroTheme} githubStats={githubStats} />
          <AboutSection />
          <WorksSection onSelectProject={setSelectedProject} />
          <StackSection />
          <ContactSection />
        </main>
        <Footer />
      </div>

      <VistaAudioPlayer
        bootCompleted={bootCompleted}
        enteredWithGesture={enteredWithGesture}
        registerAudioHandlers={registerAudioHandlers}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <HireModal open={hireModalOpen} onClose={() => setHireModalOpen(false)} />
    </>
  );
}
