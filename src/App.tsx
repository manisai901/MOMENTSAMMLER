import React, { useState, useEffect, useRef } from 'react';
import { 
  TripDetails, 
  PhotoItem, 
  Screenplay, 
  MoodType,
  JourneyChapter
} from './types';
import { PresetSelector, PRESET_ALBUMS, PresetAlbum } from './components/PresetSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { 
  Sparkles, 
  Compass, 
  Mountain, 
  Flame, 
  Music, 
  Heart, 
  Camera, 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  X, 
  ChevronRight, 
  Map, 
  BookOpen, 
  Film, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Calendar, 
  TrendingUp, 
  User, 
  Folder, 
  Check,
  Award,
  Globe,
  Plus,
  PlayCircle,
  Sunset,
  Tv,
  HeartHandshake,
  ArrowRight,
  Sun,
  Moon,
  Info,
  CalendarCheck,
  Quote
} from 'lucide-react';

export default function App() {
  // 1. Dual Premium Aesthetic Themes Support
  // 'creme' (Linen Parchment) matches momentsammler.at perfectly, 'charcoal' provides a luxury cinema dark mode
  const [themeMode, setThemeMode] = useState<'creme' | 'charcoal'>('creme');

  // 2. Form Inputs State
  // Default to Dolomites Intimate Wedding (resembling momentsammler) on start
  const [name, setName] = useState('Sarah & David');
  const [tripName, setTripName] = useState('Dolomites Intimate Wedding');
  const [location, setLocation] = useState('Seceda Peaks, South Tyrol, Italy');
  const [travelDates, setTravelDates] = useState('3 Days');
  const [mood, setMood] = useState<MoodType>('Emotional');
  const [notes, setNotes] = useState('A highly elegant, breathtaking elopement in alpine meadows capturing authentic windblown hair, champagne toast laughter, and serene sunset vows.');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [musicCategory, setMusicCategory] = useState('Emotional Piano');

  // Selected Preset ID tracking
  const [activePresetId, setActivePresetId] = useState<string>('');

  // 3. Playback & Screenplay State
  const [screenplay, setScreenplay] = useState<Screenplay | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  
  // Cinema Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegIndex, setCurrentSegIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isNarrationSpeaking, setIsNarrationSpeaking] = useState(false);
  const [voiceNarratorEnabled, setVoiceNarratorEnabled] = useState(true);

  // Filters & Tabs
  const [videoFilter, setVideoFilter] = useState<'none' | 'vintage' | 'warm-gold' | 'cool-nordic' | 'dreamy' | 'cinematic'>('warm-gold');
  const [activeTab, setActiveTab] = useState<'cinema' | 'map' | 'timeline' | 'script'>('cinema');

  // Interactive Wedding & Couple Consultation Brief Planner
  const [consultStep, setConsultStep] = useState<number>(0);
  const [consultAnswers, setConsultAnswers] = useState({
    coupleNames: '',
    vibeType: 'Intimate Romance',
    terrainPreference: 'High Mountains & Cliffs',
    aestheticKeyword: 'Authentic Nostalgia',
    dreamDestination: ''
  });
  const [customProposalMood, setCustomProposalMood] = useState<string | null>(null);

  // Contact booking feedback
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech synthesis reference
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Set default photo presets to Dolomites on initial load
  useEffect(() => {
    // Select Dolomites preset to match styling of momentsammler immediately
    const doloPreset = PRESET_ALBUMS.find(a => a.id === 'dolomites') || PRESET_ALBUMS[3] || PRESET_ALBUMS[0];
    handleApplyPreset(doloPreset);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Sync state transitions during active film play
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && screenplay && screenplay.segments.length > 0) {
      const currentSegment = screenplay.segments[currentSegIndex];
      const segmentDurationMs = (currentSegment?.durationSeconds || 7) * 1000;
      
      if (currentSegment?.filter) {
        setVideoFilter(currentSegment.filter);
      }

      // Synchronize speech synthesis audio narration
      if (voiceNarratorEnabled && synthRef.current) {
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(currentSegment.narration);
        const voices = synthRef.current.getVoices();
        
        // Pick best natural voice model if available
        const preferredVoice = voices.find(v => 
          v.name.includes('Google US English') || 
          v.name.includes('David') || 
          v.name.includes('Natural') || 
          v.name.includes('Premium') ||
          v.lang.startsWith('en')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.pitch = 1.05; // Slightly warmer pitch
        utterance.rate = 0.84;  // Beautiful storytelling pace
        
        utterance.onstart = () => {
          setIsNarrationSpeaking(true);
        };
        utterance.onend = () => {
          setIsNarrationSpeaking(false);
        };
        utterance.onerror = () => {
          setIsNarrationSpeaking(false);
        };

        speechUtteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      }

      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / segmentDurationMs) * 100, 100);
        setProgressPercent(progress);

        if (elapsed >= segmentDurationMs) {
          clearInterval(interval);
          handleNextSegment();
        }
      }, 50);
    } else {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsNarrationSpeaking(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, currentSegIndex, screenplay]);

  const handleNextSegment = () => {
    if (!screenplay) return;
    if (currentSegIndex < screenplay.segments.length - 1) {
      setCurrentSegIndex(prev => prev + 1);
      setProgressPercent(0);
    } else {
      setIsPlaying(false);
      setProgressPercent(100);
      setActiveTab('timeline'); // Switch to beautiful chapters summary on finishing
    }
  };

  const handlePrevSegment = () => {
    if (currentSegIndex > 0) {
      setCurrentSegIndex(prev => prev - 1);
      setProgressPercent(0);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentSegIndex(0);
    setProgressPercent(0);
    setIsPlaying(true);
  };

  const handleApplyPreset = (preset: PresetAlbum) => {
    setActivePresetId(preset.id);
    setName(preset.id === 'dolomites' ? 'Sarah & David' : 'Manikanta Sai');
    setTripName(preset.title);
    setLocation(preset.location);
    setTravelDates(preset.duration);
    setMood(preset.mood);
    setNotes(preset.description);
    setPhotos(preset.photos);
    setMusicCategory(preset.musicCategory);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
    }
  };

  const processUploadedFiles = (files: FileList) => {
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultSrc = reader.result as string;
        const cleanName = file.name.split('.')[0].replace(/[-_]/g, ' ');
        const smartItem: PhotoItem = {
          id: `custom-img-${Date.now()}-${index}`,
          url: resultSrc,
          name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          description: `Breathtaking photography framing genuine moments on this journey.`
        };
        setPhotos(prev => [...prev, smartItem]);
      };
      reader.readAsDataURL(file);
    });
    setActivePresetId(''); // clear preset highlight as user loaded custom images
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Generate full film screenplay
  const startGeneratingDocumentary = async () => {
    if (photos.length < 3) {
      alert("Please upload or select at least 3 photos to construct a coherent cinematic timeline.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);
    setGenerationLogs(["Initializing Momentsammler Narrative Core..."]);

    const steps = [
      { t: 600, m: "Analyzing camera parameters (iris, anamorphic bokeh, and sunset glow offsets)..." },
      { t: 1405, m: "Structuring cinematic chronological chapters representing emotional layers..." },
      { t: 2300, m: "Weaving poetical script with authentic, slow-paced luxury voice guides..." },
      { t: 3100, m: "Fusing visual zoom ratios, pan keyframes, and vintage warm-gold filters..." },
      { t: 3900, m: "Fine-tuning acoustic soundtrack ducking and voice synthetics..." }
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setGenerationStep(i + 2);
        setGenerationLogs(prev => [...prev, step.m]);
      }, step.t);
    });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tripName,
          location,
          travelDates,
          mood,
          notes,
          photos: photos.map(p => ({ id: p.id, name: p.name, description: p.description }))
        })
      });

      const data = await response.json();
      
      if (data.success && data.screenplay) {
        setTimeout(() => {
          const apiScreenplay = data.screenplay as Screenplay;
          
          const patchedSegments = apiScreenplay.segments.map(seg => {
            const matchedPhoto = photos.find(p => p.id === seg.photoId);
            return {
              ...seg,
              imageUrl: matchedPhoto ? matchedPhoto.url : 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=700',
              subtitle: matchedPhoto ? matchedPhoto.name : seg.subtitle
            };
          });

          setScreenplay({
            ...apiScreenplay,
            segments: patchedSegments as any
          });
          
          setIsGenerating(false);
          setGenerationStep(0);
          setCurrentSegIndex(0);
          setProgressPercent(0);
          setIsPlaying(true);
          setActiveTab('cinema');
        }, 4500);

      } else {
        throw new Error(data.error || "Aesthetic model endpoint response signature misaligned");
      }
    } catch (err: any) {
      console.warn("API Error - running high fidelity romantic fallback", err);
      setGenerationLogs(prev => [...prev, "✨ Harnessing local fine-art script compilation..."]);
      setTimeout(() => {
        generateHighFidelityFallback();
      }, 1500);
    }
  };

  const generateHighFidelityFallback = () => {
    const photoIds = photos.map(p => p.id);
    
    const fallbackScenarios: Record<string, string[]> = {
      Emotional: [
        "We collect moments, not because they last, but because in those short seconds, eternity feels tangible.",
        "Beneath the soaring giant dolomite monoliths, we whispered vows that need no amplifiers, only mountain drafts.",
        "A warm soft gaze, a subtle squeeze of the hands, a quiet happy tear—this is where real film poetry resides.",
        "They ran freely together through wild alpine clover, laughing with absolute, unscripted abandon under skies of gold.",
        "As lantern sparkles bathed the rustic lodge porch, they danced silently, holding onto the best chapter of their lives."
      ],
      Luxury: [
        "True luxury is not about excess. It is the exquisite privilege of breathing in absolute silence and timeless elegance.",
        "Sunlight danced across ancient palace arches, painting the sandstone columns in royal champagne liquid gold.",
        "Warm tea on wooden terraces floating above deep emerald lake water, watching mist hug the historic slopes.",
        "A soft desert breeze carried rumors of old empires as the sun slipped away, leaving behind velvet peach skies.",
        "Sipping wine beneath a crystalline canopy of infinite stars, celebrating a love story written with pure mindfulness."
      ],
      Spiritual: [
        "In the deep silence of ancient peaks, the busy clatter of the city dissolves into quiet morning mist.",
        "Each grey stone flag and temple column feels carved out of memories, echoing prayers of travelers centuries past.",
        "Incense spirals floated slowly up to meet the blue mountain morning, carrying whispers of quiet surrender.",
        "Walking the narrow glacial trail, we realized that the greatest sanctuaries are not built of stone, but of love.",
        "As copper temple bells rang out across the valley, a profound, permanent sense of peace settled deep into our chest."
      ],
      Adventure: [
        "Climbing up into the pristine alpine summits, where the air is pure and the mind stands beautifully clear.",
        "The gravel path was steep and suspended over sheer valleys, but great beauty is rarely found on flat roads.",
        "With deep burns in our legs and frost on our scarves, we scaled the rugged skyline with joyful hearts.",
        "Standing suspended above the sea of clouds, overlooking the vast, quiet world spreading below us like a gift.",
        "Some trails are not designed for convenience. They are engineered to test our core and wake up our sleeping spirit."
      ],
      Nature: [
        "The mossy pine forest whispers old organic stories back to the rushing glacial streams.",
        "Gentle emerald leaves catch the morning dew, casting beautiful dancing diamond flares over the rich soil.",
        "We paused by the mirror-calm river, watching slow ripples dissolve into absolute slate tranquility.",
        "The horizon painted itself in organic tones of raw bronze, sienna, and warm sepia, concluding a blessed day.",
        "To wander in silent wild mountain forests is to reconnect with the humble, magnificent elegance of our Earth."
      ],
      Fun: [
        "Laughter rang out above suspension bridges as we got entirely lost and loved every single second of it!",
        "Ducking beside giant yellow boulders to escape the freezing spray of hidden, thunderous waterfalls.",
        "Nothing in a five-star dining room will ever taste as glorious as hot noodles cooked over a camp stove with you.",
        "Raindrops hitting our faces as we ran hand-in-hand toward the glowing campfire tent shelter, laughing out loud.",
        "The best stories are the ones we never plan. They happen in the spontaneous, chaotic, joyful pauses."
      ]
    };

    const narrations = fallbackScenarios[mood] || fallbackScenarios.Emotional;
    
    const chapters: JourneyChapter[] = [
      { id: "fallback-c1", title: "Chapter I: The Arrival & Calling", description: "Taking the first quiet steps into the sacred untouched landscape.", photoIds: photoIds.slice(0, Math.ceil(photoIds.length * 0.3)) },
      { id: "fallback-c2", title: "Chapter II: The Heartfelt Path", description: "Facing high winds, narrow bridges, and breathtaking horizons.", photoIds: photoIds.slice(Math.ceil(photoIds.length * 0.3), Math.ceil(photoIds.length * 0.6)) },
      { id: "fallback-c3", title: "Chapter III: Unplanned Wonders", description: "Discovering quiet alpine sanctuaries and hidden cascades.", photoIds: photoIds.slice(Math.ceil(photoIds.length * 0.6), Math.ceil(photoIds.length * 0.85)) },
      { id: "fallback-c4", title: "Chapter IV: Eternity Collected", description: "Standing side by side on high mountain peaks bathed in golden twilight.", photoIds: photoIds.slice(Math.ceil(photoIds.length * 0.85)) }
    ].filter(ch => ch.photoIds.length > 0);

    const effectOptions: ("ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right")[] = ["ken-burns-in", "ken-burns-out", "pan-left", "pan-right"];
    const filterOptions: ("vintage" | "warm-gold" | "cool-nordic" | "dreamy" | "cinematic")[] = ["warm-gold", "cinematic", "dreamy", "vintage", "cool-nordic"];

    const segments = photos.map((p, index) => {
      const text = narrations[index % narrations.length];
      return {
        photoId: p.id,
        imageUrl: p.url,
        subtitle: p.name,
        narration: text,
        effect: effectOptions[index % effectOptions.length],
        filter: filterOptions[index % filterOptions.length],
        durationSeconds: 7
      };
    });

    const mockScreenplay: Screenplay = {
      movieTitle: screenplay?.movieTitle || `${tripName || 'Collected Moments'} // film by ${name || 'Sarah & David'}`,
      chapters,
      segments: segments as any,
      mapRoute: mood === 'Spiritual' ? [
        { name: "Haridwar Gateway", lat: 29.9457, lng: 78.1642 },
        { name: "Guptkashi valleys", lat: 30.5239, lng: 79.0784 },
        { name: "Kedarnath Sanctuary", lat: 30.7352, lng: 79.0669 }
      ] : mood === 'Luxury' ? [
        { name: "Jaipur Amber Gate", lat: 26.9855, lng: 75.8513 },
        { name: "Thar Sand Dunes", lat: 26.9157, lng: 70.9083 },
        { name: "Lake Palace Terrace", lat: 24.5764, lng: 73.6806 }
      ] : [
        { name: "Dolomites Valley Pass", lat: 46.5492, lng: 11.9565 },
        { name: "Seceda Summit Lookout", lat: 46.5986, lng: 11.7289 },
        { name: "Lodge Hearth Room", lat: 46.6120, lng: 11.8430 }
      ],
      stats: [
        { label: "Moments Captured", value: `${photos.length} Fine Frames`, icon: "Camera" },
        { label: "Chapters Compiled", value: `${chapters.length} Built`, icon: "Folder" },
        { label: "Focal Altitude", value: "8,940 ft", icon: "Mountain" },
        { label: "Aesthetic Core", value: "Anamorphic", icon: "Sliders" }
      ],
      overallNarration: `A premium visual keepsake tracking the cinematic odyssey. ${narrations.join(' ')}`
    };

    setScreenplay(mockScreenplay);
    setIsGenerating(false);
    setGenerationStep(0);
    setCurrentSegIndex(0);
    setProgressPercent(0);
    setIsPlaying(true);
    setActiveTab('cinema');
  };

  const jumpToSegment = (idx: number) => {
    setCurrentSegIndex(idx);
    setProgressPercent(0);
    setIsPlaying(true);
  };

  const getFilterCSS = (filterName: string) => {
    switch (filterName) {
      case 'vintage':
        return 'contrast-[1.03] brightness-[0.90] sepia-[0.3] saturate-[0.8]';
      case 'warm-gold':
        return 'contrast-[1.08] brightness-[0.94] saturate-[1.2] sepia-[0.18] hue-rotate-[6deg]';
      case 'cool-nordic':
        return 'contrast-[1.04] brightness-[0.91] saturate-[0.88] hue-rotate-[-8deg]';
      case 'dreamy':
        return 'contrast-[0.98] brightness-[1.03] saturate-[1.05] blur-[0.25px]';
      case 'cinematic':
      default:
        return 'contrast-[1.15] sepia-[0.04] brightness-[0.93] saturate-[1.1] text-stone-100';
    }
  };

  // Consultation brief builder generator
  const triggerConsultationSubmit = () => {
    const coupleNames = consultAnswers.coupleNames || "Sarah & David";
    const vibes = consultAnswers.vibeType;
    const terrain = consultAnswers.terrainPreference;
    const keyw = consultAnswers.aestheticKeyword;
    const dest = consultAnswers.dreamDestination || "Dolomites, Italy";

    const descriptiveMood = `A high-end visual brief with the signature aesthetic of Momentsammler. For the love story of ${coupleNames} who wish to connect through a ${vibes} atmosphere. We recommend shooting at sunrise in ${dest} amidst ${terrain}, chasing ${keyw} light values (Leica 50mm, f/1.4, slow cinema pan grade).`;
    
    setCustomProposalMood(descriptiveMood);
    setConsultStep(1);
  };

  const currentSegment = screenplay?.segments[currentSegIndex];
  const activeChapter = screenplay?.chapters.find(ch => ch.photoIds.includes(currentSegment?.photoId || ''));

  return (
    <div 
      id="momentsammler-root" 
      className={`min-h-screen font-sans flex flex-col relative overflow-x-hidden transition-colors duration-700 ${
        themeMode === 'creme' 
          ? 'bg-[#FAF7F2] text-stone-800 selection:bg-stone-800 selection:text-white' 
          : 'bg-[#100E0C] text-[#F5F2EB] selection:bg-[#C5A880] selection:text-black'
      }`}
    >
      {/* 2px Elegant Framing Line representing Luxury Portfolio border */}
      <div className={`fixed top-0 left-0 w-full h-[3px] z-50 ${themeMode === 'creme' ? 'bg-stone-800' : 'bg-[#C5A880]'}`}></div>
      <div className={`fixed bottom-0 left-0 w-full h-[3px] z-50 ${themeMode === 'creme' ? 'bg-stone-800' : 'bg-[#C5A880]'}`}></div>

      {/* Background glow lens-flares */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-[-10%] w-[600px] h-[600px] bg-stone-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Upper Floating Top Bar Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-30">
        
        {/* Brand Typography */}
        <div className="flex flex-col text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
            <span className="text-xl sm:text-2xl font-serif tracking-[0.25em] uppercase font-light">
              MOMENTSAMMLER
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#A88A60] font-sans mt-1">
            Photography & Editorial Films • Sabrina & Manuel Style
          </span>
        </div>

        {/* Floating Custom Theme Toggle & Status Buttons */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          
          <div className="flex bg-stone-200/50 dark:bg-stone-900/60 p-1 rounded-full border border-stone-300/30">
            <button 
              onClick={() => setThemeMode('creme')}
              className={`p-1.5 px-3 rounded-full text-xs font-sans tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                themeMode === 'creme' 
                  ? 'bg-white text-stone-800 shadow-md font-medium' 
                  : 'text-stone-400 hover:text-[#FAF7F2]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Parchment Care
            </button>
            <button 
              onClick={() => setThemeMode('charcoal')}
              className={`p-1.5 px-3 rounded-full text-xs font-sans tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                themeMode === 'charcoal' 
                  ? 'bg-stone-850 text-[#C5A880] shadow-md font-medium border border-stone-800' 
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Velvet Dark
            </button>
          </div>

          <span className="text-[10px] font-mono border border-stone-400/40 px-3 py-1.5 rounded-full uppercase tracking-widest opacity-80">
            {location.split(',')[0]}
          </span>
        </div>
      </header>

      {/* Main Hero visual banner resembling front page of momentsammler */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-12 relative z-20">
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[21/9] min-h-[350px] shadow-2xl flex items-center justify-center text-center">
          {/* Main Ambient Video/Image Background */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1500" 
              alt="Momentsammler Hero Wedding"
              className="w-full h-full object-cover brightness-[0.6] grayscale-[20%] scale-102 transition-all hover:scale-105 duration-[4000ms]"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${themeMode === 'creme' ? 'from-[#FAF7F2]/90' : 'from-[#100E0C]/95'} via-transparent to-black/30`}></div>
          </div>

          {/* Emotional Statement Overlay */}
          <div className="relative z-10 px-6 max-w-3xl flex flex-col items-center">
            <span className="text-[11px] font-mono tracking-[0.45em] text-[#C5A880] uppercase mb-3">
              COLLECTING LIFE'S PRECIOSITIES
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-wide font-light leading-none">
              Capture your untamed, <br />
              <span className="italic font-serif font-extralight text-[#F4EFE6] block mt-1">most human seconds.</span>
            </h1>
            <div className="w-16 h-[1.5px] bg-[#C5A880] my-6"></div>
            <p className="text-zinc-200 text-sm sm:text-base font-sans font-light tracking-wide max-w-xl leading-relaxed">
              We create emotional movies & delicate, unposed photography stories of weddings, secret elopements, and high-altitude mountain trails.
            </p>

            <a 
              href="#moment-collector-lounge"
              className="mt-8 bg-white/10 backdrop-blur-md hover:bg-white hover:text-black hover:scale-102 transition-all px-6 py-3.5 rounded-full text-xs font-space font-medium uppercase tracking-[0.25em] text-white border border-white/20 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Tv className="w-4 h-4" /> Enter Cinematic Studio
            </a>
          </div>

          {/* Infinite spinning moment collector ring */}
          <div className="absolute bottom-6 right-6 hidden md:block w-24 h-24 pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center">
              <svg className="w-20 h-20 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                <path id="circlePath" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                <text className="text-[10px] uppercase font-mono tracking-wider fill-[#C5A880]" fontWeight="normal">
                  <textPath href="#circlePath" startOffset="0%">
                    MOMENT COLLECTOR • EST 2026 • 
                  </textPath>
                </text>
              </svg>
              <Heart className="absolute w-4 h-4 text-white hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Main grid and content panels */}
      <main className="w-full max-w-7xl mx-auto px-6 relative z-10 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PRESTIGE SETTINGS & CONSULTATION INTAKE */}
        <section className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Main Settings Card */}
          <div 
            id="director-settings-panel" 
            className={`rounded-2xl p-6 transition-all duration-500 relative border ${
              themeMode === 'creme' 
                ? 'bg-[#F4EFE6] border-stone-300/40 shadow-xl shadow-stone-200/50' 
                : 'luxury-glass bg-[#181512] border-stone-800 shadow-2xl'
            }`}
          >
            {/* Elegant framing corners */}
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#C5A880]/30"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#C5A880]/30"></div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#C5A880]" />
                <h2 className="text-xs font-space font-semibold tracking-[0.2em] uppercase">
                  Creator Interface
                </h2>
              </div>
              <span className="text-[9px] font-mono bg-[#C5A880]/20 px-2.5 py-1 rounded text-[#A88A60] uppercase tracking-widest font-bold">
                Director Settings
              </span>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-80">
                    Traveler / Couple Names
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-450 opacity-60" />
                    <input
                      type="text"
                      className={`w-full rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors ${
                        themeMode === 'creme' 
                          ? 'bg-white border border-stone-300/60 text-stone-800' 
                          : 'bg-stone-900/60 border border-stone-800 text-[#F5F2EB]'
                      }`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah & David"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-80">
                    Story / Film Title
                  </label>
                  <div className="relative">
                    <Compass className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-450 opacity-60" />
                    <input
                      type="text"
                      className={`w-full rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors ${
                        themeMode === 'creme' 
                          ? 'bg-white border border-stone-300/60 text-stone-800' 
                          : 'bg-stone-900/60 border border-stone-800 text-[#F5F2EB]'
                      }`}
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="e.g. Dolomites Expedition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-80">
                    Location Range
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-450 opacity-60" />
                    <input
                      type="text"
                      className={`w-full rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors ${
                        themeMode === 'creme' 
                          ? 'bg-white border border-stone-300/60 text-stone-800' 
                          : 'bg-stone-900/60 border border-stone-800 text-[#F5F2EB]'
                      }`}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. South Tyrol, Italy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-80">
                    Travel / Shoot Duration
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-450 opacity-60" />
                    <input
                      type="text"
                      className={`w-full rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors ${
                        themeMode === 'creme' 
                          ? 'bg-white border border-stone-300/60 text-stone-800' 
                          : 'bg-stone-900/60 border border-stone-800 text-[#F5F2EB]'
                      }`}
                      value={travelDates}
                      onChange={(e) => setTravelDates(e.target.value)}
                      placeholder="e.g. 3 Days"
                    />
                  </div>
                </div>
              </div>

              {/* Mood Choices Styled to perfection */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest mb-2 opacity-80">
                  Select Visual Aesthetic Mood
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Emotional', 'Luxury', 'Nature', 'Spiritual', 'Adventure', 'Fun'] as MoodType[]).map((m) => {
                    const isSelected = mood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`py-2 text-xs rounded-lg border font-space transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#A88A60] font-semibold'
                            : themeMode === 'creme'
                            ? 'bg-white/80 border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800'
                            : 'bg-stone-955/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-white'
                        }`}
                      >
                        {m === 'Emotional' && <Heart className="w-3.5 h-3.5" />}
                        {m === 'Luxury' && <Award className="w-3.5 h-3.5" />}
                        {m === 'Nature' && <Mountain className="w-3.5 h-3.5" />}
                        {m === 'Spiritual' && <Flame className="w-3.5 h-3.5" />}
                        {m === 'Adventure' && <Compass className="w-3.5 h-3.5" />}
                        {m === 'Fun' && <Sparkles className="w-3.5 h-3.5" />}
                        <span className="text-[10px] tracking-wide uppercase font-medium">{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Soundtrack */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-80">
                  Associated Audio Soundtrack
                </label>
                <div className="relative">
                  <Music className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-450 opacity-60" />
                  <select
                    value={musicCategory}
                    onChange={(e) => setMusicCategory(e.target.value)}
                    className={`w-full rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors appearance-none cursor-pointer ${
                      themeMode === 'creme' 
                        ? 'bg-white border border-stone-300/60 text-stone-800' 
                        : 'bg-stone-900/60 border border-stone-800 text-[#F5F2EB]'
                    }`}
                  >
                    <option value="Emotional Piano">Emotional Piano</option>
                    <option value="Cinematic Orchestra">Cinematic Orchestra</option>
                    <option value="Travel Vibes">Travel Vibes</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Epic Adventure">Epic Adventure</option>
                  </select>
                </div>
              </div>

              {/* Narratives Note */}
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5 opacity-80">
                  Storyteller Brief Notes
                </label>
                <textarea
                  className={`w-full rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-colors h-16 resize-none font-sans leading-relaxed ${
                    themeMode === 'creme' 
                      ? 'bg-white border border-stone-300/60 text-stone-800' 
                      : 'bg-stone-900/60 border border-stone-800 text-[#F5F2EB]'
                  }`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detail unposed moments, secret lookouts, specific laughter triggers..."
                />
              </div>

              {/* File upload manager panel */}
              <div className="pt-3 border-t border-stone-300/20">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest">
                    Captured Frames ({photos.length} cached)
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-space text-[#A88A60] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    isDragging 
                      ? 'border-[#C5A880] bg-[#C5A880]/10' 
                      : 'border-stone-350 hover:border-stone-400 bg-stone-100/30'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-5 h-5 text-stone-400 mb-1.5" />
                  <p className="text-xs font-sans text-stone-600">
                    Drop images here, or <span className="text-[#A88A60] font-semibold">browse files</span>
                  </p>
                  <p className="text-[9.5px] text-stone-450 mt-0.5">
                    JPG, PNG (Supports 5+ Wedding or Travel images)
                  </p>
                </div>

                {/* Uploaded strip */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-5 gap-1.5 mt-3 max-h-[100px] overflow-y-auto no-scrollbar p-1.5 bg-stone-200/30 dark:bg-black/35 rounded-xl border border-stone-300/20">
                    {photos.map((p, index) => (
                      <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-300/50">
                        <img 
                          src={p.url} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-all filter brightness-95 group-hover:brightness-100"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removePhoto(p.id); }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white hover:text-red-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Action Button */}
              <button
                type="button"
                onClick={startGeneratingDocumentary}
                disabled={isGenerating || photos.length < 3}
                className="w-full bg-[#C5A880] hover:bg-[#A88A60] disabled:bg-stone-300 disabled:text-stone-500 text-white font-space font-semibold uppercase text-xs tracking-[0.25em] py-3.5 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-pulse text-white" />
                Compile Story Screenplay
              </button>

            </form>
          </div>

          {/* CONSULTATION BRIEF PLANNER CARD (Vibe Matcher) */}
          <div 
            className={`rounded-2xl p-6 relative border ${
              themeMode === 'creme' 
                ? 'bg-[#F4EFE6] border-stone-300/40 shadow-xl' 
                : 'luxury-glass bg-[#181512] border-stone-850'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <HeartHandshake className="w-5 h-5 text-[#C5A880]" />
              <h3 className="font-serif text-lg text-stone-900 dark:text-[#FAF7F2] font-semibold">
                Brief Your Shoot Concept
              </h3>
            </div>
            <p className="text-xs mb-4 leading-relaxed opacity-85">
              Let us recommend your perfect photography and film direction brief. Answer these brief romantic queries to construct an instant vision.
            </p>

            {consultStep === 0 ? (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5">
                    Your names
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hannah & Mark"
                    value={consultAnswers.coupleNames}
                    onChange={(e) => setConsultAnswers({...consultAnswers, coupleNames: e.target.value})}
                    className={`w-full rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880] ${
                      themeMode === 'creme' ? 'bg-white border border-stone-300/70' : 'bg-[#100E0C] border border-stone-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5">
                    Dream Shoot Terrain
                  </label>
                  <select 
                    value={consultAnswers.terrainPreference}
                    onChange={(e) => setConsultAnswers({...consultAnswers, terrainPreference: e.target.value})}
                    className={`w-full rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880] ${
                      themeMode === 'creme' ? 'bg-white border border-stone-300/70' : 'bg-[#100E0C] border border-stone-800 text-white'
                    }`}
                  >
                    <option value="High Mountains & Alpine Meadows">High Mountains & Alpine Meadows</option>
                    <option value="Lakes, Canals & Whispering Reeds">Lakes, Canals & Whispering Reeds</option>
                    <option value="Historic Sandstone Corridors & Forts">Historic Sandstone Corridors & Forts</option>
                    <option value="Misty Rainforest Canopy Trails">Misty Rainforest Canopy Trails</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1.5">
                    Core Connection Mood
                  </label>
                  <select 
                    value={consultAnswers.vibeType}
                    onChange={(e) => setConsultAnswers({...consultAnswers, vibeType: e.target.value})}
                    className={`w-full rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880] ${
                      themeMode === 'creme' ? 'bg-white border border-stone-300/70' : 'bg-[#100E0C] border border-stone-800 text-white'
                    }`}
                  >
                    <option value="Intimate Romance & Whispered Vows">Intimate Romance & Whispered Vows</option>
                    <option value="True Adventure, Hiking & Wild Elopement">True Adventure, Hiking & Wild Elopement</option>
                    <option value="Symmetric Fine Art & Royal Heritage Decor">Symmetric Fine Art & Royal Heritage Decor</option>
                    <option value="Quiet Nature Reflection & Mossy Solitude">Quiet Nature Reflection & Mossy Solitude</option>
                  </select>
                </div>

                <button 
                  onClick={triggerConsultationSubmit}
                  className="w-full bg-stone-800 hover:bg-stone-900 dark:bg-[#C5A880] dark:hover:bg-[#A88A60] text-white dark:text-black font-space font-medium uppercase text-[10px] tracking-widest py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Generate Vision Brief
                </button>
              </div>
            ) : (
              <div className="bg-[#FAF7F2] dark:bg-black/40 p-4 border border-[#C5A880]/30 rounded-xl space-y-3">
                <div className="flex justify-between items-center bg-[#C5A880]/15 px-2 py-1 rounded">
                  <span className="text-[10px] font-mono text-[#A88A60] uppercase tracking-widest">
                    ✨ RECOMMENDED BRIEF
                  </span>
                  <button onClick={() => setConsultStep(0)} className="text-stone-400 hover:text-stone-700 text-xs font-mono">
                    Reset
                  </button>
                </div>
                <p className="text-xs leading-relaxed italic text-stone-700 dark:text-stone-300 font-serif">
                  "{customProposalMood}"
                </p>
                <div className="pt-2 border-t border-stone-300/20 text-[11px] text-stone-500 font-mono">
                  💡 Tip: Apply the <strong className="text-stone-800 dark:text-white">Dolomites</strong> preset, set the mood to <strong className="text-[#A88A60]">Emotional</strong>, and hit "Compile Story Screenplay".
                </div>
              </div>
            )}
          </div>

        </section>

        {/* RIGHT COLUMN: CINEMA STUDIOS & SHOWCASE */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Preset Selector Albums Drawer directly inside content */}
          <div 
            className={`rounded-2xl p-6 border ${
              themeMode === 'creme' 
                ? 'bg-white border-stone-300/40 shadow-xl' 
                : 'luxury-glass bg-[#181512] border-[#C5A880]/10 shadow-2xl'
            }`}
          >
            <div className="mb-4">
              <span className="text-[9px] font-mono text-[#A88A60] uppercase tracking-[0.35em] block mb-1 font-bold">
                MOMENTSAMMLER PRESTIGE ALBUMS
              </span>
              <h4 className="font-serif text-lg font-semibold tracking-wide text-stone-900 dark:text-[#FAF7F2]">
                Explore Curated Memories Portfolios
              </h4>
            </div>
            
            <PresetSelector onSelect={handleApplyPreset} activeId={activePresetId} />
          </div>

          {/* CINEMA ROOM / LOUNGE WITH REAL SPEECH */}
          <div 
            id="moment-collector-lounge" 
            className={`rounded-2xl p-6 relative border transition-all duration-500 ${
              isGenerating ? 'border-amber-500/30' : 'border-stone-300/40'
            } ${
              themeMode === 'creme' 
                ? 'bg-white border-stone-300/40 shadow-xl' 
                : 'luxury-glass bg-[#0C0B0A] border-stone-850 shadow-2xl'
            }`}
          >
            {isGenerating ? (
              /* High luxury loader */
              <div className="min-h-[460px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-dashed border-[#C5A880]/15 animate-[spin_50s_linear_infinite]"></div>
                
                <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-900 border border-[#C5A880] flex items-center justify-center mb-6 shadow-md animate-pulse">
                  <Film className="w-7 h-7 text-[#C5A880] animate-spin" />
                </div>

                <h3 className="text-2xl font-serif tracking-wide text-[#A88A60] font-light uppercase mb-1">
                  Momentsammler Studio Active
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-stone-450 mb-8">
                  Creating: {tripName || 'Love Story'} Keepsake Film
                </p>

                <div className="space-y-2.5 max-w-sm w-full bg-stone-100/60 dark:bg-black/45 p-4 border border-stone-200/40 rounded-xl text-left">
                  {generationLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs font-mono text-stone-600 dark:text-stone-300">
                      <span className="text-[#C5A880]">{idx + 1 === generationLogs.length ? '●' : '✓'}</span>
                      <span className={idx + 1 === generationLogs.length ? 'text-stone-900 dark:text-white font-medium' : 'opacity-65 text-[10px]'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : screenplay ? (
              /* SCREENPLAY & FILM DECK PRESENTATION */
              <div className="flex flex-col gap-5">
                
                {/* Visual Widescreen Theatre */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-850 bg-black group shadow-[0_12px_45px_rgba(0,0,0,0.85)]">
                  
                  {/* Top Black Bar */}
                  <div className="absolute top-0 left-0 w-full h-[10%] bg-black z-30 flex items-center px-6 border-b border-white/5 cinema-black-bar-top justify-between">
                    <span className="text-[9px] font-mono tracking-[0.25em] text-stone-400 uppercase flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      MOMENTSAMMLER ORIGINAL MOTION PICTURE
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase">
                      {mood} GRADE
                    </span>
                  </div>

                  {/* Bottom Black Bar */}
                  <div className="absolute bottom-0 left-0 w-full h-[10%] bg-black z-30 flex items-center px-6 border-t border-white/5 cinema-black-bar-bottom justify-between">
                    <span className="text-[9px] font-mono tracking-widest text-stone-450 uppercase">
                      FILM GRADE: {videoFilter.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 tracking-wider">
                      {Math.floor(currentSegIndex * 7 + (progressPercent / 100) * 7)}s / {screenplay.segments.length * 7}s
                    </span>
                  </div>

                  {/* Golden color bleeding leaks to simulate old vintage photography overlays */}
                  <div className="absolute inset-0 z-20 pointer-events-none mix-blend-screen overflow-hidden">
                    <div className="absolute top-1/4 left-[20%] w-64 h-64 rounded-full bg-[#C5A880]/15 blur-[60px] cinematic-leak-glow"></div>
                    <div className="absolute bottom-1/3 right-[15%] w-72 h-72 rounded-full bg-amber-600/10 blur-[80px] cinematic-leak-glow" style={{ animationDelay: '3s' }}></div>
                  </div>

                  {/* Central slide viewer wrapper */}
                  <div className="w-full h-full relative overflow-hidden bg-stone-950 flex items-center justify-center">
                    {currentSegment ? (
                      <div className="w-full h-full relative overflow-hidden">
                        <img 
                          src={(currentSegment as any).imageUrl}
                          alt={currentSegment.subtitle}
                          className={`w-full h-full object-cover transition-all duration-[7100ms] ease-out ${getFilterCSS(videoFilter)} ${
                            isPlaying 
                              ? currentSegment.effect === 'ken-burns-in' 
                                ? 'scale-115 rotate-1 translate-y-3' 
                                : currentSegment.effect === 'ken-burns-out'
                                ? 'scale-100 translate-x-1.5'
                                : currentSegment.effect === 'pan-left'
                                ? 'scale-110 -translate-x-5'
                                : 'scale-110 translate-x-5'
                              : 'scale-105'
                          }`}
                          referrerPolicy="no-referrer"
                        />

                        {/* Title Cards for Chapters and Parts */}
                        {progressPercent < 35 && (
                          <div className="absolute inset-0 bg-black/45 z-15 flex flex-col items-center justify-center text-center p-6 animate-[fadeIn_0.5s_ease-out]">
                            <span className="text-[10px] font-mono tracking-[0.4em] text-[#C5A880] uppercase mb-1.5">
                              {activeChapter?.title || 'Chapter Moment'}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-widest leading-tight uppercase font-light max-w-lg">
                              {activeChapter?.description || 'Authentic Romantic Vows'}
                            </h3>
                            <div className="w-14 h-[1px] bg-[#C5A880]/60 mt-3.5"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-stone-500 font-serif">
                        No image compiled.
                      </div>
                    )}

                    {/* Subtitles text board */}
                    <div className="absolute bottom-[12%] left-0 right-0 z-30 px-6 text-center bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-8 pb-3">
                      <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-100 font-serif tracking-wide leading-relaxed drop-shadow-md italic">
                        "{currentSegment?.narration}"
                      </p>
                      <p className="text-[10px] font-mono text-[#C5A880] uppercase mt-2 tracking-widest opacity-80">
                        📍 {currentSegment?.subtitle || location}
                      </p>
                    </div>
                  </div>

                  {/* Segment progress timeline metric bar */}
                  <div className="absolute bottom-[10%] left-0 right-0 h-[2.5px] bg-stone-900 z-40">
                    <div 
                      className="h-full bg-[#C5A880] shadow-[0_0_8px_#C5A880] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Corner aesthetic framing bars */}
                  <div className="absolute top-10 right-10 w-10 h-10 border-t border-r border-[#C5A880]/40 pointer-events-none z-30"></div>
                  <div className="absolute bottom-10 left-10 w-10 h-10 border-b border-l border-[#C5A880]/40 pointer-events-none z-30"></div>
                </div>

                {/* Subtitle scene sliders controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-100/60 dark:bg-stone-950 p-4 border border-stone-200/30 rounded-2xl">
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevSegment}
                      disabled={currentSegIndex === 0}
                      className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-800 flex items-center justify-center hover:border-[#C5A880] disabled:opacity-30 transition-colors text-xs cursor-pointer text-stone-700 dark:text-stone-300"
                      title="Prior Moment"
                    >
                      ◀
                    </button>

                    <button
                      onClick={handleTogglePlay}
                      className="w-10 h-10 rounded-full bg-[#C5A880] hover:bg-[#A88A60] text-white flex items-center justify-center hover:scale-105 transition-all shadow-md cursor-pointer"
                      title={isPlaying ? "Pause Screenplay" : "Play Screenplay"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white fill-white ml-0.5" />}
                    </button>

                    <button
                      onClick={handleNextSegment}
                      disabled={currentSegIndex === screenplay.segments.length - 1}
                      className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-800 flex items-center justify-center hover:border-[#C5A880] disabled:opacity-30 transition-colors text-xs cursor-pointer text-stone-700 dark:text-stone-300"
                      title="Next Moment"
                    >
                      ▶
                    </button>

                    <button
                      onClick={handleRestart}
                      className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-800 flex items-center justify-center hover:border-amber-400 transition-colors text-xs cursor-pointer text-stone-500"
                      title="Restart Film"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Audio soundtracks sync */}
                  <AudioPlayer 
                    category={musicCategory} 
                    isNarrationSpeaking={isNarrationSpeaking} 
                    isPlaying={isPlaying} 
                  />

                  {/* Real-time Voice control switcher */}
                  <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest cursor-pointer opacity-80">
                    <input 
                      type="checkbox" 
                      checked={voiceNarratorEnabled} 
                      onChange={(e) => setVoiceNarratorEnabled(e.target.checked)}
                      className="rounded border-[#C5A880] text-[#C5A880] focus:ring-[#C5A880] cursor-pointer"
                    />
                    Sound Narrators Enabled
                  </label>

                </div>

                {/* TABS SELECTOR PANEL FOR DETAILED VIEWS */}
                <div className="flex border-b border-stone-200 dark:border-stone-800">
                  <button
                    onClick={() => setActiveTab('cinema')}
                    className={`flex-1 py-3 text-xs font-space uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                      activeTab === 'cinema' 
                        ? 'border-[#C5A880] text-[#A88A60] font-bold' 
                        : 'border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-white'
                    }`}
                  >
                    🎬 Scene Strip ({screenplay.segments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex-1 py-3 text-xs font-space uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                      activeTab === 'timeline' 
                        ? 'border-[#C5A880] text-[#A88A60] font-bold' 
                        : 'border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-white'
                    }`}
                  >
                    📖 Chapters ({screenplay.chapters.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`flex-1 py-3 text-xs font-space uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                      activeTab === 'map' 
                        ? 'border-[#C5A880] text-[#A88A60] font-bold' 
                        : 'border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-white'
                    }`}
                  >
                    🗺️ Film Map (.GPX)
                  </button>
                  <button
                    onClick={() => setActiveTab('script')}
                    className={`flex-1 py-3 text-xs font-space uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                      activeTab === 'script' 
                        ? 'border-[#C5A880] text-[#A88A60] font-bold' 
                        : 'border-transparent text-stone-400 hover:text-stone-800 dark:hover:text-white'
                    }`}
                  >
                    📜 Director Script
                  </button>
                </div>

                {/* VALUE MATRICES & TAB CONTENTS */}
                <div className="py-2">

                  {activeTab === 'cinema' && (
                    <div className="space-y-2.5 max-h-[190px] overflow-y-auto no-scrollbar pr-1">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-[#A88A60] mb-2 flex items-center justify-between">
                        <span>Film Strips Sequence</span>
                        <span>Click thumbnail to jump to Scene</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {screenplay.segments.map((seg, idx) => {
                          const isCurrent = idx === currentSegIndex;
                          return (
                            <button
                              key={seg.photoId}
                              onClick={() => jumpToSegment(idx)}
                              className={`relative aspect-video rounded-xl overflow-hidden border transition-all text-left group cursor-pointer ${
                                isCurrent 
                                  ? 'border-[#C5A880] scale-102 ring-2 ring-[#C5A880]/30 shadow-md' 
                                  : 'border-stone-200/50 hover:border-stone-400'
                              }`}
                            >
                              <img 
                                src={(seg as any).imageUrl}
                                alt={seg.subtitle} 
                                className="w-full h-full object-cover brightness-95 group-hover:brightness-100"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] truncate text-center text-white font-mono">
                                Moment {idx + 1}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      <h4 className="text-[11px] font-mono text-[#A88A60] uppercase tracking-widest">
                        Film Storyline Blocks ({screenplay.chapters.length} Chapters)
                      </h4>
                      <div className="relative pl-4 border-l border-[#C5A880]/35 space-y-4 font-sans text-xs">
                        {screenplay.chapters.map((ch, idx) => (
                          <div key={ch.id} className="relative">
                            <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#C5A880] border-2 border-white dark:border-stone-900" />
                            <div className="flex justify-between items-center bg-stone-100/50 dark:bg-black/20 p-2.5 rounded-lg border border-stone-200/30">
                              <div>
                                <span className="text-[9px] font-mono uppercase text-[#A88A60] block tracking-widest font-bold">
                                  {ch.title}
                                </span>
                                <h5 className="font-serif text-sm font-semibold text-stone-800 dark:text-white mt-0.5">
                                  {ch.description}
                                </h5>
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                  {ch.photoIds.map(pid => {
                                    const photo = photos.find(p => p.id === pid);
                                    return (
                                      <span key={pid} className="px-2 py-0.5 bg-stone-200/70 dark:bg-stone-900 text-[9px] font-mono uppercase rounded text-stone-600 dark:text-white border border-stone-300/20">
                                        📸 {photo ? photo.name : 'Photo'}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              <span className="text-xs font-mono text-stone-400">0{idx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'map' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 tracking-widest uppercase">
                        <span>Film GPS Track Coordinates</span>
                        <span className="text-[#A88A60]">ACTIVE ROUTE GPX</span>
                      </div>
                      
                      {/* Visual representations of path coordinates */}
                      <div className="bg-stone-100/70 dark:bg-black/40 border border-stone-200/40 p-4 rounded-xl">
                        <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 text-center font-mono text-xs">
                          {screenplay.mapRoute.map((place, idx) => (
                            <React.Fragment key={idx}>
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-900 text-[#C5A880] border border-[#C5A880]/30 flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </div>
                                <span className="text-[10px] font-medium text-stone-800 dark:text-[#F5F2EB] mt-1.5 whitespace-nowrap">
                                  {place.name}
                                </span>
                                <span className="text-[8.5px] opacity-60 font-mono text-stone-500 mt-0.5">
                                  {place.lat.toFixed(3)}°N, {place.lng.toFixed(3)}°E
                                </span>
                              </div>
                              {idx < screenplay.mapRoute.length - 1 && (
                                <div className="flex-grow h-px border-t border-dashed border-[#C5A880]/50 min-w-[20px] self-center mb-5" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'script' && (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">
                        <span>Netflix/National Geographic Broadcast screenplay script</span>
                        <span className="text-[#A88A60]">Full Script Text</span>
                      </div>
                      
                      <div className="p-4 bg-stone-100/60 dark:bg-black/30 border border-stone-200/40 rounded-xl space-y-4 font-serif text-sm leading-relaxed max-h-[160px] overflow-y-auto italic">
                        <p className="text-stone-600 dark:text-stone-300">
                          {screenplay.overallNarration}
                        </p>
                      </div>
                      <div className="text-[10px] font-sans text-stone-400 text-center">
                        🎙️ Press play to hear the computer voice read the chapters live with ducked ambient instrumentals.
                      </div>
                    </div>
                  )}

                </div>

                {/* STATISTICS MULTI-BOARD FOR AUDITING VIEWS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-100/70 dark:bg-stone-950 p-4 border border-stone-200/30 rounded-2xl">
                  {screenplay.stats.map((stat, sindex) => (
                    <div key={sindex} className="flex flex-col text-left">
                      <span className="text-[9px] font-mono text-stone-450 uppercase tracking-widest leading-none">
                        {stat.label}
                      </span>
                      <span className="text-base sm:text-lg font-serif font-semibold text-stone-850 dark:text-[#C5A880] mt-1">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              /* No compiled screen */
              <div className="min-h-[460px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-300 rounded-xl bg-stone-50/20">
                <Camera className="w-8 h-8 text-[#C5A880] opacity-70 mb-4 animate-pulse" />
                <h4 className="font-serif text-xl tracking-wide font-light text-stone-800 dark:text-zinc-100 uppercase">
                  Cinematic Screenplay Lounge
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mt-2 leading-relaxed">
                  Apply a beautiful preset album above or drag and drop custom photos on the left panel, and click "Compile Story Screenplay" to generate a Hollywood-worthy travel cut.
                </p>
              </div>
            )}
          </div>

        </section>
      </main>

      {/* PORTFOLIO ACCORDION GALLERY & STORY TELLING SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-stone-200 dark:border-stone-800 mt-16 z-20 relative">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-mono tracking-[0.4em] text-[#C5A880] uppercase block mb-2">
            MOMENTSAMMLER WORK & BRANDING
          </span>
          <h2 className="text-3xl font-serif text-stone-900 dark:text-white font-medium">
            Fine-Art Portfolios & Love Letters
          </h2>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Every laugh, windblown curls of hair, tearful toasts, and breathtaking mountain summits we capture are curated for print and film archives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 group">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=700" 
                alt="Weddings" 
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#C5A880]">01 // ARCHIVE</span>
                <h4 className="font-serif text-base text-white tracking-wide uppercase mt-1">Weddings & Elopements</h4>
              </div>
            </div>
            <p className="text-xs text-stone-550 leading-relaxed font-light italic">
              Intimate, quiet celebrations set deep in South Tyrol, Dolomites, and high peaks of Kedarnath Sanctuary.
            </p>
          </div>

          <div className="flex flex-col gap-3 group">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=700" 
                alt="Couples" 
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#C5A880]">02 // STORY</span>
                <h4 className="font-serif text-base text-white tracking-wide uppercase mt-1">Lifestyle & Connections</h4>
              </div>
            </div>
            <p className="text-xs text-stone-550 leading-relaxed font-light italic">
              A celebration of wild, unfiltered love—chasing sunburst beams, running over ridges, and dancing silently.
            </p>
          </div>

          <div className="flex flex-col gap-3 group">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=700" 
                alt="Travel Films" 
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#C5A880]">03 // CINEMATIC</span>
                <h4 className="font-serif text-base text-white tracking-wide uppercase mt-1">Adventure Expeditions</h4>
              </div>
            </div>
            <p className="text-xs text-stone-550 leading-relaxed font-light italic">
              Cinematic landscape captures through the emerald canals of Kerala Backwaters and glorious Rajasthani Forts.
            </p>
          </div>
        </div>
      </section>

      {/* INVESTMENT & PRICING TABLE resembling wedding photographer rates */}
      <section className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-stone-200 dark:border-stone-800 z-20 relative">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-mono tracking-[0.4em] text-[#C5A880] uppercase block mb-1">
            INVESTMENT & MEMORY PACKAGES
          </span>
          <h3 className="text-2xl font-serif text-stone-900 dark:text-white font-medium">
            Storytelling Investments
          </h3>
          <p className="text-xs text-stone-500 mt-2">
            Pricing curated for couples and travelers who cherish real-life visual stories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between ${themeMode === 'creme' ? 'bg-white border-stone-250 shadow-md' : 'bg-stone-950 border-stone-800'}`}>
            <div>
              <span className="text-[9px] font-mono text-[#A88A60] uppercase tracking-widest">
                01 // FINE ART BOOK
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-white mt-1">
                The Heritage Story
              </h4>
              <p className="text-[11px] font-mono text-stone-400 mt-1 uppercase tracking-widest">
                Starting at €1,850
              </p>
              <div className="h-px bg-stone-300/35 my-4"></div>
              <ul className="space-y-2 text-xs text-stone-605">
                <li>• 6 Hours of active unposed photography</li>
                <li>• Curated digital keepsakes gallery</li>
                <li>• Initial mood consultation design</li>
                <li>• High density printable files</li>
              </ul>
            </div>
            <a href="#booking-section" className="mt-6 w-full text-center py-2 bg-stone-850 text-white rounded-lg text-xs font-semibold hover:bg-stone-900 transition-colors cursor-pointer block">
              Inquire Now
            </a>
          </div>

          <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between relative ${themeMode === 'creme' ? 'bg-[#F4EFE6] border-[#C5A880] shadow-lg' : 'bg-stone-900 border-[#C5A880]/40'}`}>
            <span className="absolute -top-3.5 right-6 bg-[#C5A880] text-black text-[9px] font-mono uppercase font-bold tracking-widest px-3 py-1 rounded-full">
              MOST LOVED
            </span>
            <div>
              <span className="text-[9px] font-mono text-[#A88A60] uppercase tracking-widest">
                02 // PRESTIGE COMBO
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-white mt-1">
                Cinema & Keepsake Film
              </h4>
              <p className="text-[11px] font-mono text-[#A88A60] mt-1 uppercase tracking-widest font-semibold">
                Starting at €2,900
              </p>
              <div className="h-px bg-[#C5A880]/30 my-4"></div>
              <ul className="space-y-2 text-xs text-stone-605">
                <li>• 10 Hours photography & cinema films</li>
                <li>• Full 3-5 minute 4K cinematic film</li>
                <li>• Premium printed Linen Wedding Box</li>
                <li>• Full digital storyboard playback tool</li>
                <li>• Drone mountain/valley overlays</li>
              </ul>
            </div>
            <a href="#booking-section" className="mt-6 w-full text-center py-2.5 bg-[#C5A880] text-white rounded-lg text-xs font-semibold hover:bg-[#A88A60] transition-colors cursor-pointer block">
              Inquire Now
            </a>
          </div>

          <div className={`p-6 rounded-2xl border text-left flex flex-col justify-between ${themeMode === 'creme' ? 'bg-white border-stone-250 shadow-md' : 'bg-stone-950 border-stone-800'}`}>
            <div>
              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                03 // WILD SPIRIT
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-800 dark:text-white mt-1">
                The Mountain Elopement
              </h4>
              <p className="text-[11px] font-mono text-stone-400 mt-1 uppercase tracking-widest">
                Starting at €2,200
              </p>
              <div className="h-px bg-stone-300/35 my-4"></div>
              <ul className="space-y-2 text-xs text-stone-605">
                <li>• Multi-day high altitude scouting</li>
                <li>• 8 Hours elopement coverage</li>
                <li>• Full post production cinematic loop</li>
                <li>• Offline copyable visual assets</li>
              </ul>
            </div>
            <a href="#booking-section" className="mt-6 w-full text-center py-2 bg-stone-850 text-white rounded-lg text-xs font-semibold hover:bg-stone-900 transition-colors cursor-pointer block">
              Inquire Now
            </a>
          </div>
        </div>
      </section>

      {/* DYNAMIC BOOKING & ROMANTIC INQUIRY FORM */}
      <section id="booking-section" className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-stone-200 dark:border-stone-800 z-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 text-left">
            <span className="text-[10px] font-mono tracking-[0.45em] text-[#C5A880] uppercase mb-2 block font-bold">
              LET'S START PLANNING
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-white font-light tracking-wide leading-tight">
              Tell us your <br />
              <span className="font-serif italic font-extralight text-[#A88A60]" style={{ fontFamily: 'Cormorant Garamond' }}>Love Story & Concept.</span>
            </h3>
            <p className="text-xs text-stone-500 mt-4 leading-relaxed max-w-sm">
              We travel globally capturing elopements and weddings of couples who live with continuous adventure. Inquire today, and let's craft a timeless visual legacy.
            </p>
            <div className="mt-6 p-4 border-l-2 border-[#C5A880] bg-stone-100/50 dark:bg-stone-950 text-xs italic font-serif">
              "We took a leap and booked Sabrina and Manuel for Seceda spires—the resulting film and frame keepsakes feel like an absolute dreamscape." <br />
              <span className="text-[10px] font-mono uppercase tracking-widest mt-2 block not-italic font-bold text-stone-500">
                — Elena & Lucas, Seceda Wedding
              </span>
            </div>
          </div>

          {/* Consultation questionnaire forum */}
          <div className="lg:col-span-7">
            {bookingSubmitted ? (
              <div className="p-8 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-300/40 text-center space-y-4">
                <Check className="w-10 h-10 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full mx-auto" />
                <h4 className="font-serif text-xl font-bold dark:text-[#FAF7F2]">
                  Consultation Request Dispatched!
                </h4>
                <p className="text-xs text-stone-550 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-stone-800 dark:text-white">{bookingName || 'beloved couple'}</strong>. We are checking the calendar dates for <strong className="text-[#A88A60]">{bookingDate || 'your dream shoot'}</strong> and will reply back within 24 hours. We can't wait to collect your moments!
                </p>
                <button
                  type="button"
                  onClick={() => { setBookingSubmitted(false); setBookingName(''); }}
                  className="bg-stone-800 text-white text-xs px-5 py-2 rounded"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setBookingSubmitted(true);
                }} 
                className={`p-6 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                  themeMode === 'creme' ? 'bg-white border-stone-250 shadow-md' : 'bg-stone-900 border-stone-800'
                }`}
              >
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1">Your Names</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Elena & Lucas" 
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none ${
                      themeMode === 'creme' ? 'bg-stone-50 border border-stone-250' : 'bg-stone-950 border border-stone-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1">Your Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="gmail@example.com" 
                    className={`w-full rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none ${
                      themeMode === 'creme' ? 'bg-stone-50 border border-stone-250' : 'bg-stone-950 border border-stone-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1">Proposed Shooting Dates</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. October 15, 2026" 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className={`w-full rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none ${
                      themeMode === 'creme' ? 'bg-stone-50 border border-stone-250' : 'bg-stone-950 border border-stone-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1">Dream Destination Location</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. South Tyrol Dolomites" 
                    className={`w-full rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#C5A880] focus:outline-none ${
                      themeMode === 'creme' ? 'bg-stone-50 border border-stone-250' : 'bg-stone-950 border border-stone-800 text-white'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-mono uppercase tracking-widest mb-1">Tell us about your connection & vision</label>
                  <textarea 
                    required
                    placeholder="Share how you met, your dream elopement plans, or spontaneous trail ideas..." 
                    className={`w-full rounded-lg p-3 text-xs focus:ring-1 focus:ring-[#C5A880] h-24 resize-none focus:outline-none ${
                      themeMode === 'creme' ? 'bg-stone-50 border border-stone-250' : 'bg-stone-950 border border-stone-800 text-white'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-stone-850 hover:bg-stone-900 dark:bg-[#C5A880] dark:hover:bg-[#A88A60] text-white dark:text-black font-space font-medium uppercase text-xs tracking-[0.25em] py-3 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Send Brief Inquiry Request
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Bottom Footer Credits */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-stone-200 dark:border-stone-800 text-center flex flex-col items-center gap-4 relative z-30 opacity-70 text-xs text-stone-500 font-mono">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
          <span className="text-[11px] uppercase tracking-widest">
            MOMENTSAMMLER x LIFELENS CINEMA PLATFORM
          </span>
        </div>
        <p className="text-[10px] leading-relaxed max-w-md font-sans">
          Fine art wedding & adventure cinema story portfolio, inspired by momentsammler.at. Powered by Antigravity creative directors and Google Gemini multi-modal AI screenplay rendering.
        </p>
        <span className="text-[9px] uppercase tracking-widest">
          © 2026 MOMENTSAMMLER. ALL RIGHTS RESERVED.
        </span>
      </footer>

    </div>
  );
}
