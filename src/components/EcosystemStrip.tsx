import React, { useState } from 'react';
import { Layers, Globe, Landmark, Zap, Sparkles, ChevronDown } from 'lucide-react';

interface Institution {
  name: string;
  category: string;
}

const institutions: Institution[] = [
  // Accelerators & Incubators
  { name: "Y Combinator", category: "Accelerators" },
  { name: "Techstars", category: "Accelerators" },
  { name: "Antler", category: "Accelerators" },
  { name: "Plug and Play", category: "Accelerators" },
  { name: "Founder Institute", category: "Accelerators" },
  { name: "Flat6Labs", category: "Accelerators" },
  { name: "In5 Dubai", category: "Accelerators" },
  { name: "Sheraa Sharjah", category: "Accelerators" },
  { name: "T-Hub Hyderabad", category: "Accelerators" },

  // Venture Funds & Angel Networks
  { name: "500 Global", category: "Capital Networks" },
  { name: "500 Sanabil", category: "Capital Networks" },
  { name: "Plus VC", category: "Capital Networks" },
  { name: "Sukna Ventures", category: "Capital Networks" },
  { name: "BECO Capital", category: "Capital Networks" },
  { name: "Wamda", category: "Capital Networks" },
  { name: "Dubai Future District Fund", category: "Capital Networks" },
  { name: "LetsVenture", category: "Capital Networks" },
  { name: "AngelList India", category: "Capital Networks" },
  { name: "India Angel Network", category: "Capital Networks" },

  // Ecosystem & Founder Support
  { name: "Kerala Startup Mission", category: "Ecosystem Hubs" },
  { name: "Startup India", category: "Ecosystem Hubs" },
  { name: "TiE Kerala", category: "Ecosystem Hubs" },
  { name: "TiE Dubai", category: "Ecosystem Hubs" },
  { name: "Nasscom 10,000 Startups", category: "Ecosystem Hubs" },
  { name: "Headstart Network", category: "Ecosystem Hubs" },
  { name: "Hub71 Abu Dhabi", category: "Ecosystem Hubs" },
  { name: "Dubai Startup Hub", category: "Ecosystem Hubs" },
  { name: "Nasscom DeepTech Club", category: "Ecosystem Hubs" },
  { name: "Endeavor", category: "Ecosystem Hubs" },

  // Technology Summits & Events
  { name: "Expand North Star", category: "Summits & Events" },
  { name: "GITEX Global", category: "Summits & Events" },
  { name: "GITEX Dubai", category: "Summits & Events" },
  { name: "GITEX Africa", category: "Summits & Events" },
  { name: "GITEX Europe", category: "Summits & Events" },
  { name: "Web Summit", category: "Summits & Events" },
  { name: "Slush", category: "Summits & Events" },
  { name: "Collision", category: "Summits & Events" },
  { name: "STEP Conference", category: "Summits & Events" },
  { name: "LEAP Saudi", category: "Summits & Events" }
];

const categories = [
  { id: "all", name: "All Networks", icon: Globe },
  { id: "Accelerators", name: "Accelerators & Incubators", icon: Zap },
  { id: "Capital Networks", name: "Venture Funds & Angels", icon: Landmark },
  { id: "Ecosystem Hubs", name: "Ecosystem & Support", icon: Layers },
  { id: "Summits & Events", name: "Summits & Assemblies", icon: Sparkles }
];

