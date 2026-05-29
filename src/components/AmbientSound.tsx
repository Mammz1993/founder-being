import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Moon, ShieldAlert } from 'lucide-react';

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(15); // Percentage
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Audio Nodes for Synthesis
  const noiseSourceRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const bellOscRef = useRef<OscillatorNode | null>(null);
  const bellGainRef = useRef<GainNode | null>(null);

  // Stop sound cleanly on unmount
  useEffect(() => {
    return () => {
      stopSynthesis();
    };
  }, []);

  const initAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        setError("Web Audio API not supported in this browser.");
        return false;
      }
      
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(volume / 100, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // 1. Synthesize Wave Sound using Noise
      const bufferSize = 4096 * 2;
      let scriptNode: ScriptProcessorNode;
      
      // In older/modern browsers, ScriptProcessorNode is highly available
      scriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      
      // Fill the buffer with customized brown noise (deeper, mellower than white noise)
      let lastOut = 0.0;
      scriptNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brown noise filtration
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 4.5; // Gain compensation
        }
      };
      
      noiseSourceRef.current = scriptNode;

      // 2. Filter for wave movement
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(1.2, ctx.currentTime);
      filterRef.current = filter;

      // 3. LFO to sweep filter cutoff frequency (simulating deep oceanic breaths)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12 seconds per full breath cycle
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(320, ctx.currentTime); // sweep range
      
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency); // modulate custom filter cutoff
      
      // Set baseline cutoff frequency
      filter.frequency.setValueAtTime(380, ctx.currentTime);

      // Connect noise source to filter
      scriptNode.connect(filter);
      
      // Connect filter to main gain
      filter.connect(mainGain);

      // 4. Soft harmonic healing tone (432Hz deep meditative drone)
      const bellOsc = ctx.createOscillator();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(108, ctx.currentTime); // Low deep G# or fundamental drone (108Hz)
      bellOscRef.current = bellOsc;

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.04, ctx.currentTime); // extra subtle
      bellGainRef.current = bellGain;

      bellOsc.connect(bellGain);
      bellGain.connect(mainGain);

      // Start LFO and Tone
      lfo.start();
      bellOsc.start();

      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;

      return true;
    } catch (err: any) {
      console.error(err);
      setError("Unable to initialize sound engine: " + err.message);
      return false;
    }
  };

  const startSynthesis = async () => {
    setError(null);
    if (!audioCtxRef.current) {
      const success = initAudio();
      if (!success) return;
    }

    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        setError("Interaction required to enable audio.");
        return;
      }
    }
    
    setIsPlaying(true);
  };

  const stopSynthesis = () => {
    try {
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (bellOscRef.current) {
        bellOscRef.current.stop();
        bellOscRef.current.disconnect();
        bellOscRef.current = null;
      }
      if (noiseSourceRef.current) {
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (filterRef.current) {
        filterRef.current.disconnect();
        filterRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      // Ignored
    }
    setIsPlaying(false);
  };

  const handleToggle = async () => {
    if (isPlaying) {
      stopSynthesis();
    } else {
      await startSynthesis();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val / 100, audioCtxRef.current.currentTime);
    }
  };

  return (
    <div className="flex items-center gap-3 backdrop-blur-md bg-stone-900/10 dark:bg-white/5 py-1.5 px-3 rounded-full border border-stone-250 dark:border-stone-800/40 text-stone-750 dark:text-stone-300 transition-all duration-300">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 cursor-pointer text-xs font-mono select-none tracking-tight py-0.5 hover:text-stone-950 dark:hover:text-white transition-colors font-medium"
        id="toggle-ambient-sound"
        title={isPlaying ? "Mute Ocean Audio" : "Play Wave Synth"}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-stone-955 dark:text-stone-100 animate-pulse" />
            <span className="text-[10px] text-stone-750 dark:text-stone-300">Waves Active</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-stone-550 dark:text-stone-450" />
            <span className="text-[10px] text-stone-550 dark:text-stone-450">Muted Ambient</span>
          </>
        )}
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="40"
            value={volume}
            onChange={handleVolumeChange}
            id="volume-slider"
            className="w-12 md:w-16 h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-700 dark:accent-stone-300"
            title="Ambient Volume"
          />
        </div>
      )}

      {error && (
        <div className="flex items-center text-[10px] text-amber-600/90 dark:text-amber-400/80 gap-1 font-mono">
          <ShieldAlert className="w-3 h-3" />
          <span className="hidden md:inline">Click first</span>
        </div>
      )}
    </div>
  );
}
