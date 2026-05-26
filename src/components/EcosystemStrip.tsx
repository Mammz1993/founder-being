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
    <section id="ecosystem" className="py-24 px-4 md:px-8 border-y border-stone-200/10 dark:border-stone-900 bg-stone-50/20 dark:bg-stone-950/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Label & Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-[0.25em] text-amber-800 dark:text-amber-500 uppercase block mb-3">
            Regional Ecosystem & Founder Networks
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-light text-stone-900 dark:text-stone-100 tracking-tight">
            Ecosystem Exposure & Founder Networks
          </h2>
          <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-4 leading-relaxed font-light">
            Our community brings silent mental balance, clarity calibration, and human trust to builders carrying pressure across world-class startup launchpads, venture portfolios, and regional hubs.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/40 dark:bg-stone-900/40 border border-stone-300/25 dark:border-stone-800/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-stone-600 dark:text-stone-400">
              DUBAI · MIDDLE EAST · INDIA · SOUTH EAST ASIA · GLOBAL PORTS
            </span>
          </div>
        </div>

        {/* Running Ticker (EcosystemStrip Marquee) */}
        <div className="relative w-full overflow-hidden py-6 border-y border-stone-200/15 dark:border-stone-800/30">
          {/* Edge Fades for a gorgeous high-fidelity premium feel */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#faf9f6]/95 via-transparent to-transparent dark:from-stone-950/95 dark:via-transparent dark:to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#faf9f6]/95 via-transparent to-transparent dark:from-stone-950/95 dark:via-transparent dark:to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="animate-marquee flex items-center gap-8 md:gap-12 whitespace-nowrap">
            {marqueeList.map((inst, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-amber-100 transition-colors duration-300 select-none cursor-default group"
              >
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] font-light">
                  {inst.name}
                </span>
                <span className="text-stone-305 dark:text-stone-700 font-mono text-xs text-amber-500/50 block group-hover:scale-110 transition-transform">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-mono tracking-wider uppercase border border-stone-200/70 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 transition-all cursor-pointer shadow-sm"
          >
            <span>{isDirectoryExpanded ? "Minimize Directory" : "Explore Categorized Directory (40+ Networks)"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDirectoryExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Directory Panel */}
        {isDirectoryExpanded && (
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-stone-200/30 dark:border-stone-850 bg-white/40 dark:bg-stone-950/20 backdrop-blur-sm shadow-sm">
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 border-b border-stone-200/15 dark:border-stone-800/30 pb-6 mb-8">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                      isActive
                        ? "bg-stone-900 dark:bg-amber-500/10 text-white dark:text-amber-300 border-stone-900 dark:border-amber-500/30 shadow-sm"
                        : "bg-stone-100/50 dark:bg-stone-900/40 text-stone-505 dark:text-stone-400 border-transparent hover:border-stone-250 dark:hover:border-stone-800"
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
                  className="p-3.5 rounded-lg border border-stone-200/10 dark:border-stone-850/60 bg-stone-100/30 dark:bg-stone-950/40 text-center hover:bg-stone-100/70 dark:hover:bg-stone-900/50 hover:border-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-default select-none group"
                >
                  <p className="text-[10px] text-stone-450 dark:text-stone-500 font-mono tracking-widest uppercase mb-1">
                    {inst.category}
                  </p>
                  <h4 className="text-[11.5px] font-display font-medium text-stone-800 dark:text-stone-200 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors tracking-tight">
                    {inst.name}
                  </h4>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 text-[10px] font-mono text-stone-400 dark:text-stone-500">
              Showing {filteredInstitutions.length} of {institutions.length} mapped networks found in our ecosystem circle.
            </div>
          </div>
        )}

        {/* Small Disclaimer */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-[10px] leading-relaxed text-stone-400 dark:text-stone-500 font-mono border-t border-dashed border-stone-200/12 dark:border-stone-800/40 pt-6">
            <strong>Ecosystem Disclaimer:</strong> Founder-Being is an independent wellbeing, reflection, and quiet clarity gathering built strictly as a restorative sanctuary. References to third-party institutions, portfolios, accelerators, and networking summits reflect past founder experience, community exposure, and regional hub participation of builders in our community circles, rather than official corporate endorsements, affiliations, or joint ventures.
          </p>
        </div>

      </div>
    </section>
  );
}