export default function EcosystemStrip() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isDirectoryExpanded, setIsDirectoryExpanded] = useState<boolean>(false);

  // Filtered institutions for the directory view
  const filteredInstitutions = activeTab === "all"
    ? institutions
    : institutions.filter(inst => inst.category === activeTab);

  // Double the list for seamless looping in the marquee tracker
  const marqueeList = [...institutions, ...institutions];

  return (
    <section id="ecosystem" className="py-24 px-4 md:px-8 border-y border-stone-200/50 dark:border-stone-900 bg-stone-100/50 dark:bg-stone-950/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Label & Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-[0.25em] text-app-accent uppercase block mb-3 font-bold">
            Regional Ecosystem & Founder Networks
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-app-primary tracking-tight">
            Ecosystem Exposure & Founder Networks
          </h2>
          <p className="text-xs md:text-sm text-app-secondary mt-4 leading-relaxed font-normal">
            Our community brings silent mental balance, clarity calibration, and human trust to builders carrying pressure across world-class startup launchpads, venture portfolios, and regional hubs.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-900/40 border border-stone-300 dark:border-stone-800/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-app-primary font-bold">
              DUBAI · MIDDLE EAST · INDIA · SOUTH EAST ASIA · GLOBAL PORTS
            </span>
          </div>
        </div>

        {/* Running Ticker (EcosystemStrip Marquee) */}
        <div className="relative w-full overflow-hidden py-8 border-y border-stone-300/40 dark:border-stone-800/30 bg-stone-50/20 dark:bg-stone-950/20">
          {/* Edge Fades for a gorgeous high-fidelity premium feel */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-stone-50 dark:from-stone-950/95 via-transparent to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-stone-50 dark:from-stone-950/95 via-transparent to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="animate-marquee flex items-center gap-8 md:gap-12 whitespace-nowrap">
            {marqueeList.map((inst, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-app-primary hover:text-app-accent transition-colors duration-300 select-none cursor-default group font-medium"
              >
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] font-medium">
                  {inst.name}
                </span>
                <span className="text-stone-400 dark:text-stone-600 font-mono text-xs text-amber-500/50 block group-hover:scale-110 transition-transform">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Categorized Directory */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setIsDirectoryExpanded(!isDirectoryExpanded)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-mono tracking-wider uppercase border border-stone-300 dark:border-stone-800 hover:bg-stone-200/50 dark:hover:bg-stone-900 text-app-primary font-bold transition-all cursor-pointer shadow-sm"
          >
            <span>{isDirectoryExpanded ? "Minimize Directory" : "Explore Categorized Directory (40+ Networks)"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDirectoryExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Directory Panel */}
        {isDirectoryExpanded && (
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/20 backdrop-blur-sm shadow-sm animate-fadeIn">
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 border-b border-stone-300/40 dark:border-stone-800/30 pb-6 mb-8">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                      isActive
                        ? "bg-stone-900 dark:bg-amber-500/10 text-white dark:text-amber-300 border-stone-900 dark:border-amber-500/30 shadow-sm font-bold"
                        : "bg-white dark:bg-stone-900/40 text-app-secondary border-stone-300 hover:border-stone-400 dark:hover:border-stone-700 font-bold"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Logos/Text Marks */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredInstitutions.map((inst, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-lg border border-stone-300 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/40 text-center hover:bg-stone-100 dark:hover:bg-stone-900/50 hover:border-app-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-default select-none group"
                >
                  <p className="text-[10px] text-app-accent font-mono tracking-widest uppercase mb-1 font-bold">
                    {inst.category}
                  </p>
                  <h4 className="text-[11.5px] font-display font-bold text-app-primary group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors tracking-tight">
                    {inst.name}
                  </h4>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 text-[10.5px] font-mono text-app-secondary font-bold">
              Showing {filteredInstitutions.length} of {institutions.length} mapped networks found in our ecosystem circle.
            </div>
          </div>
        )}

        {/* Small Disclaimer */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-[10px] leading-relaxed text-app-secondary font-mono border-t border-dashed border-stone-300 dark:border-stone-800/40 pt-6 font-medium">
            <strong>Ecosystem Disclaimer:</strong> Founder-Being is an independent wellbeing, reflection, and quiet clarity gathering built strictly as a restorative sanctuary. References to third-party institutions, portfolios, accelerators, and networking summits reflect past founder experience, community exposure, and regional hub participation of builders in our community circles, rather than official corporate endorsements, affiliations, or joint ventures.
          </p>
        </div>

      </div>
    </section>
  );
}
