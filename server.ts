import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Max payload support for uploading travel images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini client and handle lazy initialization
  const isApiKeyConfigured = !!process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (isApiKeyConfigured) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // 1. Analyze / Screenplay Generation API
  app.post("/api/analyze", async (req, res) => {
    try {
      const { name, tripName, location, travelDates, mood, notes, photos } = req.body;

      // Extract brief description or use fallback context if descriptions are available
      const photoDescriptions = (photos || []).map((p: any, i: number) => {
        return `Photo ${i + 1}: ${p.name || ''} - ${p.description || 'Scenic Moment'}`;
      }).join("\n");

      // Set up the creative director system instructions
      const systemInstruction = `You are an elite, Academy Award-winning travel documentary director and professional narrator for Netflix and National Geographic.
Your goal is to write a deep, emotional, and inspiring travel documentary movie script called a "Director's Cut Screenplay" based on the traveler's trip details and photo descriptions.

You must output a single, strictly valid JSON structure mirroring this TypeScript structure:
{
  "movieTitle": string, // Format: e.g. "The Journey of [Name]" or "Legends of [TripName]"
  "chapters": [
    { "id": string, "title": string, "description": string, "photoIds": string[] }
  ],
  "segments": [
    { "photoId": string, "subtitle": string, "narration": string, "effect": "ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right", "filter": "vintage" | "warm-gold" | "cool-nordic" | "dreamy" | "cinematic", "durationSeconds": number }
  ],
  "mapRoute": [
    { "name": string, "lat": number, "lng": number }
  ],
  "stats": [
    { "label": string, "value": string, "icon": string }
  ],
  "overallNarration": string // Cohesive summary block of narration
}

Requirements:
1. "segments": Map each photoId provided in the photos array. Ensure the narration segment is captivating, cinematic, and perfectly aligned with the chosen atmosphere of ${mood}.
Narrator voice must feel immersive and inspiring (TED Style / National Geo style).
Ensure durationSeconds is between 6 and 9 seconds for each segment.
2. "chapters": Divide the photos into 4-5 core chronological narrative chapters: e.g., "The Calling", "Into the Wild", "The Silent Ascent", "Moment of Truth", "Reflection". Assign the correct photo ids to each chapter.
3. "mapRoute": Generate a realistic list of 3-5 visual waypoint locations with latitudes/longitudes representing a scenic flow within ${location || 'India'} (e.g. if Kedarnath/Uttarakhand: Delhi, Haridwar, Rishikesh, Kedarnath).
4. "stats": Build 3-4 interesting statistics, e.g. "Chapters Made", "Moments Captured", "Est. Distance (km)", "Elevation (ft)" or "Spiritual Level (max)" to show off in the statistics board. Make the icons standard lucide string icons (e.g., "MapPin", "Compass", "Mountain", "Camera", "Flame", "Music", "Heart").

Tone guidelines under Mood parameter:
- 'Adventure': Thrilling, courage-filled, epic, soaring strings, sweeping peaks.
- 'Emotional': Soft, raw, deeply heartfelt, moving piano notes, quiet spaces.
- 'Nature': Earthy, quiet awe, gentle breeze, birds, river-flows, focus on elements.
- 'Spiritual': Serene, ancient chants background, echoes, eternal peace, temple bells, introspection.
- 'Luxury': Lavish, elegant fonts, sweeping drone views, golden accent vibes, slow pacing.
- 'Fun': Kinetic typography, high energy, laughing voices, memories, spontaneous.`;

      // Prompt text for the screenplay generator
      const prompt = `Write a cinematic, highly descriptive travel screenplay based on these details:
Traveler Name: ${name || "Manikanta Sai"}
Trip Focus Name: ${tripName || "Kedarnath Expedition"}
Location Destination: ${location || "India"}
Duration / Travel Dates: ${travelDates || "365"}
Mood Style: ${mood || "Adventure"}
Notes: ${notes || "No special note constraints."}

Photos list to analyze/narrate (assign these IDs to your segments):
${JSON.stringify((photos || []).map((p: any) => ({ id: p.id, name: p.name, description: p.description })))}

Please arrange these photos chronologically into 4 to 5 chapters and create an inspiring script.`;

      let screenplayResponse: any;

      if (ai) {
        // Run proper Gemini model generation
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                movieTitle: { type: Type.STRING },
                overallNarration: { type: Type.STRING },
                chapters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      photoIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["id", "title", "description", "photoIds"]
                  }
                },
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      photoId: { type: Type.STRING },
                      subtitle: { type: Type.STRING },
                      narration: { type: Type.STRING },
                      effect: { type: Type.STRING },
                      filter: { type: Type.STRING },
                      durationSeconds: { type: Type.INTEGER }
                    },
                    required: ["photoId", "subtitle", "narration", "effect", "filter", "durationSeconds"]
                  }
                },
                mapRoute: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["name", "lat", "lng"]
                  }
                },
                stats: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      icon: { type: Type.STRING }
                    },
                    required: ["label", "value", "icon"]
                  }
                }
              },
              required: ["movieTitle", "chapters", "segments", "mapRoute", "stats", "overallNarration"]
            }
          }
        });

        const textContent = response.text;
        if (textContent) {
          screenplayResponse = JSON.parse(textContent);
        } else {
          throw new Error("Empty response from AI capability.");
        }
      } else {
        // GRACEFUL MULTI-MOOD CREATIVE FALLBACK
        // This ensures the application works perfectly even if the API Key is not set, or when testing offline, providing incredible instant value!
        console.warn("GEMINI_API_KEY is not defined. Initiating local creative screenplay engine...");
        
        const photoIds = (photos || []).map((p: any) => p.id);
        
        // Custom narration blocks based on mood
        const moodTexts: Record<string, { title: string; narrations: string[]; stats: any[]; places: { name: string; lat: number; lng: number }[] }> = {
          Spiritual: {
            title: `The Sacred Path of ${name || "Manikanta"}`,
            narrations: [
              "Every journey begins with a calling, but some are etched into eternity before we even take our first step.",
              "Into the silence of ancient valleys, we walked guided not by maps, but by a quiet inner homing signal.",
              "As dawn broke over the peaks, the bells echoed off mountains, reminding us how tiny we are in this vast infinite cosmic design.",
              "There are quiet moments of absolute surrender, where the chill mountain winds carry away years of heavy questions.",
              "We leave behind our footprints, but we carry back parts of the mountains forever fused within our soul."
            ],
            stats: [
              { label: "Spiritual Chapter", value: "5 Active", icon: "Flame" },
              { label: "Altitude Crossed", value: "11,750 ft", icon: "Mountain" },
              { label: "Temples Visited", value: "3 Holy Sites", icon: "Sparkles" },
              { label: "Reflection index", value: "100%", icon: "Heart" }
            ],
            places: [
              { name: "Haridwar Gateway", lat: 29.9457, lng: 78.1642 },
              { name: "Rishikesh Foothills", lat: 30.0869, lng: 78.2676 },
              { name: "Guptkashi valley", lat: 30.5239, lng: 79.0784 },
              { name: "Kedarnath Sanctuary", lat: 30.7352, lng: 79.0669 }
            ]
          },
          Adventure: {
            title: `The Epic Expedition of ${name || "Manikanta Sai"}`,
            narrations: [
              "We don't climb mountains to be seen by the world, but rather so we can finally see the world clearly.",
              "The road was rugged, narrow, and suspended over sheer cliffs, but of course, adventure yields no soft paths.",
              "Legs burning, lungs gasping for thin mountain oxygen, we pushed past doubts into the majestic white wilderness.",
              "In that final final stretch, standing tall above the clouds, we felt a surge of raw electricity and accomplishment.",
              "Adventure is not a physical task, but a state of mind where the impossible becomes the playground."
            ],
            stats: [
              { label: "Expedition Chapters", value: "5 Levels", icon: "Compass" },
              { label: "Trail Length", value: "22 Kilometers", icon: "MapPin" },
              { label: "Adrenaline Burst", value: "True Peak", icon: "Zap" },
              { label: "Adventure Score", value: "9.8/10", icon: "Flame" }
            ],
            places: [
              { name: "Basecamp Entry", lat: 30.0150, lng: 78.1120 },
              { name: "Srinagar Crossing", lat: 30.2223, lng: 78.7845 },
              { name: "Gaurikund Rapids", lat: 30.6558, lng: 79.0284 },
              { name: "Kedarnath Ridge", lat: 30.7352, lng: 79.0669 }
            ]
          },
          Nature: {
            title: `Wanderlust: Into the Wild with ${name || "Manikanta"}`,
            narrations: [
              "Look deep into nature, and then you will understand everything better.",
              "The green canopy, the whisper of cold pine needles underfoot, a forest of absolute timeless elegance.",
              "Waterfalls cascaded like tears from heaven, feeding rivers that travel thousands of miles to empty into ocean depths.",
              "The golden light painted the landscape in liquid honey, casting long, peaceful shadows over the earth.",
              "In nature we find a peaceful quietude that society often tries to silence. A return home."
            ],
            stats: [
              { label: "Nature Sanctuary", value: "Unexplored", icon: "Leaf" },
              { label: "Species spotted", value: "14 Diverse", icon: "Compass" },
              { label: "Forest Coverage", value: "85% Dense", icon: "Mountain" },
              { label: "Wilderness Days", value: "365 Trail", icon: "Calendar" }
            ],
            places: [
              { name: "Pristine Valley Gate", lat: 20.5937, lng: 78.9629 },
              { name: "Cascading Streams", lat: 21.1458, lng: 79.0882 },
              { name: "Sunset Lookout", lat: 22.3511, lng: 78.6677 },
              { name: "Sacred Summit", lat: 23.2599, lng: 77.4126 }
            ]
          },
          Emotional: {
            title: `Collecting Moments: Love Story of ${name || "Mandy & Manikanta"}`,
            narrations: [
              "We collect moments, not because they last forever, but because in those short seconds, eternity feels tangible.",
              "Beneath the giant dolomite peaks, we whispered vows that need no amplifiers, just the absolute silence of the summits.",
              "A warm gaze, a subtle squeeze of the hand, a quiet tear sliding down—this is where real film poetry resides.",
              "They ran together through wildflowers, laughing with simple, raw, and completely unscripted abandon.",
              "As the golden lantern light bathed the rustic lodge, they danced silently, holding onto the best chapter of their lives."
            ],
            stats: [
              { label: "Romantic Chapter", value: "5 Composed", icon: "Heart" },
              { label: "Heartbeats Cached", value: "Infinite Vibes", icon: "Sparkles" },
              { label: "Shots Graded", value: "Anamorphic", icon: "Camera" },
              { label: "Tender Core Rating", value: "100%", icon: "Heart" }
            ],
            places: [
              { name: "Verona Romance Hall", lat: 45.4384, lng: 10.9916 },
              { name: "Dolomites Foothills", lat: 46.5492, lng: 11.9565 },
              { name: "Seceda Crest", lat: 46.5986, lng: 11.7289 },
              { name: "Alpine Lantern Lodge", lat: 46.6120, lng: 11.8430 }
            ]
          },
          Luxury: {
            title: `Chic Heritage: Visual Luxury with ${name || "Manikanta Sai"}`,
            narrations: [
              "True luxury is not about excess. It is the exquisite pacing of breathing in absolute silence and timeless elegance.",
              "Sunlight danced across ancient sandstone columns, painting the marble corridors in royal champagne liquid gold.",
              "Resting over terraces floating above blue mountain lakes, sipping spiced tea amidst historic grandeur.",
              "The desert wind whispered legends of kings as the sun set behind towering forts, bathing everything in velvet peach.",
              "We dined beneath a canopy of thousands of crystal stars, celebrating a life crafted with pure mindfulness."
            ],
            stats: [
              { label: "Heritage Level", value: "Royal Prestige", icon: "Award" },
              { label: "Shutter Clicks", value: "Fine Art Print", icon: "Camera" },
              { label: "Golden Hours Seen", value: "100% Sunburst", icon: "Flame" },
              { label: "Elegance Quotient", value: "Aesthetic Core", icon: "Sparkles" }
            ],
            places: [
              { name: "Jaipur Amber Gate", lat: 26.9855, lng: 75.8513 },
              { name: "Jodhpur Blue Views", lat: 26.2389, lng: 73.0243 },
              { name: "Thar Golden Camps", lat: 26.9157, lng: 70.9083 },
              { name: "Lake Palace Terrace", lat: 24.5764, lng: 73.6806 }
            ]
          }
        };

        // Select fallback based on mood or default to Adventure
        const content = moodTexts[mood] || moodTexts["Adventure"];

        // Construct chunks
        const chapters = [
          { id: "ch1", title: "Chapter 1: The Calling", description: "Stepping into the unknown, crossing boundaries.", photoIds: photoIds.slice(0, Math.ceil(photoIds.length * 0.25)) },
          { id: "ch2", title: "Chapter 2: The Ascent", description: "Navigating deep trails, rivers and scaling heights.", photoIds: photoIds.slice(Math.ceil(photoIds.length * 0.25), Math.ceil(photoIds.length * 0.5)) },
          { id: "ch3", title: "Chapter 3: Hidden Realms", description: "Unexpected spiritual temples and panoramic views.", photoIds: photoIds.slice(Math.ceil(photoIds.length * 0.5), Math.ceil(photoIds.length * 0.75)) },
          { id: "ch4", title: "Chapter 4: The Peak Highlight", description: "The ultimate peak of the travel journey.", photoIds: photoIds.slice(Math.ceil(photoIds.length * 0.75), photoIds.length - 1) },
          { id: "ch5", title: "Chapter 5: Whispering Winds", description: "Reflection and permanent state of self-realization.", photoIds: photoIds.slice(photoIds.length - 1) }
        ].filter(ch => ch.photoIds.length > 0);

        const effects: ("ken-burns-in" | "ken-burns-out" | "pan-left" | "pan-right")[] = ["ken-burns-in", "ken-burns-out", "pan-left", "pan-right"];
        const filters: ("vintage" | "warm-gold" | "cool-nordic" | "dreamy" | "cinematic")[] = ["cinematic", "warm-gold", "dreamy", "cool-nordic", "vintage"];

        const segments = photoIds.map((pid, idx) => {
          const textIdx = idx % content.narrations.length;
          const chapterIdx = chapters.findIndex(ch => ch.photoIds.includes(pid));
          const chapterTitle = chapterIdx >= 0 ? chapters[chapterIdx].title : "Moments";
          
          return {
            photoId: pid,
            subtitle: `${location || 'India'} - Block ${idx + 1}`,
            narration: content.narrations[textIdx],
            effect: effects[idx % effects.length],
            filter: filters[idx % filters.length],
            durationSeconds: 7
          };
        });

        screenplayResponse = {
          movieTitle: content.title,
          chapters,
          segments,
          mapRoute: content.places,
          stats: content.stats,
          overallNarration: "A travel documentary reflecting Manikanta Sai\'s grand trail adventure. " + content.narrations.join(" ")
        };
      }

      return res.json({
        success: true,
        screenplay: screenplayResponse
      });

    } catch (err: any) {
      console.error("AI script generation failed:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Fail during creative screenplay production"
      });
    }
  });

  // Serve static assets in production, hook up Vite dev middle-layer in dev mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Activating live developer Vite server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving compiled static assets from client dist folder...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LifeLens AI (Mani Tralver) Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
