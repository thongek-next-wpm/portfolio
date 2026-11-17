import { useEffect, useState } from 'react';
import { PROFILE } from './data/portfolioData';
import StarfieldCanvas from './components/StarfieldCanvas';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import WorksSection from './components/WorksSection';
import StackSection from './components/StackSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ProjectModal from './components/ProjectModal';
import HireModal from './components/HireModal';

export default function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [githubStats, setGithubStats] = useState({
    repos: PROFILE.baselineStats.repos,
    followers: PROFILE.baselineStats.followers,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch(`https://api.github.com/users/${PROFILE.handle}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setGithubStats({
          repos: typeof data.public_repos === 'number' ? data.public_repos : PROFILE.baselineStats.repos,
          followers: typeof data.followers === 'number' ? data.followers : PROFILE.baselineStats.followers,
        });
      })
      .catch(() => {
        // Fallback silently to verified baseline stats when offline or rate-limited
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <StarfieldCanvas />
      <div className="app-shell">
        <Navbar onOpenHireModal={() => setHireModalOpen(true)} />
        <main>
          <Hero githubStats={githubStats} />
          <AboutSection />
          <WorksSection onSelectProject={setSelectedProject} />
          <StackSection />
          <ContactSection />
        </main>
        <Footer />
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <HireModal
        open={hireModalOpen}
        onClose={() => setHireModalOpen(false)}
      />
    </>
  );
}
