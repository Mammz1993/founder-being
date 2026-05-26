import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Compass, 
  Sparkles, 
  Leaf, 
  Trees, 
  Users, 
  Eye, 
  Award,
  ArrowRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Moon,
  Sun,
  X,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Heart,
  ExternalLink
} from 'lucide-react';
import AmbientSound from './components/AmbientSound';
import MoonPhase from './components/MoonPhase';
import InteractiveJournal from './components/InteractiveJournal';
import { downloadICS } from './components/CalendarHelper';
import { InvitationRequest, RsvpRequest, WaitlistRequest } from './types';
import EcosystemStrip from './components/EcosystemStrip';

export default function App() {
  const [theme, setTheme] = useState<'midnight' | 'dawn'>('midnight');
  const [activeModal, setActiveModal] = useState<'rsvp' | 'waitlist' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  
  // Forms States
  const [invitationForm, setInvitationForm] = useState<InvitationRequest>({
    name: '',
    email: '',
    company: '',
    stage: 'Early Stage',
    challenges: ''
  });
  const [invitationSubmitted, setInvitationSubmitted] = useState(false);

  const [rsvpForm, setRsvpForm] = useState<RsvpRequest>({
    name: '',
    email: '',
    dietaryNote: '',
    bringingPlusOne: false
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const [waitlistForm, setWaitlistForm] = useState<WaitlistRequest>({
    name: '',
    email: '',
    reason: ''
  });
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Monitor Scroll for Glassmorphic Header transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInvitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationForm.name || !invitationForm.email) return;
    setInvitationSubmitted(true);
    // Persist mock sign up
    const members = JSON.parse(localStorage.getItem('founder_members') || '[]');
    localStorage.setItem('founder_members', JSON.stringify([...members, invitationForm]));
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name || !rsvpForm.email) return;
    setRsvpSubmitted(true);
    // Close modal gently shortly after success message
    setTimeout(() => {
      setActiveModal(null);
      setRsvpSubmitted(false);
      setRsvpForm({ name: '', email: '', dietaryNote: '', bringingPlusOne: false });
    }, 4000);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistForm.name || !waitlistForm.email) return;
    setWaitlistSubmitted(true);
    setTimeout(() => {
      setActiveModal(null);
      setWaitlistSubmitted(false);
      setWaitlistForm({ name: '', email: '', reason: '' });
    }, 4000);
  };

  const stageCards = [
    {
      stage: "Early Stage",
      quote: "“Finding clarity amid uncertainty.”",
      desc: "Formulate strategic resilience early. When you navigate validation under pressure, conscious patterns prevent founder burnout before the initial scale begins."
    },
    {
      stage: "Scaling Founders",
      quote: "“Managing pressure while leading growth.”",
      desc: "For those confronting relentless fundraising pacing, team expansion stress, and public performance expectations. Anchor yourself while scaling."
    },
    {
      stage: "Mature Operators",
      quote: "“Reconnecting beyond performance and valuation.”",
      desc: "For CEOs and exits who carry systemic growth fatigues. Discover your core humanity separate from board slides, stock performance, and acquisitions."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-[1500ms] font-sans antialiased ${
      theme === 'midnight' 
        ? 'bg-stone-950 text-stone-100 selection:bg-stone-800 selection:text-white' 
        : 'bg-[#faf9f6]/95 text-stone-900 selection:bg-stone-200 selection:text-stone-900'
    }`}>
      
      {/* Floating Header */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 border-b ${
        scrolled 
          ? 'py-3 backdrop-blur-xl bg-stone-950/70 dark:bg-stone-950/70 border-stone-200/10 dark:border-stone-800/40' 
          : 'py-6 bg-transparent border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 rounded-full bg-stone-900 border border-stone-800/60 dark:bg-stone-100 dark:border-white flex items-center justify-center overflow-hidden transition-transform group-hover:rotate-[30deg] duration-700">
              <span className="text-[10px] font-mono font-bold text-stone-100 dark:text-stone-900">FB</span>
            </div>
            <span className="font-display font-light text-base tracking-[0.2em] uppercase transition-opacity hover:opacity-80">
              Founder-Being
            </span>
          </a>

          {/* Nav Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-wider">
            <a href="#gathering" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">GATHERING</a>
            <a href="#about" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">ABOUT</a>
            <a href="#reflections" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors">REFLECTIONS</a>
            <a href="#signup" className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors text-amber-800 dark:text-amber-400 font-medium">INVITATION</a>
          </nav>

          {/* Mini controls */}
          <div className="flex items-center gap-3">
            <AmbientSound />
            <MoonPhase />
            
            {/* Theme switcher */}
            <button
              onClick={() => setTheme(theme === 'midnight' ? 'dawn' : 'midnight')}
              className="p-1.5 rounded-full hover:bg-stone-200/30 dark:hover:bg-white/5 transition-all text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              title={theme === 'midnight' ? "Switch to Dawn Silence" : "Switch to Midnight Silence"}
              id="theme-toggle-btn"
            >
              {theme === 'midnight' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">
        {/* Atmospheric Background with parallax asset */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-stone-950/40 to-stone-950/100 z-10 pointer-events-none" />
          <img
            src="/src/assets/images/moonlight_stillness_1779712126776.png"
            alt="Moonlight stillness reflecting on deep ocean"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-[12000ms] transform scale-105 hover:scale-100 select-none brightness-[0.4] dark:brightness-[0.3]"
          />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center flex flex-col items-center mt-8">
          {/* Tagline / Sub-label */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex flex-col items-center"
          >
            <span className="px-3.5 py-1 rounded-full border border-stone-200/20 bg-stone-950/60 backdrop-blur-md text-[10px] font-mono tracking-[0.3em] uppercase text-stone-300 dark:text-stone-400">
              Conversations Beyond Startup Pressure
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-light tracking-tight text-white leading-[1.12]"
            id="hero-headline"
          >
            “Building companies shouldn’t cost founders their peace.”
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg font-sans text-stone-200 font-light mt-6 max-w-2xl leading-relaxed opacity-95"
          >
            Founder-Being creates spaces for founders to pause, reflect, reconnect, and think clearly again. A wellbeing & clarity community helping entrepreneurs live with conscious balance.
          </motion.p>

          {/* Quick CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto items-center"
          >
            <a 
              href="#signup" 
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-mono uppercase tracking-wider rounded-lg bg-stone-100 text-stone-950 hover:bg-white border border-stone-100 font-medium transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Join Community</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://luma.com/dxkle2ds"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-mono uppercase tracking-wider rounded-lg bg-stone-950/60 text-stone-100 backdrop-blur-md border border-stone-100/30 hover:bg-stone-900/60 hover:border-stone-100/60 font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Attend Next Session</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            </a>
          </motion.div>
        </div>

        {/* Slow drift / wave scroll pointer */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden md:flex flex-col items-center opacity-40 hover:opacity-80 transition-opacity">
          <span className="text-[9px] font-mono tracking-widest text-stone-200 uppercase mb-2">
            Descent to calmness
          </span>
          <div className="w-px h-8 bg-stone-200/50 animate-bounce" />
        </div>
      </section>

      {/* 2. Announcement Section */}
      <section id="gathering" className="py-24 md:py-32 px-4 md:px-8 border-t border-stone-200/10 dark:border-stone-850">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 md:mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-baseline gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-[0.25em] text-amber-800 dark:text-amber-500 uppercase block mb-2">
                Active Cycle Gathering
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-light tracking-tight">
                Full Moon Founder Gathering
              </h2>
            </div>
            <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
              DUBAI · MIDDLE EAST · INDIA · SOUTH EAST ASIA · GLOBAL PORTS
            </div>
          </div>

          {/* Event Content Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Event Media Panel */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200/30 dark:border-stone-800/50 relative flex flex-col justify-end min-h-[340px] lg:min-h-auto">
              <img
                src="/src/assets/images/full_moon_gathering_1779712149554.png"
                alt="Theme: Manifesting and Letting Go Artwork"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.55] hover:brightness-[0.6] transition-all"
              />
              <div className="relative z-10 p-6 md:p-8 text-white bg-gradient-to-t from-black/90 via-black/35 to-transparent">
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase bg-stone-950/85 px-3 py-1 rounded-full border border-stone-500/20">
                  Full Moon Gathering
                </span>
                <h3 className="text-xl md:text-2xl font-display font-light mt-4 text-stone-100">
                  “Manifesting & Letting Go”
                </h3>
                <p className="text-xs text-stone-300 font-light mt-2 leading-relaxed">
                  Led by Jimmy James. An unhurried sunset and silent beach circle in Fort Kochi, holding conversations that are forbidden in standard boardrooms.
                </p>
              </div>
            </div>

            {/* Event Registration Details Panel */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 bg-white/20 dark:bg-stone-900/10 backdrop-blur-md">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-light text-stone-900 dark:text-stone-100">
                    Founder-Being — Full Moon Founder Gathering
                  </h3>
                  <p className="text-xs md:text-sm text-stone-550 dark:text-stone-400 mt-2 font-mono">
                    An intimate meeting setup built for deep restoration, clear-mindedness, and emotional balance under the moon.
                  </p>
                </div>

                <hr className="border-stone-200/20 dark:border-stone-800/40" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-800/80 dark:text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider">
                        Location / Port
                      </h4>
                      <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                        Pandal, Fort Kochi
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                        Kochi, Kerala
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-800/80 dark:text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider">
                        Date
                      </h4>
                      <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                        30 May 2026
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                        Saturday Sunset
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-800/80 dark:text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-mono text-stone-550 dark:text-stone-400 uppercase tracking-wider">
                        Time
                      </h4>
                      <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-0.5">
                        18:30 - 21:30
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                        Kochi Sunset Cycle
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-stone-600 dark:text-stone-400 leading-relaxed font-light text-xs md:text-sm">
                  <p>
                    On <strong>30 May 2026</strong>, Founder-Being will host an intimate founder wellbeing and clarity meetup at Pandal, Fort Kochi under the full moon.
                  </p>
                  <p>
                    This gathering is designed for founders, builders, operators, creators, and entrepreneurs who are navigating the pressure, uncertainty, and emotional intensity that often comes with building companies and leading ambitious lives.
                  </p>
                  <p>
                    The session will be led by <strong>Jimmy James</strong> alongside the Founder-Being community and will include guided reflections, open discussions, stillness practices, and mindful founder interactions in a calm and immersive atmosphere.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-stone-200/10 dark:border-stone-800/30 text-center text-[10px] font-mono text-stone-450 dark:text-stone-500">
                  <div className="py-1 px-2 rounded bg-stone-100/50 dark:bg-stone-950/25">Not a pitch event.</div>
                  <div className="py-1 px-2 rounded bg-stone-100/50 dark:bg-stone-950/25">Not a panel discussion.</div>
                  <div className="py-1 px-2 rounded bg-stone-100/50 dark:bg-stone-950/25">Not a productivity workshop.</div>
                </div>

                <p className="text-xs text-amber-900 dark:text-amber-400 font-serif italic text-center pt-1 border-b border-dashed border-stone-200/10 pb-2">
                  “It is a space for founders to reconnect with clarity, emotional balance, and themselves.”
                </p>
              </div>

              {/* Engagement Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-stone-200/10 dark:border-stone-800/30">
                <a
                  href="https://luma.com/dxkle2ds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider rounded-md bg-stone-900 border border-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white dark:border-stone-100 cursor-pointer transition-all flex items-center gap-2"
                  id="open-rsvp-btn"
                >
                  <span>RSVP on Luma</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://luma.com/dxkle2ds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider rounded-md bg-stone-150/40 border border-stone-300/30 dark:border-stone-800/40 text-stone-700 dark:text-stone-300 hover:border-stone-400 cursor-pointer transition-all flex items-center gap-2"
                  id="open-waitlist-btn"
                >
                  <span>Request Waitlist</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={downloadICS}
                  className="px-4 py-2.5 text-xs font-mono text-amber-800/90 dark:text-amber-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer ml-auto transition-colors"
                  title="Add to iCalendar"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Founder-Being */}
      <section id="about" className="py-24 md:py-32 px-4 md:px-8 bg-stone-50/40 dark:bg-stone-950/10 transition-colors duration-[1500ms]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
            {/* Context Left Column */}
            <div className="lg:col-span-5">
              <span className="text-[10px] font-mono tracking-[0.25em] text-stone-500 dark:text-stone-400 uppercase block mb-3">
                Intentional Separation
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-light tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                Not a startup hub.
                <span className="block mt-1 font-sans italic font-light opacity-60">Not a networking club.</span>
              </h2>
              <div className="mt-8 p-6 rounded-xl bg-amber-500/5 border-l-2 border-amber-800 dark:border-amber-500/80">
                <p className="text-sm text-stone-800 dark:text-stone-200 font-light leading-relaxed">
                  <strong>Founder-Being</strong> exists to restore the human balance behind ambitious founders.
                </p>
              </div>
            </div>

            {/* Informational Right Narrative */}
            <div className="lg:col-span-7 space-y-6 text-sm sm:text-base leading-relaxed font-light text-stone-700 dark:text-stone-300">
              <p>
                Modern startup culture rewards constant output — metrics, fundraising, scaling, hiring, pressure. Founders are expected to operate like machines while carrying invisible emotional weight.
              </p>
              
              <p className="font-sans font-normal border-l border-stone-300 dark:border-stone-800 pl-5 text-stone-900 dark:text-stone-100">
                Founder-Being is a stillness framework for conscious leaders navigating high cognitive and emotional intensity.
              </p>

              <p>
                We do not celebrate burnout or performance culture. We gather across Dubai, the Middle East, India, and Southeast Asia to address what founders rarely say out loud:
              </p>

              {/* Stress List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                {[
                  { term: "Founder burnout", d: "Cognitive exhaustion from carrying investor and team stakes." },
                  { term: "Emotional exhaustion", d: "The unaddressed mental fatigue of continuous high-intensity cycles." },
                  { term: "Fundraising pressure", d: "The silent anxiety of board metrics, valuations, and runway runway." },
                  { term: "Scaling fatigue", d: "The intense friction of managing expanding team structures." },
                  { term: "Leadership loneliness", d: "Carrying high stake responsibilities in absolute isolation." },
                  { term: "Nervous system overload", d: "Chronic fight-or-flight responses from non-stop digital demands." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-stone-150/20 dark:bg-stone-900/30 border border-stone-200/5 dark:border-stone-850 flex items-start gap-2.5">
                    <span className="text-amber-800 dark:text-amber-500 mt-1">✦</span>
                    <div>
                      <span className="text-xs font-mono text-stone-900 dark:text-stone-100 block font-medium uppercase tracking-wide">
                        {item.term}
                      </span>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 leading-snug block mt-0.5">
                        {item.d}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Board (Silent Practice) */}
      <section id="reflections" className="py-24 md:py-32 px-4 md:px-8 bg-stone-50/40 dark:bg-stone-950/20 border-t border-b border-stone-200/15 dark:border-stone-850">
        <div className="max-w-6xl mx-auto">
          <InteractiveJournal />
        </div>
      </section>

      {/* 6. Founder Stages Section */}
      <section id="stages" className="py-24 md:py-32 px-4 md:px-8 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] text-amber-800 dark:text-amber-500 uppercase">
              Cohort Structuring
            </span>
            <span className="block text-2xl md:text-3.5xl font-display font-light text-stone-900 dark:text-stone-100 mt-2">
              Spaces Designed for Your Journey
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-2 max-w-sm mx-auto">
              We group dialogues carefully so you collaborate only with founders facing identical thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stageCards.map((card, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl border border-stone-200/30 dark:border-stone-800/40 bg-white/30 dark:bg-stone-900/10 hover:bg-white dark:hover:bg-stone-950/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xs font-mono tracking-widest text-[#d4af37] uppercase">
                    {card.stage}
                  </h3>
                  <p className="font-display italic font-light text-lg text-stone-800 dark:text-stone-200 mt-4 leading-snug">
                    {card.quote}
                  </p>
                </div>
                <p className="text-xs font-light text-stone-500 dark:text-stone-400 mt-6 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Affiliations / Ecosystem Section */}
      <EcosystemStrip />

      {/* 8. Community Invitation Signup Form */}
      <section id="signup" className="py-24 md:py-32 px-4 md:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl border border-stone-200/40 dark:border-stone-800/60 bg-gradient-to-br from-stone-50/50 to-stone-100/50 dark:from-stone-950/60 dark:to-stone-900/10 p-8 md:p-12 relative overflow-hidden">
          
          {/* Form Content / Wrapper */}
          <div className="max-w-2xl mx-auto">
            {invitationSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-6 h-6 text-amber-800 dark:text-amber-500" />
                </div>
                <h3 className="text-2xl font-display font-light text-stone-900 dark:text-stone-100">
                  Invitation Request Received
                </h3>
                <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-3 font-mono leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong>{invitationForm.name}</strong>. We review requests on each waxing phase cycle to ensure alignment. Look for a thoughtful reply from us soon.
                </p>
                <button
                  onClick={() => {
                    setInvitationSubmitted(false);
                    setInvitationForm({ name: '', email: '', company: '', stage: 'Early Stage', challenges: '' });
                  }}
                  className="mt-8 text-xs font-mono text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Submit another reflection or request
                </button>
              </motion.div>
            ) : (
              <div>
                <div className="text-center mb-10">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase block mb-2">
                    Request Integration
                  </span>
                  <h2 className="text-3xl font-display font-light text-stone-900 dark:text-stone-100">
                    Request an Invitation
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-light mt-2 max-w-md mx-auto">
                    To maintain strict confidentiality and a high resonance environment, entry is review-based and structured for active tech operators.
                  </p>
                </div>

                <form onSubmit={handleInvitationSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={invitationForm.name}
                        onChange={(e) => setInvitationForm({ ...invitationForm, name: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950/80 px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-850/80 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-700"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Email (Confidential)
                      </label>
                      <input
                        type="email"
                        required
                        value={invitationForm.email}
                        onChange={(e) => setInvitationForm({ ...invitationForm, email: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950/80 px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-850/80 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-700"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Startup / Company
                      </label>
                      <input
                        type="text"
                        required
                        value={invitationForm.company}
                        onChange={(e) => setInvitationForm({ ...invitationForm, company: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950/80 px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-850/80 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-700"
                        placeholder="Inc. / Labs / Technologies"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                        Founder Stage
                      </label>
                      <select
                        value={invitationForm.stage}
                        onChange={(e) => setInvitationForm({ ...invitationForm, stage: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950/80 px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-850/80 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors text-sm text-stone-900 dark:text-stone-100"
                      >
                        <option value="Early Stage">Early Stage (Pre-seed / Seed)</option>
                        <option value="Scaling Founder">Scaling (Series A / B)</option>
                        <option value="Mature Operator">Mature (Series C+ / Exit)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                      What are you currently navigating or seeking from the cycle?
                    </label>
                    <textarea
                      required
                      value={invitationForm.challenges}
                      onChange={(e) => setInvitationForm({ ...invitationForm, challenges: e.target.value })}
                      className="w-full bg-white dark:bg-stone-950/80 px-4 py-3 rounded-lg border border-stone-200 dark:border-stone-850/80 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-750 min-h-[100px] resize-none"
                      placeholder="e.g. Seeking unhurried dialogue, managing burnout, scaling pacing, or loneliness..."
                    />
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-lg text-xs font-mono uppercase tracking-wider bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white border border-stone-900 dark:border-stone-100 font-medium cursor-pointer transition-all shadow"
                      id="submit-invitation-btn"
                    >
                      Request Invitation & Admission
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. Closing Section */}
      <section className="py-24 md:py-32 bg-stone-100/30 dark:bg-stone-950/50 border-t border-stone-200/5 dark:border-stone-850">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-8">
          <div className="relative w-8 h-8 rounded-full border border-amber-800/30 dark:border-amber-400/30 flex items-center justify-center mx-auto mb-8 text-amber-800 dark:text-amber-500">
            <Heart className="w-4 h-4 fill-current stroke-none" />
          </div>
          <h3 className="text-3xl md:text-4xl font-display font-extralight tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
            “Beyond metrics, valuation, and scale — founders are still human beings.”
          </h3>
          <p className="text-xs font-mono text-stone-400 dark:text-stone-500 mt-6 tracking-widest uppercase">
            Let's keep the human being behind the metrics whole.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-stone-200/10 dark:border-stone-900/60 bg-stone-950 text-stone-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-white tracking-widest text-sm uppercase">Founder-Being</span>
          </div>

          <div className="text-center md:text-right md:leading-relaxed">
            <p className="text-stone-200 uppercase tracking-widest text-[10px]">DUBAI . MIDDLE EAST . INDIA . SOUTH EAST ASIA</p>
            <p className="text-[10px] text-stone-500">Conversations Beyond Startup Pressure</p>
          </div>

          <p className="text-[10px] text-stone-550">
            © 2026 Founder-Being. Built with calm intentions for tech ecosystem pioneers.
          </p>
        </div>
      </footer>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.98, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 15 }}
              className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* RSVP Form Modal */}
              {activeModal === 'rsvp' && (
                <div>
                  {rsvpSubmitted ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4 text-emerald-800 dark:text-emerald-400">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-display text-stone-900 dark:text-stone-100">RSVP Confirmed</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-mono">
                        You have reserved a chair for May 30 Sunset gathering. Check your inbox for confirmation.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-display font-light text-stone-900 dark:text-stone-100">
                        RSVP: Sunset Gathering Cycle
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-mono">
                        Saturday Sunset, 30 May 2026 • Live Circle
                      </p>

                      <form onSubmit={handleRsvpSubmit} className="space-y-4 mt-6">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-550 dark:text-stone-450 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={rsvpForm.name}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-850 text-sm focus:outline-none focus:border-stone-400"
                            placeholder="Jimmy"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-550 dark:text-stone-450 mb-1">
                            Your Email
                          </label>
                          <input
                            type="email"
                            required
                            value={rsvpForm.email}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-850 text-sm focus:outline-none focus:border-stone-400"
                            placeholder="you@startup.com"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-550 dark:text-stone-450 mb-1">
                            Dietary / Special Needs (Optional)
                          </label>
                          <input
                            type="text"
                            value={rsvpForm.dietaryNote}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, dietaryNote: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-850 text-sm focus:outline-none focus:border-stone-400"
                            placeholder="e.g. Ayurvedic tea preference, vegetarian"
                          />
                        </div>

                        <div className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            id="plusOne"
                            checked={rsvpForm.bringingPlusOne}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, bringingPlusOne: e.target.checked })}
                            className="rounded border-stone-200 dark:border-stone-850 text-amber-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="plusOne" className="text-[11px] font-mono text-stone-550 dark:text-stone-400 cursor-pointer select-none">
                            Bringing founder co-founder (+1 chair request)
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 mt-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono uppercase rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                          id="submit-rsvp-btn"
                        >
                          Confirm RSVP Chair
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Waitlist Form Modal */}
              {activeModal === 'waitlist' && (
                <div>
                  {waitlistSubmitted ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4 text-emerald-800 dark:text-emerald-400">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-display text-stone-900 dark:text-stone-100">Waitlist Registered</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-mono">
                        We have logged your request. If a chair becomes free due to exit shifts, we will alert you instantly.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-display font-light text-stone-900 dark:text-stone-100">
                        Request Gathering Waitlist
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-mono">
                        Our sunset tables host precisely 12 builders.
                      </p>

                      <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-6">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-550 dark:text-stone-450 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={waitlistForm.name}
                            onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-850 text-sm focus:outline-none"
                            placeholder="Jimmy James"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-550 dark:text-stone-450 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={waitlistForm.email}
                            onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-850 text-sm focus:outline-none"
                            placeholder="jimmy@startup.com"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-550 dark:text-stone-450 mb-1">
                            Brief note (Why is checking-in important to you today?)
                          </label>
                          <textarea
                            required
                            value={waitlistForm.reason}
                            onChange={(e) => setWaitlistForm({ ...waitlistForm, reason: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-850 text-xs min-h-[80px] focus:outline-none resize-none"
                            placeholder="Trying to balance fundraising burnout under our regional circles."
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 mt-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono uppercase rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          Request Priority Alert
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
