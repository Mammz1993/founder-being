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
  ExternalLink,
  Settings,
  Database,
  Mail,
  RefreshCw,
  LogOut,
  Sliders,
  Send
} from 'lucide-react';
import { User } from 'firebase/auth';
import AmbientSound from './components/AmbientSound';
import MoonPhase from './components/MoonPhase';
import InteractiveJournal from './components/InteractiveJournal';
import { downloadICS } from './components/CalendarHelper';
import { InvitationRequest, RsvpRequest, WaitlistRequest } from './types';
import EcosystemStrip from './components/EcosystemStrip';
import moonlightStillnessImg from './assets/images/moonlight_stillness_1779712126776.png';
import fullMoonGatheringImg from './assets/images/full_moon_gathering_1779712149554.png';

// Google / Sheets Integrations Helper
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  createSyncSpreadsheet,
  appendSubmissionToSheet,
  sendEmailNotification,
  sendSlackNotification
} from './lib/googleApi';


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

  // Integrations States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(localStorage.getItem('google_spreadsheet_id') || '');
  const [slackWebhook, setSlackWebhook] = useState<string>(localStorage.getItem('google_slack_webhook') || '');
  const [gmailRecipient, setGmailRecipient] = useState<string>(localStorage.getItem('google_gmail_recipient') || 'jithinmammen1@gmail.com');
  const [isGmailEnabled, setIsGmailEnabled] = useState<boolean>(localStorage.getItem('google_gmail_enabled') !== 'false');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('is_admin_unlocked') === 'true';
  });
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminPasscodeError, setAdminPasscodeError] = useState<string>('');

  const isQueryParamsAdmin = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('admin') === 'true';
  const shouldShowGear = isQueryParamsAdmin || isAdminUnlocked || (googleUser?.email === 'jithinmammen1@gmail.com');

  const handlePasscodeSubmit = () => {
    if (adminPasscodeInput === 'beingcalm') {
      localStorage.setItem('is_admin_unlocked', 'true');
      setIsAdminUnlocked(true);
      setAdminPasscodeError('');
    } else {
      setAdminPasscodeError('Invalid passcode. Access denied.');
    }
  };
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string, type: 'info' | 'success' | 'error' | null }>({ text: '', type: null });

  // Monitor Scroll for Glassmorphic Header transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync dark class on document element so Tailwind dark: selectors work seamlessly
  useEffect(() => {
    if (theme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initialize Auth listeners
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // General Integration Orchestrator
  const triggerSyncAndAlerts = async (
    type: 'RSVP' | 'Waitlist' | 'Invitation',
    name: string,
    email: string,
    meta1: string,
    meta2: string,
    details: string
  ) => {
    const token = googleToken || getAccessToken();

    // 1. Google Sheets Sync
    if (token && spreadsheetId) {
      try {
        await appendSubmissionToSheet(token, spreadsheetId, {
          type,
          name,
          email,
          meta1: meta1 || 'N/A',
          meta2: meta2 || 'N/A',
          details: details || 'N/A'
        });
        console.log('Successfully synced to Google Sheets row.');
      } catch (err: any) {
        console.error('Sheets Sync Error:', err);
      }
    } else {
      console.log('Sheets Sync skipped: missing active session or spreadsheet ID.');
    }

    // 2. Gmail Alert Notification
    if (token && isGmailEnabled) {
      // Send welcome confirmation directly to the subscriber
      try {
        const welcomeSubject = "You’re Early — Intentionally.";
        const welcomeBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 30px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #faf9f6; color: #1c1917; line-height: 1.7; font-weight: 300;">
            <p style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; text-transform: uppercase; color: #b45309; margin: 0 0 24px 0; text-align: center;">Founder-Being</p>
            
            <h2 style="color: #1c1917; font-family: Georgia, serif; font-size: 22px; font-weight: 300; margin: 0 0 24px 0; line-height: 1.4; text-align: center; border-bottom: 1px solid #e7e5e4; padding-bottom: 20px;">
              You’re Early — Intentionally.
            </h2>
            
            <div style="font-size: 14px; color: #44403c;">
              <p style="margin-bottom: 18px; font-weight: 400;">Thank you for joining the Founder-Being waiting list.</p>
              
              <p style="margin-bottom: 18px;">We’re building a quieter space for founders navigating pressure, burnout, and the emotional weight behind ambition. A global gathering rooted in stillness, clarity, and conscious leadership.</p>
              
              <p style="margin-bottom: 24px;">You’ll be among the first to receive updates, early invitations, and access as we begin assembling across Dubai, the Middle East, India, and Southeast Asia.</p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e7e5e4; text-align: center;">
              <span style="font-size: 10px; font-family: monospace; color: #78716c; letter-spacing: 0.1em; text-transform: uppercase;">Dubai . Middle East . India . South East Asia</span>
              <p style="font-size: 11px; color: #a8a29e; margin: 8px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
                Conversations Beyond Startup Pressure
              </p>
            </div>
          </div>
        `;
        await sendEmailNotification(token, email, welcomeSubject, welcomeBody);
        console.log('Sent welcome confirmation email to subscriber.');
      } catch (err: any) {
        console.error('Welcome Email Error:', err);
      }

      // Send signup notification to the host admin
      if (gmailRecipient) {
        try {
          const alertSubject = `✦ Founder-Being: New ${type} Sign-up (${name})`;
          const alertBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e7e5e4; border-radius: 12px; background-color: #fafaf9; color: #1c1917;">
              <p style="font-size: 10px; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; color: #78716c; margin: 0 0 8px 0;">Host Notification Alert</p>
              <h2 style="color: #78350f; font-family: 'Times New Roman', serif; font-size: 20px; font-weight: 300; margin: 0 0 16px 0; border-bottom: 1px solid #e7e5e4; padding-bottom: 12px;">
                New ${type} Submission
              </h2>
              <p style="font-size: 13px; line-height: 1.6; color: #44403c;">A visitor has signed up on Founder-Being and a confirmation email has been dispatched to them.</p>
              <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e7e5e4; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="padding: 6px 0; color: #78716c; width: 140px; font-family: monospace; font-size: 10px; text-transform: uppercase;">Name</td>
                    <td style="padding: 6px 0; color: #1c1917; font-weight: 500;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #78716c; font-family: monospace; font-size: 10px; text-transform: uppercase;">Email</td>
                    <td style="padding: 6px 0; color: #1c1917; font-weight: 500;"><a href="mailto:${email}" style="color: #b45309; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #78716c; font-family: monospace; font-size: 10px; text-transform: uppercase;">Company / Role</td>
                    <td style="padding: 6px 0; color: #1c1917;">${meta1}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #78716c; font-family: monospace; font-size: 10px; text-transform: uppercase;">Detail / Meta</td>
                    <td style="padding: 6px 0; color: #1c1917;">${meta2}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 6px 0; color: #78716c; font-family: monospace; font-size: 10px; text-transform: uppercase; vertical-align: top;">Notes</td>
                    <td style="padding: 12px 0 6px 0; color: #44403c; font-style: italic; line-height: 1.5;">"${details}"</td>
                  </tr>
                </table>
              </div>
            </div>
          `;
          await sendEmailNotification(token, gmailRecipient, alertSubject, alertBody);
          console.log('Host registration notification sent successfully.');
        } catch (err: any) {
          console.error('Host Notification Email Error:', err);
        }
      }
    }

    // 3. Slack Notification Channel
    if (slackWebhook) {
      try {
        const message = `✦ *New ${type} Submission on Founder-Being*\n*Name:* ${name}\n*Email:* ${email}\n*Company/Stage:* ${meta1}\n*Details/Diet:* ${meta2}\n*Message/Challenges:* _"${details}"_\n_Logged at: ${new Date().toLocaleString()}_`;
        await sendSlackNotification(slackWebhook, message);
        console.log('Slack Notification dispatched.');
      } catch (err: any) {
        console.error('Slack Notification Error:', err);
      }
    }
  };

  const handleInvitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationForm.name || !invitationForm.email) return;
    setInvitationSubmitted(true);
    // Persist locally
    const members = JSON.parse(localStorage.getItem('founder_members') || '[]');
    localStorage.setItem('founder_members', JSON.stringify([...members, invitationForm]));

    // Trigger workspace integrations (Sheets sync + slack alerts)
    triggerSyncAndAlerts(
      'Invitation',
      invitationForm.name,
      invitationForm.email,
      invitationForm.company,
      invitationForm.stage,
      invitationForm.challenges
    );
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpForm.name || !rsvpForm.email) return;
    setRsvpSubmitted(true);
    // Persist RSVP locally
    const rsvps = JSON.parse(localStorage.getItem('founder_rsvps') || '[]');
    localStorage.setItem('founder_rsvps', JSON.stringify([...rsvps, { ...rsvpForm, submittedAt: new Date().toISOString() }]));
    
    // Trigger workspace integrations (Sheets sync + slack alerts)
    triggerSyncAndAlerts(
      'RSVP',
      rsvpForm.name,
      rsvpForm.email,
      'Full Moon Kochi Meeting',
      rsvpForm.bringingPlusOne ? 'Bringing co-founder co-host (+1)' : 'Single Seat',
      rsvpForm.dietaryNote || 'No special dietary preference'
    );

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
    // Persist waitlist locally
    const waitlist = JSON.parse(localStorage.getItem('founder_waitlist') || '[]');
    localStorage.setItem('founder_waitlist', JSON.stringify([...waitlist, { ...waitlistForm, submittedAt: new Date().toISOString() }]));

    // Trigger workspace integrations (Sheets sync + slack alerts)
    triggerSyncAndAlerts(
      'Waitlist',
      waitlistForm.name,
      waitlistForm.email,
      'Full Moon Waiting List',
      'Pending placement',
      waitlistForm.reason
    );

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
    <div className={`min-h-screen transition-colors duration-[1500ms] font-sans antialiased relative overflow-x-hidden ${theme === 'midnight' ? 'dark text-[#F3F1EA]' : 'text-stone-900'} bg-app-bg selection:bg-stone-200 dark:selection:bg-stone-800`}>
      
      {/* 🌌 Dynamic Ambient Breathing & Mineral Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Moonlit Glow (Muted Moon Blue) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[65vh] bg-[radial-gradient(circle_at_top,rgba(124,141,181,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(124,141,181,0.12),transparent_60%)] mix-blend-screen opacity-70 animate-pulse duration-[8000ms]" />
        
        {/* Bottom Volcanic/Warm Amber Glow */}
        <div className="absolute bottom-0 left-1/3 w-[80vw] h-[55vh] bg-[radial-gradient(circle_at_bottom,rgba(214,162,94,0.04),transparent_65%)] dark:bg-[radial-gradient(circle_at_bottom,rgba(214,162,94,0.08),transparent_55%)] mix-blend-screen opacity-60" />
      </div>

      {/* Floating Header */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 border-b ${
        scrolled 
          ? 'py-3 backdrop-blur-xl bg-app-bg/80 border-app-border/40 shadow-sm' 
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

            {/* Integrations Console toggle */}
            {shouldShowGear && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-full hover:bg-stone-200/30 dark:hover:bg-white/5 transition-all text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                title="API Integration Sync Console"
                id="integrations-toggle-btn"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">
        {/* Atmospheric Background with parallax asset */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'midnight' ? 'from-stone-950/20 via-stone-950/40 to-stone-950/100' : 'from-[#FAF7F2]/10 via-[#FAF7F2]/45 to-app-bg'} z-10 pointer-events-none`} />
          <img
            src={moonlightStillnessImg}
            alt="Moonlight stillness reflecting on deep ocean"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-all duration-[12000ms] transform scale-105 hover:scale-100 select-none ${theme === 'midnight' ? 'brightness-[0.25] saturate-[0.8]' : 'brightness-[0.85] contrast-[1.05] grayscale-[15%] opacity-90'}`}
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
            <span className={`px-3.5 py-1 rounded-full border backdrop-blur-md text-[10px] font-mono tracking-[0.3em] uppercase ${theme === 'midnight' ? 'border-stone-200/20 bg-stone-950/60 text-stone-300' : 'border-stone-900/10 bg-white/60 text-stone-850'}`}>
              Conversations Beyond Startup Pressure
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-display font-light tracking-tight leading-[1.12] ${theme === 'midnight' ? 'text-stone-100' : 'text-stone-900'}`}
            id="hero-headline"
          >
            “Building companies shouldn’t cost founders their peace.”
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className={`text-sm sm:text-base md:text-lg font-sans font-light mt-6 max-w-2xl leading-relaxed ${theme === 'midnight' ? 'text-stone-300' : 'text-stone-700'}`}
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
              className={`w-full sm:w-auto px-8 py-3.5 text-xs font-mono uppercase tracking-wider rounded-lg border font-medium transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer ${theme === 'midnight' ? 'bg-stone-100 hover:bg-white text-stone-950 border-stone-100' : 'bg-stone-900 hover:bg-stone-950 text-stone-50 border-stone-900'}`}
            >
              <span>Join Community</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="https://luma.com/dxkle2ds"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto px-8 py-3.5 text-xs font-mono uppercase tracking-wider rounded-lg backdrop-blur-md border font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${theme === 'midnight' ? 'bg-stone-950/60 text-stone-100 border-stone-100/30 hover:bg-stone-900/60 hover:border-stone-100/60' : 'bg-white/40 text-stone-800 border-stone-300 hover:bg-white/60 hover:border-stone-400'}`}
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
      <section id="gathering" className="py-24 md:py-32 px-4 md:px-8 border-t border-stone-200 dark:border-stone-800/60">
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
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200/50 dark:border-stone-800/50 relative flex flex-col justify-end min-h-[340px] lg:min-h-auto">
              <img
                src={fullMoonGatheringImg}
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
            <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-800/40 bg-white/60 dark:bg-stone-900/10 backdrop-blur-md">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-semibold text-app-primary">
                    Founder-Being — Full Moon Founder Gathering
                  </h3>
                  <p className="text-xs md:text-sm text-app-primary mt-2 font-mono font-semibold">
                    An intimate meeting setup built for deep restoration, clear-mindedness, and emotional balance under the moon.
                  </p>
                </div>

                <hr className="border-stone-250 dark:border-stone-800/40" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-900 dark:text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-mono text-app-primary uppercase tracking-wider font-bold">
                        Location / Port
                      </h4>
                      <p className="text-xs font-bold text-app-primary mt-0.5">
                        Pandal, Fort Kochi
                      </p>
                      <p className="text-[10px] text-app-secondary mt-0.5 font-medium">
                        Kochi, Kerala
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-900 dark:text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-mono text-app-primary uppercase tracking-wider font-bold">
                        Date
                      </h4>
                      <p className="text-xs font-bold text-app-primary mt-0.5">
                        30 May 2026
                      </p>
                      <p className="text-[10px] text-app-secondary mt-0.5 font-medium">
                        Saturday Sunset
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-900 dark:text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-mono text-app-primary uppercase tracking-wider font-bold">
                        Time
                      </h4>
                      <p className="text-xs font-bold text-app-primary mt-0.5">
                        18:30 - 21:30
                      </p>
                      <p className="text-[10px] text-app-secondary mt-0.5 font-medium">
                        Kochi Sunset Cycle
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-app-primary leading-relaxed font-normal text-xs md:text-sm font-sans">
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

                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-stone-200/20 dark:border-stone-800/30 text-center text-[10px] font-mono text-stone-800 dark:text-stone-350 font-normal">
                  <div className="py-1 px-2 rounded bg-stone-100/70 dark:bg-stone-900/50">Not a pitch event.</div>
                  <div className="py-1 px-2 rounded bg-stone-100/70 dark:bg-stone-900/50">Not a panel discussion.</div>
                  <div className="py-1 px-2 rounded bg-stone-100/70 dark:bg-stone-900/50">Not a productivity workshop.</div>
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
                  className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider rounded-md bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 cursor-pointer transition-all flex items-center gap-2"
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
      <section id="about" className="hidden lg:block py-24 md:py-32 px-4 md:px-8 bg-stone-50/40 dark:bg-stone-950/10 transition-colors duration-[1500ms]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
            {/* Context Left Column */}
            <div className="lg:col-span-5">
              <span className="text-[10px] font-mono tracking-[0.25em] text-stone-700 dark:text-stone-350 uppercase block mb-3 font-medium">
                Intentional Separation
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-normal tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
                Not a startup hub.
                <span className="block mt-1 font-sans italic font-normal text-stone-750 dark:text-stone-400 opacity-90">Not a networking club.</span>
              </h2>
              <div className="mt-8 p-6 rounded-xl bg-amber-500/5 border-l-2 border-amber-800 dark:border-amber-500/80">
                <p className="text-sm text-stone-900 dark:text-stone-200 font-normal leading-relaxed">
                  <strong>Founder-Being</strong> exists to restore the human balance behind ambitious founders.
                </p>
              </div>
            </div>

            {/* Informational Right Narrative */}
            <div className="lg:col-span-7 space-y-6 text-sm sm:text-base leading-relaxed text-stone-950 dark:text-stone-200 font-normal">
              <p>
                Modern startup culture rewards constant output — metrics, fundraising, scaling, hiring, pressure. Founders are expected to operate like machines while carrying invisible emotional weight.
              </p>
              
              <p className="font-sans font-medium border-l border-stone-300 dark:border-stone-800 pl-5 text-stone-950 dark:text-stone-100">
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
                  { term: "Fundraising pressure", d: "The silent anxiety of board metrics, valuations, and runway pressure." },
                  { term: "Scaling fatigue", d: "The intense friction of managing expanding team structures." },
                  { term: "Leadership loneliness", d: "Carrying high stake responsibilities in absolute isolation." },
                  { term: "Nervous system overload", d: "Chronic fight-or-flight responses from non-stop digital demands." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-start gap-2.5">
                    <span className="text-amber-800 dark:text-amber-500 mt-1">✦</span>
                    <div>
                      <span className="text-xs font-mono text-stone-950 dark:text-stone-100 block font-semibold uppercase tracking-wide">
                        {item.term}
                      </span>
                      <span className="text-[11.5px] text-stone-750 dark:text-stone-350 leading-snug block mt-0.5 font-normal">
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
      <section id="reflections" className="hidden lg:block py-24 md:py-32 px-4 md:px-8 bg-stone-50/40 dark:bg-stone-950/20 border-t border-b border-stone-200/15 dark:border-stone-800">
        <div className="max-w-6xl mx-auto">
          <InteractiveJournal />
        </div>
      </section>

      {/* 6. Founder Stages Section */}
      <section id="stages" className="hidden lg:block py-24 md:py-32 px-4 md:px-8 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-mono tracking-[0.25em] text-app-accent uppercase font-bold">
              Cohort Structuring
            </span>
            <span className="block text-2xl md:text-3.5xl font-display font-medium text-app-primary mt-2">
              Spaces Designed for Your Journey
            </span>
            <p className="text-xs text-app-secondary font-semibold mt-2 max-w-sm mx-auto">
              We group dialogues carefully so you collaborate only with founders facing identical thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stageCards.map((card, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl border border-stone-300 dark:border-stone-800/40 bg-stone-100/50 dark:bg-stone-900/10 hover:bg-stone-100 dark:hover:bg-stone-950/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xs font-mono tracking-widest text-[#8A4C10] dark:text-[#D6A25E] uppercase font-bold">
                    {card.stage}
                  </h3>
                  <p className="font-display italic font-medium text-lg text-app-primary mt-4 leading-snug">
                    {card.quote}
                  </p>
                </div>
                <p className="text-xs text-app-secondary mt-6 leading-relaxed font-normal">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Affiliations / Ecosystem Section */}
      <div className="hidden lg:block">
        <EcosystemStrip />
      </div>

      {/* 4. Shorter Text Columns - Mobile / Smaller Screens Only */}
      <section className="block lg:hidden py-16 px-4 md:px-8 border-t border-stone-200 dark:border-stone-800 bg-stone-50/20 dark:bg-stone-950/20">
        <div className="max-w-xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center">
            <span className="text-[9px] font-mono tracking-[0.25em] text-amber-800 dark:text-amber-500 uppercase block mb-2">
              Core Pillars
            </span>
            <h2 className="text-2xl font-display font-light text-stone-900 dark:text-stone-100 select-none">
              The Stillness Philosophy
            </h2>
          </div>

          <div className="space-y-10">
            {/* Pillar 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-800 dark:text-amber-500 font-mono text-[10px]">01 //</span>
                <h3 className="text-xs font-mono tracking-wider uppercase font-medium text-stone-900 dark:text-stone-100">
                  The Weight of Ambition
                </h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                Building companies shouldn't cost founders their peace. Modern startup culture demands infinite metrics and public performance, leaving little room for the human operating the machine. We gather to carry the weight together, in absolute confidence.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-800 dark:text-amber-500 font-mono text-[10px]">02 //</span>
                <h3 className="text-xs font-mono tracking-wider uppercase font-medium text-stone-900 dark:text-stone-100">
                  Sacred Silence
                </h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                No boardroom slides, no investor pitches, no networking pressure. Founder-Being provides silent reflection groups and guided wellbeing cycles designed for nervous system restoration and authentic peer clarity.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-800 dark:text-amber-500 font-mono text-[10px]">03 //</span>
                <h3 className="text-xs font-mono tracking-wider uppercase font-medium text-stone-900 dark:text-stone-100">
                  Intentional Assembly
                </h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                Rooted across Dubai, the Middle East, India, and Southeast Asia. We carefully curate small cohorts of active tech pioneers who share identical thresholds of scale, pressure, and responsibility.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                <p className="text-xs md:text-sm text-stone-700 dark:text-stone-300 mt-3 font-mono leading-relaxed max-w-sm mx-auto font-normal">
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
                  <span className="text-[10px] font-mono tracking-[0.25em] text-app-accent uppercase block mb-2 font-bold">
                    Request Admission
                  </span>
                  <h2 className="text-3xl font-display font-light text-stone-900 dark:text-stone-100">
                    Request an Invitation
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-normal mt-2 max-w-md mx-auto">
                    To maintain strict confidentiality and a high resonance environment, entry is review-based and structured for active tech operators.
                  </p>
                </div>

                <form onSubmit={handleInvitationSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-app-primary mb-1.5 font-bold">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={invitationForm.name}
                        onChange={(e) => setInvitationForm({ ...invitationForm, name: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-800 focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 transition-all text-sm text-app-primary placeholder-stone-500/75 dark:placeholder-stone-400"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-app-primary mb-1.5 font-bold">
                        Email (Confidential)
                      </label>
                      <input
                        type="email"
                        required
                        value={invitationForm.email}
                        onChange={(e) => setInvitationForm({ ...invitationForm, email: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-800 focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 transition-all text-sm text-app-primary placeholder-stone-500/75 dark:placeholder-stone-400"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-app-primary mb-1.5 font-bold">
                        Startup / Company
                      </label>
                      <input
                        type="text"
                        required
                        value={invitationForm.company}
                        onChange={(e) => setInvitationForm({ ...invitationForm, company: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-800 focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 transition-all text-sm text-app-primary placeholder-stone-500/75 dark:placeholder-stone-400"
                        placeholder="Inc. / Labs / Technologies"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-app-primary mb-1.5 font-bold">
                        Founder Stage
                      </label>
                      <select
                        value={invitationForm.stage}
                        onChange={(e) => setInvitationForm({ ...invitationForm, stage: e.target.value })}
                        className="w-full bg-white dark:bg-stone-950 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-800 focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 transition-all text-sm text-app-primary"
                      >
                        <option value="Early Stage" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">Early Stage (Pre-seed / Seed)</option>
                        <option value="Scaling Founder" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">Scaling (Series A / B)</option>
                        <option value="Mature Operator" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">Mature (Series C+ / Exit)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-app-primary mb-1.5 font-bold">
                      What are you currently navigating or seeking from the cycle?
                    </label>
                    <textarea
                      required
                      value={invitationForm.challenges}
                      onChange={(e) => setInvitationForm({ ...invitationForm, challenges: e.target.value })}
                      className="w-full bg-white dark:bg-stone-950 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-800 focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 transition-all text-sm text-app-primary placeholder-stone-500/75 dark:placeholder-stone-400 min-h-[100px] resize-none"
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
      <section className="hidden lg:block py-24 md:py-32 bg-stone-100/30 dark:bg-stone-950/50 border-t border-stone-200 dark:border-stone-800">
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
      <footer className="py-12 px-4 md:px-8 border-t border-stone-200 dark:border-stone-900/60 bg-stone-100/50 dark:bg-stone-950 text-stone-600 dark:text-stone-400 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-stone-900 dark:text-white tracking-widest text-sm uppercase">Founder-Being</span>
          </div>

          <div className="text-center md:text-right md:leading-relaxed">
            <p className="text-stone-800 dark:text-stone-200 uppercase tracking-widest text-[10px]">DUBAI . MIDDLE EAST . INDIA . SOUTH EAST ASIA</p>
            <p className="text-[10px] text-stone-500">Conversations Beyond Startup Pressure</p>
          </div>

          <p className="text-[10px] text-stone-500 dark:text-stone-500">
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
                          <label className="block text-[10px] font-mono uppercase text-stone-600 dark:text-stone-400 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={rsvpForm.name}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-400 text-stone-900 dark:text-stone-100"
                            placeholder="Jimmy"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 dark:text-stone-400 mb-1">
                            Your Email
                          </label>
                          <input
                            type="email"
                            required
                            value={rsvpForm.email}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-400 text-stone-900 dark:text-stone-100"
                            placeholder="you@startup.com"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 dark:text-stone-400 mb-1">
                            Dietary / Special Needs (Optional)
                          </label>
                          <input
                            type="text"
                            value={rsvpForm.dietaryNote}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, dietaryNote: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:border-stone-400 text-stone-900 dark:text-stone-100"
                            placeholder="e.g. Ayurvedic tea preference, vegetarian"
                          />
                        </div>

                        <div className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            id="plusOne"
                            checked={rsvpForm.bringingPlusOne}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, bringingPlusOne: e.target.checked })}
                            className="rounded border-stone-200 dark:border-stone-800 text-amber-800 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="plusOne" className="text-[11px] font-mono text-stone-600 dark:text-stone-400 cursor-pointer select-none">
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
                          <label className="block text-[10px] font-mono uppercase text-stone-600 dark:text-stone-400 mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            required
                            value={waitlistForm.name}
                            onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-sm focus:outline-none text-stone-900 dark:text-stone-100"
                            placeholder="Jimmy James"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 dark:text-stone-400 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={waitlistForm.email}
                            onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-sm focus:outline-none text-stone-900 dark:text-stone-100"
                            placeholder="jimmy@startup.com"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-stone-600 dark:text-stone-400 mb-1">
                            Brief note (Why is checking-in important to you today?)
                          </label>
                          <textarea
                            required
                            value={waitlistForm.reason}
                            onChange={(e) => setWaitlistForm({ ...waitlistForm, reason: e.target.value })}
                            className="w-full bg-stone-50 dark:bg-stone-950/80 px-3.5 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs min-h-[80px] focus:outline-none resize-none text-stone-900 dark:text-stone-100"
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

        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.98, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 15 }}
              className="w-full max-w-lg p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-2xl shadow-xl overflow-hidden relative font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-stone-200 dark:border-stone-800 pb-3">
                <Settings className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                <div>
                  <h4 className="text-lg font-display font-medium text-stone-950 dark:text-white">
                    Integration & Sync Controls
                  </h4>
                  <p className="text-[10px] text-stone-800 dark:text-stone-450 font-mono font-semibold">
                    Google Sheets OAuth Sync & Email / Slack Alerts
                  </p>
                </div>
              </div>

              {!(isAdminUnlocked || (googleUser?.email === 'jithinmammen1@gmail.com')) ? (
                <div className="py-6 space-y-4">
                  <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900/45 bg-amber-100/40 dark:bg-amber-950/10 text-stone-900 dark:text-stone-300">
                    <p className="text-xs font-normal leading-relaxed">
                      This console handles sensitive third-party APIs (Google Sheets Sync, Slack alerts, and Gmail dispatches). Access is restricted to authorized ecosystem admins.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-950 dark:text-stone-300 font-bold">
                      Enter Admin Passcode
                    </label>
                    <input
                      type="password"
                      value={adminPasscodeInput}
                      onChange={(e) => {
                        setAdminPasscodeInput(e.target.value);
                        setAdminPasscodeError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePasscodeSubmit();
                        }
                      }}
                      className="w-full bg-stone-50 dark:bg-stone-950 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                      placeholder="••••••••"
                    />
                    {adminPasscodeError && (
                      <p className="text-[10px] font-mono text-rose-600 dark:text-rose-400">{adminPasscodeError}</p>
                    )}
                  </div>
                  <button
                    onClick={handlePasscodeSubmit}
                    className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
                  >
                    Authorize Session
                  </button>
                </div>
              ) : (
                <>
                  {/* Sync Status Messaging banner */}
                  {syncStatusMsg.text && (
                    <div className={`mb-4 p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                      syncStatusMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' :
                      syncStatusMsg.type === 'error' ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300' :
                      'bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      {syncStatusMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{syncStatusMsg.text}</span>
                    </div>
                  )}

              <div className="space-y-5 overflow-y-auto max-h-[70vh] pr-1">
                {/* 1. Google OAuth connection */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37] dark:text-amber-500 uppercase font-bold">1. Google Authentication (OAuth)</span>
                  {googleUser ? (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-stone-950 dark:text-white">{googleUser.displayName || 'Authorized Host'}</p>
                        <p className="text-[10px] text-stone-900 dark:text-stone-300 font-mono font-semibold">{googleUser.email}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await logout();
                            setGoogleUser(null);
                            setGoogleToken(null);
                            setSyncStatusMsg({ text: 'Signed out of Google account.', type: 'info' });
                          } catch (err: any) {
                            setSyncStatusMsg({ text: err.message, type: 'error' });
                          }
                        }}
                        className="px-3 py-1.5 rounded bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-[10px] font-mono text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-800 shadow-sm font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-[11px] text-stone-900 dark:text-stone-300 leading-relaxed mb-3 font-normal">
                        Connect your Google account to grant permission for editing Google Sheets and sending email notifications directly from this interface.
                      </p>
                      <button
                        onClick={async () => {
                          setSyncStatusMsg({ text: 'Interfacing with Google Auth popup...', type: 'info' });
                          try {
                            const res = await googleSignIn();
                            if (res) {
                              setGoogleUser(res.user);
                              setGoogleToken(res.accessToken);
                              setSyncStatusMsg({ text: `Authenticated successfully as ${res.user.email}!`, type: 'success' });
                            }
                          } catch (err: any) {
                            setSyncStatusMsg({ text: `Google Auth popup was ignored or failed to load. Try again!`, type: 'error' });
                          }
                        }}
                        className="w-full py-2 bg-stone-100 hover:bg-white text-stone-950 text-xs font-mono font-medium rounded-lg flex items-center justify-center gap-2 border border-stone-200/60 dark:border-transparent transition-all cursor-pointer shadow-sm animate-fade-in"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </svg>
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Google Sheets Configuration */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono tracking-widest text-[#d4af37] dark:text-amber-500 uppercase font-bold">2. Google Sheets sync</span>
                    {googleToken && (
                      <button
                        onClick={async () => {
                          setSyncStatusMsg({ text: 'Creating spreadsheet in your Google Drive...', type: 'info' });
                          try {
                            const newId = await createSyncSpreadsheet(googleToken);
                            setSpreadsheetId(newId);
                            localStorage.setItem('google_spreadsheet_id', newId);
                            setSyncStatusMsg({ text: 'Spreadsheet successfully generated and connected! Headers setup.', type: 'success' });
                          } catch (err: any) {
                            setSyncStatusMsg({ text: err.message, type: 'error' });
                          }
                        }}
                        className="px-2 py-1 rounded bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/20 text-amber-900 dark:text-[#d4af37] text-[9.5px] font-mono transition-all flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Database className="w-3 h-3" />
                        <span>Create Sheet</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-stone-950 dark:text-stone-300 mb-1 font-bold">
                        Spreadsheet ID or full URL
                      </label>
                      <input
                        type="text"
                        value={spreadsheetId}
                        onChange={(e) => {
                          let value = e.target.value.trim();
                          // Support copy pasting full Google sheets URL
                          const match = value.match(/\/d\/([a-zA-Z0-9-_]+)/);
                          if (match) value = match[1];
                          setSpreadsheetId(value);
                          localStorage.setItem('google_spreadsheet_id', value);
                        }}
                        className="w-full bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                        placeholder="e.g. 1aBC-dEFg-HiJk-LmNoP..."
                      />
                    </div>
                    {spreadsheetId && (
                      <p className="text-[10px] text-stone-950 dark:text-stone-200 font-mono flex items-center gap-1 font-semibold">
                        <span>Connected. Open sheet: </span>
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-805 dark:text-amber-500 hover:underline inline-flex items-center gap-0.5 font-bold"
                        >
                          Google Sheets <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Notifications (Email & Slack) */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-4">
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37] dark:text-amber-500 uppercase font-bold">3. Real-time notifications</span>

                  {/* Gmail alerts toggle/recipient */}
                  <div className="pt-1 border-t border-stone-200 dark:border-stone-900">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono text-stone-800 dark:text-stone-300 flex items-center gap-1.5 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isGmailEnabled}
                          onChange={(e) => {
                            setIsGmailEnabled(e.target.checked);
                            localStorage.setItem('google_gmail_enabled', e.target.checked ? 'true' : 'false');
                          }}
                          className="rounded border-stone-300 bg-white dark:border-stone-800 bg-[#faf9f6] dark:bg-stone-900 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span>Enable instant Gmail notification alerts</span>
                      </label>
                    </div>

                    {isGmailEnabled && (
                      <div className="mt-2 pl-5">
                        <label className="block text-[9px] font-mono uppercase text-stone-950 mb-1 font-bold">
                          Notification Alert Recipient Address
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={gmailRecipient}
                            onChange={(e) => {
                              setGmailRecipient(e.target.value);
                              localStorage.setItem('google_gmail_recipient', e.target.value);
                            }}
                            className="w-full bg-white dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                            placeholder="you@company.com"
                          />
                          {googleToken && (
                            <button
                              onClick={async () => {
                                setSyncStatusMsg({ text: 'Sending manual test notification to recipient...', type: 'info' });
                                try {
                                  await sendEmailNotification(
                                    googleToken,
                                    gmailRecipient,
                                    '✦ Founder-Being: Core Workspace Integration Test',
                                    '<h3>Gmail Sync Operational</h3><p>Your Google Workspace Gmail webhook alerting is verified and fully functional for Founder-Being submissions.</p>'
                                  );
                                  setSyncStatusMsg({ text: 'Test email successfully routed to recipient inbox!', type: 'success' });
                                } catch (err: any) {
                                  setSyncStatusMsg({ text: err.message, type: 'error' });
                                }
                              }}
                              className="px-2.5 py-1.5 bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white text-[10px] font-mono cursor-pointer transition-all shrink-0 flex items-center gap-1 shadow-sm"
                              title="Send Test Email"
                            >
                              <Send className="w-3 h-3" />
                              <span>Test</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slack Alerts Webhook URL */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-900">
                    <label className="block text-xs font-mono text-stone-800 dark:text-stone-300 mb-1">
                      Slack Incoming Webhook URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={slackWebhook}
                        onChange={(e) => {
                          setSlackWebhook(e.target.value);
                          localStorage.setItem('google_slack_webhook', e.target.value);
                        }}
                        className="w-full bg-white dark:bg-stone-900 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                        placeholder="https://hooks.slack.com/services/T.../B.../..."
                      />
                      {slackWebhook && (
                        <button
                          onClick={async () => {
                            setSyncStatusMsg({ text: 'Firing test Slack message payload...', type: 'info' });
                            try {
                              await sendSlackNotification(
                                slackWebhook,
                                '✦ *Founder-Being Workspace Alert Test*\nIncoming webhooks integrations are functional!'
                              );
                              setSyncStatusMsg({ text: 'Test alert payload dispatched to Slack channel!', type: 'success' });
                            } catch (err: any) {
                              setSyncStatusMsg({ text: err.message, type: 'error' });
                            }
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 rounded border border-stone-200 dark:border-stone-800 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white text-[10px] font-mono cursor-pointer transition-all shrink-0 flex items-center gap-1 shadow-sm"
                          title="Test Slack Alert"
                        >
                          <Send className="w-3 h-3" />
                          <span>Test</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submissions Stats / Sync Queue */}
                <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-800 dark:text-stone-300 font-mono font-semibold">
                  <span>Sheet Connectivity:</span>
                  <span className={googleToken && spreadsheetId ? "text-emerald-600 dark:text-emerald-500 font-bold" : "text-amber-600 dark:text-amber-500 font-normal animate-pulse"}>
                    {googleToken && spreadsheetId ? "● Sync Enabled & Online" : "○ Disconnected (Local Queue)"}
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
