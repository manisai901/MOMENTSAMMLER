import React from 'react';
import { TripDetails, PhotoItem } from '../types';
import { Sparkles, Compass, Mountain, Heart } from 'lucide-react';

export interface PresetAlbum {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  duration: string;
  mood: 'Spiritual' | 'Adventure' | 'Nature' | 'Luxury' | 'Fun' | 'Emotional';
  musicCategory: string;
  description: string;
  coverImage: string;
  photos: PhotoItem[];
}

export const PRESET_ALBUMS: PresetAlbum[] = [
  {
    id: 'kedarnath',
    title: 'Kedarnath Spiritual Hike',
    subtitle: 'Expedition into the Himalayas',
    location: 'Kedarnath Valley, Uttarakhand, India',
    duration: '10 Days',
    mood: 'Spiritual',
    musicCategory: 'Spiritual',
    description: 'An inspirational journey climbing past snowy ridges, ancient temples, and misty mountain ranges to find peace.',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=700',
    photos: [
      {
        id: 'keda-1',
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=700',
        name: 'The Gateway Peak',
        description: 'First panoramic vista of the snowy Himalayan peaks cutting through the clouds.'
      },
      {
        id: 'keda-2',
        url: 'https://images.unsplash.com/photo-1598371383344-99dc779bd46a?q=80&w=700',
        name: 'The Sacred Temple Stone',
        description: 'Detail of timeless stone pillars and prayers carved into ancient structures.'
      },
      {
        id: 'keda-3',
        url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=700',
        name: 'The Forest Trail',
        description: 'Hiking beneath the canopy of tall green pines as morning mist descends.'
      },
      {
        id: 'keda-4',
        url: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=700',
        name: 'High Ridge Reflections',
        description: 'Standing on the edge of the cliff, overlooking endless waves of distant misty hills.'
      },
      {
        id: 'keda-5',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=700',
        name: 'Summit Twilight',
        description: 'Under a pristine field of stars, a golden temple fire glows in the high valley.'
      },
      {
        id: 'keda-6',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700',
        name: 'Inner Sanctuary Peace',
        description: 'Sun filtering through high ridges, coloring the landscape in liquid golden hues.'
      }
    ]
  },
  {
    id: 'kerala',
    title: 'Kerala Backwaters Ride',
    subtitle: 'Lush natural rivers & valleys',
    location: 'Kerala Backwaters & Munnar, India',
    duration: '7 Days',
    mood: 'Nature',
    musicCategory: 'Travel Vibes',
    description: 'An emotional escape through tea fields, lakes, and palm trees in God’s own country.',
    coverImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=700',
    photos: [
      {
        id: 'kera-1',
        url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=700',
        name: 'Floating Houseboat',
        description: 'Traditional wood-carved houseboat gliding over mirror-like silent lake water.'
      },
      {
        id: 'kera-2',
        url: 'https://images.unsplash.com/photo-1543731068-7e0f5beff43a?q=80&w=700',
        name: 'Tea Plantation Hills',
        description: 'Lush green tea carpets hugging the rolling contours of Munnar mountains.'
      },
      {
        id: 'kera-3',
        url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=700',
        name: 'Whispering Palm River',
        description: 'Golden hour lights hitting the palm leaves standing beside river channels.'
      },
      {
        id: 'kera-4',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=700',
        name: 'Hidden Forest Cascade',
        description: 'Water crashing over mossy stones deep in the silent tropical forest.'
      },
      {
        id: 'kera-5',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=700',
        name: 'Jungle Sunrise Glow',
        description: 'Brilliant sunbeams cutting through forest humidity, creating divine glowing tracks.'
      }
    ]
  },
  {
    id: 'rajasthan',
    title: 'Rajasthan Royal Heritage',
    subtitle: 'Desert forts and palaces',
    location: 'Jaisalmer & Jaipur, India',
    duration: '5 Days',
    mood: 'Luxury',
    musicCategory: 'Cinematic Orchestra',
    description: 'A grand exploration of golden desert forts, camel caravans, and illuminated palace corridors.',
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=700',
    photos: [
      {
        id: 'raj-1',
        url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=700',
        name: 'Golden Fort Walls',
        description: 'Old sandstone ramparts of the desert fort standing defiant under a blue sky.'
      },
      {
        id: 'raj-2',
        url: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=700',
        name: 'Camel Trek in Thar',
        description: 'Caravans moving across high golden sand ripples under a warm orange sunset.'
      },
      {
        id: 'raj-3',
        url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=700',
        name: 'Royal Heritage Gateway',
        description: 'Ornate hand-carved stone pillars framing majestic palace gateways.'
      },
      {
        id: 'raj-4',
        url: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=700',
        name: 'Palace Windows View',
        description: 'Symmetric jaali work windows overlooking the glowing city roofs.'
      },
      {
        id: 'raj-5',
        url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=700',
        name: 'Courtyard Lanterns',
        description: 'Warm brass lamps lighting up private lake palace courtyard at twilight.'
      }
    ]
  },
  {
    id: 'dolomites',
    title: 'Dolomites Intimate Wedding',
    subtitle: 'Romantic Editorial Love Story',
    location: 'Seceda Peaks, South Tyrol, Italy',
    duration: '3 Days',
    mood: 'Emotional',
    musicCategory: 'Emotional Piano',
    description: 'An elegant, atmospheric elopement under soaring dolomitic spires, capturing unposed laughter, tearful twilight vows, and sheer cinematic romance.',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=700',
    photos: [
      {
        id: 'dolo-1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=700',
        name: 'The Golden Vows',
        description: 'Deep heartfelt wedding vows spoken beneath high limestone cliffs bathed in golden dust.'
      },
      {
        id: 'dolo-2',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=700',
        name: 'Warm Sunset Waltz',
        description: 'Spontaneous first waltz over green alpine grass as twilight sets the sky ablaze.'
      },
      {
        id: 'dolo-3',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=700',
        name: 'Candid Radiance',
        description: 'Raw, unscripted happiness and tears captured under soft, eye-safe backlighting.'
      },
      {
        id: 'dolo-4',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=700',
        name: 'Wild Alpine Escape',
        description: 'Hand in hand running freely below giant serrated spires as morning wind rises.'
      },
      {
        id: 'dolo-5',
        url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=700',
        name: 'Twilight Fairy Corridor',
        description: 'The elegant banquet reception sparkling with delicate crystal goblets and candle glows.'
      }
    ]
  }
];

