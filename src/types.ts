/**
 * Types and interfaces for LifeLens AI (Mani Tralver)
 */

export type MoodType = 'Adventure' | 'Emotional' | 'Nature' | 'Spiritual' | 'Luxury' | 'Fun';

export interface TripDetails {
  name: string;
  tripName: string;
  location: string;
  travelDates: string; // e.g., "7 Days" or "2026"
  mood: MoodType;
  notes?: string;
  musicCategory: string;
}

export interface PhotoItem {
  id: string;
  url: string; // Base64 or Unsplash URL
  name: string;
  description?: string;
}

export interface JourneyChapter {
  id: string;
  title: string;
  description: string;
  photoIds: string[];
}

export interface NarratorSegment {
  photoId: string;
  subtitle: string;
  narration: string;
  effect: 'ken-burns-in' | 'ken-burns-out' | 'pan-left' | 'pan-right';
  filter: 'vintage' | 'warm-gold' | 'cool-nordic' | 'dreamy' | 'cinematic';
  durationSeconds: number; // e.g., 5 to 8 seconds per photo
}

export interface MapPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface JourneyStatItem {
  label: string;
  value: string;
  icon: string;
}

export interface Screenplay {
  movieTitle: string;
  soundtrackUrl?: string;
  chapters: JourneyChapter[];
  segments: NarratorSegment[];
  mapRoute: MapPoint[];
  stats: JourneyStatItem[];
  overallNarration: string;
}

export interface Soundtrack {
  id: string;
  name: string;
  category: string;
  url: string;
  volume: number; // base volume 0.0 - 1.0
}