interface PresetSelectorProps {
  onSelect: (preset: PresetAlbum) => void;
  activeId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelect, activeId }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-gold" />
        <h3 className="font-space text-lg font-medium text-white tracking-wide">
          Select From Premium Curated Director Presets
        </h3>
      </div>
      <p className="text-zinc-400 text-xs mb-5 font-sans leading-relaxed">
        Quickly test with our beautiful collections of copyright-free scenery photographs, complete with structured geolocation trails and travel metadata.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_ALBUMS.map((album) => {
          const isActive = album.id === activeId;
          return (
            <button
              key={album.id}
              type="button"
              onClick={() => onSelect(album)}
              className={`group flex flex-col text-left rounded-2xl overflow-hidden transition-all duration-300 border bg-zinc-950/40 backdrop-blur-md cursor-pointer ${
                isActive
                  ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-[1.02]'
                  : 'border-zinc-800 hover:border-zinc-700/80 hover:scale-[1.01]'
              }`}
            >
              {/* Cover Image */}
              <div className="relative w-full h-36 overflow-hidden">
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.7]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md-md px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest text-gold border border-gold/20">
                  {album.mood}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90">
                  <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/80">
                    {album.photos.length} Photos
                  </span>
                </div>
              </div>

              {/* Album Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-space text-sm font-semibold text-white tracking-wide leading-tight group-hover:text-gold transition-colors duration-300">
                    {album.title}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                    {album.subtitle}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2 font-sans line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900 mt-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>📍 {album.location.split(',')[0]}</span>
                  <span>⏱️ {album.duration}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
