/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Clock, Info, History, Landmark, Camera, Utensils, 
  Music, Calendar, Map as MapIcon, ChevronRight, Star, 
  Waves, Heart, Coffee, X, Globe, BookOpen, MessageSquare,
  Send, Trash2, Sun, Cloud, CloudRain, Languages, Bookmark,
  Navigation, Compass, Ticket, User, Phone, Mail, CheckCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Location {
  id: number;
  name: string;
  x: string;
  y: string;
  description: string;
  longDesc: string;
  story: string;
  image: string;
  category: string;
  coordinates?: { lat: number; lng: number };
}

export default function App() {
  const [activeLocation, setActiveLocation] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [galleryTab, setGalleryTab] = useState<string>('food');
  const [isLiveMap, setIsLiveMap] = useState(false);
  const [activeTourPart, setActiveTourPart] = useState(0);
  const [is360Mode, setIs360Mode] = useState(false);
  
  // New Features State
  const [itinerary, setItinerary] = useState<Location[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [weather, setWeather] = useState({ temp: 22, condition: 'Sunny' });
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);
  
  // New State for Booking and Feedback
  const [bookingData, setBookingData] = useState({ date: '', tickets: 1, type: 'standard' });
  const [feedbackData, setFeedbackData] = useState({ name: '', email: '', phone: '', rating: 5, comment: '' });
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isFeedbackSuccess, setIsFeedbackSuccess] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const toggleItinerary = (loc: Location) => {
    setItinerary(prev => {
      const exists = prev.find(l => l.id === loc.id);
      if (exists) return prev.filter(l => l.id !== loc.id);
      return [...prev, loc];
    });
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user' as const, text: userInput }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userInput,
        config: {
          systemInstruction: "You are 'Centurion Marcus', a wise and friendly Roman historian and tour guide. You speak with a touch of ancient gravitas but remain helpful and modern. You know everything about Rome's history, food, and culture. Keep responses concise and engaging.",
        }
      });
      
      setChatMessages([...newMessages, { role: 'model' as const, text: response.text || "Forgive me, traveler, my scrolls are dusty. Could you repeat that?" }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages([...newMessages, { role: 'model' as const, text: "The gods are silent today. (API Error)" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const romanStories = [
    {
      title: "The Flavian Inauguration",
      content: "In 80 AD, Emperor Titus inaugurated the Colosseum with 100 days of games, during which over 9,000 wild animals were killed.",
      tag: "History",
      image: "https://picsum.photos/seed/colosseum-history/600/400"
    },
    {
      title: "The Naval Battles",
      content: "In its early years, the arena could be flooded to stage 'Naumachia'—mock sea battles with real ships and thousands of combatants.",
      tag: "Spectacle",
      image: "https://picsum.photos/seed/colosseum-sea/600/400"
    },
    {
      title: "The Christian Martyrdom",
      content: "While debated by historians, the Colosseum has long been honored as a site where early Christians were martyred for their faith.",
      tag: "Legacy",
      image: "https://picsum.photos/seed/colosseum-faith/600/400"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Good Friday Procession",
      date: "April 18, 2025",
      type: "Cultural",
      desc: "The Pope leads the Way of the Cross (Via Crucis) at the Colosseum, a tradition dating back to the 18th century."
    },
    {
      id: 2,
      title: "Anniversary of Completion",
      date: "June 21, 2025",
      type: "Historical",
      desc: "Celebrating the 1,945th anniversary of the Flavian Amphitheatre's inauguration in 80 AD."
    },
    {
      id: 3,
      title: "Summer Night Openings",
      date: "July - August 2025",
      type: "Tourism",
      desc: "Special night tours of the underground hypogeum and arena floor under the Roman moonlight."
    }
  ];

  const romanFacts = [
    { label: "Capacity", value: "The Colosseum could hold between 50,000 and 80,000 spectators." },
    { label: "Construction", value: "Built of travertine limestone, tuff, and brick-faced concrete." },
    { label: "Name", value: "Originally known as the Flavian Amphitheatre (Amphitheatrum Flavium)." },
    { label: "Purpose", value: "Hosted gladiatorial contests, animal hunts, and even mock sea battles." }
  ];

  const galleryData = {
    food: {
      title: "Spectator Snacks",
      content: "Ancient Romans didn't just watch the games; they ate! Excavations have found seeds of figs, grapes, cherries, and walnuts, along with bones of animals consumed during the long days of spectacles.",
      image: "https://picsum.photos/seed/colosseum-food/1200/800",
      highlights: ["Dried Figs", "Walnuts", "Grapes", "Olives", "Wine"]
    },
    sea: {
      title: "Flooding the Arena",
      content: "The engineering required to flood the arena for mock sea battles was immense. Lead pipes and complex drainage systems allowed the Romans to transform the dusty floor into a nautical stage in hours.",
      image: "https://picsum.photos/seed/colosseum-water/1200/800",
      highlights: ["Naumachia", "Lead Pipes", "Drainage", "Galleys", "Titus"]
    },
    tradition: {
      title: "Gladiatorial Rites",
      content: "The games were more than sport; they were deeply tied to Roman concepts of virtue (virtus) and honor. The 'Munera' originated as funeral games to honor the deceased.",
      image: "https://picsum.photos/seed/colosseum-gladiator/1200/800",
      highlights: ["Virtus", "Munera", "Honor", "Rituals", "Sacrifice"]
    },
    history: {
      title: "Imperial Power",
      content: "The Colosseum was a political tool, a gift from the Flavian dynasty to the people of Rome. It demonstrated the emperor's wealth, power, and ability to provide 'bread and circuses'.",
      image: "https://picsum.photos/seed/colosseum-empire/1200/800",
      highlights: ["Vespasian", "Titus", "Flavians", "Propaganda", "Bread & Circuses"]
    },
    culture: {
      title: "Architectural Legacy",
      content: "The Colosseum's design—with its arches, vaults, and tiered seating—has influenced every stadium built since. It remains the ultimate blueprint for mass entertainment architecture.",
      image: "https://picsum.photos/seed/colosseum-arch/1200/800",
      highlights: ["Arches", "Travertine", "Concrete", "Blueprints", "Influence"]
    }
  };

  const romeLocations: Location[] = [
    { 
      id: 1, 
      name: "The Arena Floor", 
      x: "50%", 
      y: "50%", 
      category: "Action",
      description: "The stage of legends.",
      longDesc: "The central stage where gladiators fought and spectacles unfolded. Once covered in sand to soak up blood, it is now partially reconstructed to show the hypogeum below.",
      story: "The word 'arena' comes from the Latin 'harena', meaning sand.",
      image: "https://picsum.photos/seed/colosseum-arena-poi/800/600",
      coordinates: { lat: 41.8902, lng: 12.4922 }
    },
    { 
      id: 2, 
      name: "The Hypogeum", 
      x: "50%", 
      y: "55%", 
      category: "Engineering",
      description: "The underground backstage.",
      longDesc: "A complex network of tunnels and cages where animals and gladiators were kept before being hoisted into the arena via sophisticated elevators.",
      story: "There were 80 vertical shafts used to lift scenery and animals into the arena.",
      image: "https://picsum.photos/seed/colosseum-hypogeum-poi/800/600"
    },
    { 
      id: 3, 
      name: "The Emperor's Box", 
      x: "50%", 
      y: "40%", 
      category: "Power",
      description: "The seat of ultimate authority.",
      longDesc: "The 'Pulvinar' was the royal box where the Emperor and his family sat, enjoying the best view and deciding the fate of fallen gladiators with a thumb gesture.",
      story: "The 'thumbs down' gesture actually meant 'swords up' (to kill), while 'thumbs up' meant 'swords down' (to spare).",
      image: "https://picsum.photos/seed/colosseum-box-poi/800/600"
    },
    { 
      id: 4, 
      name: "The Arch of Constantine", 
      x: "75%", 
      y: "45%", 
      category: "Victory",
      description: "A triumphal gateway.",
      longDesc: "Located just outside the Colosseum, this massive arch celebrates Constantine's victory at the Battle of Milvian Bridge in 312 AD.",
      story: "It was built using many pieces 'recycled' from older monuments of Trajan, Hadrian, and Marcus Aurelius.",
      image: "https://picsum.photos/seed/arch-constantine/800/600"
    },
    { 
      id: 5, 
      name: "The Gladiator Gate", 
      x: "30%", 
      y: "50%", 
      category: "Tradition",
      description: "The entrance of the brave.",
      longDesc: "The 'Porta Libitinaria' was the gate through which the dead were carried out, named after Libitina, the goddess of funerals.",
      story: "Gladiators entered through the 'Porta Triumphalis' on the opposite side.",
      image: "https://picsum.photos/seed/gladiator-gate/800/600"
    }
  ];

  const categories = ['All', ...Array.from(new Set(romeLocations.map(l => l.category)))];
  const filteredLocations = filter === 'All' ? romeLocations : romeLocations.filter(l => l.category === filter);

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-[#5A5A40] selection:text-white overflow-x-hidden">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-6 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          <span className="font-serif italic text-2xl text-white mix-blend-difference">Colosseum</span>
        </div>
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <Sun size={14} className="text-gold" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Rome: {weather.temp}°C {weather.condition}</span>
          </div>
          <button 
            onClick={() => setIsItineraryOpen(true)}
            className="relative p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white hover:text-ink transition-all shadow-lg"
          >
            <Bookmark size={16} />
            {itinerary.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#f5f2ed]">
                {itinerary.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen overflow-hidden flex items-center">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://picsum.photos/seed/rome-colosseum/1920/1080" 
            alt="The Colosseum at Sunset" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-gold"></div>
                <span className="text-gold uppercase tracking-[0.5em] text-[10px] font-bold">Amphitheatrum Flavium</span>
              </div>
              <h1 className="text-white font-serif text-7xl md:text-[10rem] font-bold leading-[0.85] mb-8">
                THE <br /> <span className="italic text-gold">COLOSSEUM</span>
              </h1>
              <div className="flex flex-col md:flex-row gap-12 items-start md:items-center mt-12">
                <p className="text-white/80 max-w-md text-lg font-light leading-relaxed border-l border-white/20 pl-8">
                  Step into the greatest arena of the ancient world. A masterpiece of engineering that has defined the Roman spirit for nearly 2,000 years.
                </p>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white text-ink uppercase tracking-widest text-[10px] font-bold rounded-full hover:bg-gold hover:text-white transition-all shadow-2xl"
                  >
                    Explore the Arena
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById('virtual-explorer')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 uppercase tracking-widest text-[10px] font-bold rounded-full hover:bg-white hover:text-ink transition-all"
                  >
                    Virtual Tour
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute right-12 bottom-12 vertical-text hidden lg:block">
          <span className="text-white/20 uppercase tracking-[1em] text-[10px] font-bold">EST. 72 AD — 80 AD</span>
        </div>
      </header>

      {/* Brief Info & Quick Facts Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <span className="text-terracotta uppercase tracking-[0.3em] text-[10px] font-bold mb-4 block">At a Glance</span>
              <h2 className="text-5xl font-serif italic mb-8">An Architectural Marvel</h2>
              <p className="text-ink/70 text-lg leading-relaxed mb-8">
                The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy, just east of the Roman Forum. It is the largest ancient amphitheatre ever built, and is still the largest standing amphitheatre in the world today, despite its age. Construction began under the emperor Vespasian in 72 AD and was completed in 80 AD under his successor and heir, Titus.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {romanFacts.map((fact, i) => (
                  <div key={i} className="p-6 bg-[#f5f2ed] rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-terracotta mb-2">{fact.label}</p>
                    <p className="text-sm text-ink/80 leading-relaxed">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://picsum.photos/seed/col1/400/600" className="w-full h-[300px] object-cover rounded-[30px]" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/col2/400/400" className="w-full h-[200px] object-cover rounded-[30px]" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://picsum.photos/seed/col3/400/400" className="w-full h-[200px] object-cover rounded-[30px]" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/col4/400/600" className="w-full h-[300px] object-cover rounded-[30px]" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colosseum Virtual Explorer - Immersive Section */}
      <section id="virtual-explorer" className="py-32 bg-ink text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://picsum.photos/seed/colosseum-bg/1920/1080" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-24">
            <span className="text-terracotta uppercase tracking-[0.5em] text-[10px] font-bold mb-6 block">Immersive Experience</span>
            <h2 className="text-5xl md:text-8xl font-serif italic mb-8">The Colosseum <br /> <span className="text-white/40">Virtual Explorer</span></h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Explore the Flavian Amphitheatre from the comfort of your home. Journey through the arena floor, the underground tunnels, and the majestic tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative aspect-square rounded-[60px] overflow-hidden shadow-2xl border border-white/10 group">
              <div className="absolute top-8 right-8 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIs360Mode(!is360Mode)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                    is360Mode ? 'bg-terracotta text-white' : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                  }`}
                >
                  <Globe size={24} className={is360Mode ? 'animate-pulse' : ''} />
                </motion.button>
                <span className="absolute top-full right-0 mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40 whitespace-nowrap">
                  {is360Mode ? 'Exit 360°' : 'Enter 360°'}
                </span>
              </div>

              {is360Mode ? (
                <div className="w-full h-full bg-black">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src="https://www.google.com/maps/embed?pb=!4v1710325061234!6m8!1m7!1sCAoSLEFGMVFpcE5mYlVfX19fX19fX19fX19fX19fX19fX19fX19fX19fX18!2m2!1d41.89021!2d12.49223!3f0!4f0!5f0.7820865974627469"
                    className="w-full h-full grayscale contrast-125 brightness-110"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeTourPart}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8 }}
                      src={[
                        "https://picsum.photos/seed/colosseum-arena/1000/1000",
                        "https://picsum.photos/seed/colosseum-hypogeum/1000/1000",
                        "https://picsum.photos/seed/colosseum-tiers/1000/1000",
                        "https://picsum.photos/seed/colosseum-exterior/1000/1000"
                      ][activeTourPart]}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12">
                    <div className="flex gap-2 mb-4">
                      {[0, 1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className={`h-1 flex-1 rounded-full transition-all duration-500 ${activeTourPart === i ? 'bg-terracotta' : 'bg-white/20'}`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs uppercase tracking-widest font-bold text-white/40">Perspective {activeTourPart + 1} of 4</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-12">
              {[
                {
                  title: "The Arena Floor",
                  desc: "Where gladiators once fought for glory. The wooden floor covered in sand (harena) hid a complex world beneath.",
                  icon: <Landmark size={24} />
                },
                {
                  title: "The Hypogeum",
                  desc: "The underground network of tunnels and cages. A sophisticated system of elevators brought beasts and warriors to the surface.",
                  icon: <BookOpen size={24} />
                },
                {
                  title: "The Cavea",
                  desc: "The tiered seating that reflected Roman social hierarchy. From the Emperor's podium to the commoners' top gallery.",
                  icon: <Camera size={24} />
                },
                {
                  title: "The Velarium",
                  desc: "A massive retractable awning that protected spectators from the scorching Roman sun, operated by sailors of the Imperial fleet.",
                  icon: <Waves size={24} />
                }
              ].map((part, i) => (
                <motion.div
                  key={i}
                  onMouseEnter={() => setActiveTourPart(i)}
                  className={`p-8 rounded-[40px] transition-all cursor-pointer border ${
                    activeTourPart === i 
                      ? 'bg-white/10 border-terracotta/30 shadow-xl scale-[1.05]' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex gap-6 items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      activeTourPart === i ? 'bg-terracotta text-white' : 'bg-white/10 text-white/40'
                    }`}>
                      {part.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif mb-3 italic">{part.title}</h4>
                      <p className={`text-sm leading-relaxed transition-opacity ${activeTourPart === i ? 'text-white/80' : 'text-white/40'}`}>
                        {part.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative">
        <div className="absolute top-0 left-0 vertical-text text-[10rem] font-serif font-bold opacity-[0.03] pointer-events-none select-none">
          FLAVIAN ARENA
        </div>
        
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 text-terracotta mb-6">
            <div className="w-12 h-px bg-terracotta"></div>
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold">Historical Legacy</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif mb-10 leading-[1.1] text-balance">
            The World's <br /><span className="italic text-terracotta">Greatest Stage</span>
          </h2>
          <p className="text-xl text-ink/70 leading-relaxed mb-8 font-light">
            Commissioned by Emperor Vespasian of the Flavian dynasty as a gift to the Roman people, the Colosseum was more than just a stadium. It was a sophisticated machine designed to manage crowds, showcase imperial power, and provide the 'bread and circuses' that kept the empire stable.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-serif text-terracotta">80 AD</span>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Completion</span>
            </div>
            <div className="w-px h-12 bg-ink/10"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif text-terracotta">50K+</span>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Spectators</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white">
            <img 
              src="https://picsum.photos/seed/colosseum-detail/800/1000" 
              alt="Colosseum Arches" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-12 -left-12 glass-card p-10 rounded-[32px] shadow-2xl max-w-xs hidden xl:block"
          >
            <p className="font-serif italic text-2xl text-olive leading-tight">"While the Colosseum stands, Rome shall stand."</p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center">
                <History size={14} className="text-terracotta" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">— Venerable Bede</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stories & Legends Bento Grid */}
      <section className="py-32 bg-white roman-grid">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-terracotta uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Myth & Folklore</span>
              <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">Stories & Legends</h2>
            </div>
            <p className="text-ink/60 max-w-xs text-sm leading-relaxed">The stones of Rome don't just speak of history; they whisper legends that have shaped Western civilization.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Story Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 relative h-[500px] rounded-[48px] overflow-hidden group shadow-2xl"
            >
              <img src={romanStories[0].image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent"></div>
              <div className="absolute top-8 left-8">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
                  {romanStories[0].tag}
                </span>
              </div>
              <div className="absolute bottom-12 left-12 right-12">
                <h3 className="text-4xl font-serif text-white mb-4">{romanStories[0].title}</h3>
                <p className="text-white/70 text-lg max-w-xl leading-relaxed">{romanStories[0].content}</p>
              </div>
            </motion.div>

            {/* Side Story Cards */}
            <div className="flex flex-col gap-8">
              {romanStories.slice(1).map((story, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="flex-1 bg-marble p-8 rounded-[40px] border border-ink/5 hover:border-terracotta/20 transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <span className="text-terracotta text-[10px] font-bold uppercase tracking-widest mb-4 block">{story.tag}</span>
                    <h4 className="text-2xl font-serif mb-4 group-hover:text-terracotta transition-colors">{story.title}</h4>
                    <p className="text-ink/60 text-sm leading-relaxed">{story.content}</p>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <BookOpen size={120} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Facts Bento Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            {romanFacts.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-ink text-white group hover:bg-terracotta transition-colors duration-500"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <Info size={18} className="text-white" />
                </div>
                <h5 className="text-xs uppercase tracking-[0.3em] font-bold mb-4 text-white/50 group-hover:text-white/70">{fact.label}</h5>
                <p className="text-sm leading-relaxed text-white/80 group-hover:text-white">{fact.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Pillars Section - Editorial Layout */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 vertical-text text-[8rem] font-serif font-bold opacity-[0.02] pointer-events-none">
          TRADITIO
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-terracotta uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">The Roman Essence</span>
              <h2 className="text-5xl md:text-7xl font-serif italic leading-tight text-balance">Food, Sea & Soul</h2>
            </div>
            <p className="text-ink/60 max-w-xs text-sm leading-relaxed border-l border-terracotta/20 pl-6">
              To understand Rome is to embrace its sensory delights. From the salt of the sea to the richness of the guanciale.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Food */}
            <motion.div 
              whileHover={{ y: -15 }}
              className="group relative h-[700px] rounded-[60px] overflow-hidden shadow-2xl"
            >
              <img src="https://picsum.photos/seed/roman-pasta-vibe/800/1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent"></div>
              <div className="absolute bottom-0 p-12 text-white">
                <div className="w-12 h-12 rounded-full bg-terracotta/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Utensils className="text-terracotta" size={24} />
                </div>
                <h3 className="text-4xl font-serif mb-6 italic">Gastronomy</h3>
                <p className="text-white/70 mb-8 leading-relaxed font-light">The 'Cucina Povera'—where simple ingredients like pecorino and black pepper create masterpieces.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">Carbonara</span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">Cacio e Pepe</span>
                </div>
              </div>
            </motion.div>

            {/* Sea */}
            <motion.div 
              whileHover={{ y: -15 }}
              className="group relative h-[700px] rounded-[60px] overflow-hidden shadow-2xl lg:mt-12"
            >
              <img src="https://picsum.photos/seed/mediterranean-rome/800/1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent"></div>
              <div className="absolute bottom-0 p-12 text-white">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Waves className="text-blue-400" size={24} />
                </div>
                <h3 className="text-4xl font-serif mb-6 italic">The Coast</h3>
                <p className="text-white/70 mb-8 leading-relaxed font-light">Ostia Lido: where the Tiber meets the Tyrrhenian, offering a sunset that has inspired poets for millennia.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">Ostia Antica</span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">Mediterranean</span>
                </div>
              </div>
            </motion.div>

            {/* Tradition */}
            <motion.div 
              whileHover={{ y: -15 }}
              className="group relative h-[700px] rounded-[60px] overflow-hidden shadow-2xl"
            >
              <img src="https://picsum.photos/seed/roman-spirit/800/1200" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent"></div>
              <div className="absolute bottom-0 p-12 text-white">
                <div className="w-12 h-12 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <Heart className="text-red-400" size={24} />
                </div>
                <h3 className="text-4xl font-serif mb-6 italic">La Dolce Vita</h3>
                <p className="text-white/70 mb-8 leading-relaxed font-light">The art of doing nothing—'Dolce Far Niente'—is the secret ingredient to the Roman spirit.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">Aperitivo</span>
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] uppercase font-bold tracking-widest border border-white/10">Piazzas</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* History & Culture - Split Layout */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative bg-ink text-white p-12 md:p-24 flex flex-col justify-center"
        >
          <div className="absolute top-12 left-12 vertical-text text-[10px] font-bold uppercase tracking-[1em] opacity-30">
            CHRONICLES
          </div>
          <div className="max-w-xl mx-auto lg:mx-0">
            <History className="text-terracotta mb-10" size={48} />
            <h3 className="text-5xl md:text-7xl font-serif mb-10 leading-tight">Layers of <br /><span className="italic text-terracotta text-6xl md:text-8xl">History</span></h3>
            <p className="text-white/60 text-xl leading-relaxed mb-12 font-light">
              Rome is a living timeline. From the ruins of the Roman Forum to the Renaissance splendor of the Vatican, every corner reveals a different era of human achievement.
            </p>
            <div className="space-y-8">
              {[
                { year: "753 BC", title: "The Foundation", desc: "Legendary founding by Romulus on the Palatine Hill." },
                { year: "80 AD", title: "Imperial Peak", desc: "Completion of the Colosseum under Emperor Titus." },
                { year: "1506 AD", title: "Renaissance", desc: "Rebuilding of St. Peter's Basilica begins." }
              ].map((item, i) => (
                <div key={i} className="flex gap-8 group">
                  <span className="text-terracotta font-serif text-2xl opacity-50 group-hover:opacity-100 transition-opacity">{item.year}</span>
                  <div>
                    <h4 className="text-xl font-serif mb-2">{item.title}</h4>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative bg-olive text-white p-12 md:p-24 flex flex-col justify-center"
        >
          <div className="absolute top-12 right-12 vertical-text text-[10px] font-bold uppercase tracking-[1em] opacity-30">
            VITALITY
          </div>
          <div className="max-w-xl mx-auto lg:mx-0">
            <Globe className="text-white/50 mb-10" size={48} />
            <h3 className="text-5xl md:text-7xl font-serif mb-10 leading-tight">A Global <br /><span className="italic text-6xl md:text-8xl">Culture</span></h3>
            <p className="text-white/80 text-xl leading-relaxed mb-12 font-light">
              Roman culture is a blend of ancient heritage and modern vitality. It's found in the bustling markets, the silent churches, and the passionate conversations in every piazza.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: <Music size={24} />, title: "Opera & Arts", desc: "Teatro dell'Opera masterpieces." },
                { icon: <BookOpen size={24} />, title: "Literature", desc: "From Virgil to modern poets." },
                { icon: <Camera size={24} />, title: "Cinema", desc: "The legacy of Cinecittà studios." },
                { icon: <Star size={24} />, title: "Fashion", desc: "High-end craftsmanship in Via Condotti." }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition-all">
                  <div className="mb-4 text-white/50">{item.icon}</div>
                  <h5 className="text-lg font-serif mb-2">{item.title}</h5>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3 sticky top-24">
              <span className="text-[#5A5A40] uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Interactive Guide</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 italic">The Colosseum Precinct</h2>
              <p className="text-lg text-[#4a4a4a] leading-relaxed mb-8">
                Explore the area surrounding the Colosseum. Click on the map pins to discover nearby landmarks and their hidden stories.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all ${
                      filter === cat 
                        ? 'bg-[#5A5A40] text-white shadow-md' 
                        : 'bg-[#f5f2ed] text-[#5A5A40] hover:bg-[#e5e1d8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    onMouseEnter={() => setActiveLocation(loc.id)}
                    onMouseLeave={() => setActiveLocation(null)}
                    className={`w-full flex items-center justify-between p-6 rounded-2xl transition-all ${
                      (activeLocation === loc.id || selectedLocation?.id === loc.id) 
                        ? 'bg-[#5A5A40] text-white shadow-xl translate-x-2' 
                        : 'bg-[#f5f2ed] text-[#1a1a1a] hover:bg-[#e5e1d8]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">{loc.category}</span>
                      <span className="font-serif text-xl">{loc.name}</span>
                    </div>
                    <ChevronRight size={20} className={activeLocation === loc.id ? 'opacity-100' : 'opacity-20'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:w-2/3 w-full aspect-[4/3] relative bg-[#e5e1d8] rounded-[40px] shadow-2xl overflow-hidden border-8 border-white">
              <div className="absolute top-6 right-6 z-20">
                <button 
                  onClick={() => setIsLiveMap(!isLiveMap)}
                  className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-lg ${
                    isLiveMap ? 'bg-terracotta text-white' : 'bg-white text-ink hover:bg-terracotta hover:text-white'
                  }`}
                >
                  <Globe size={14} />
                  {isLiveMap ? 'Switch to Discovery View' : 'Switch to Live Map'}
                </button>
              </div>

              {isLiveMap ? (
                <div className="w-full h-full">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${selectedLocation ? selectedLocation.name : 'Colosseum,Rome'}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="grayscale contrast-125 brightness-110"
                  ></iframe>
                </div>
              ) : (
                <>
                  {/* Stylized Map Background */}
                  <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 20C30 25 40 10 60 15S80 30 90 25" stroke="#5A5A40" strokeWidth="0.5" />
                      <path d="M5 50C25 55 35 40 55 45S75 60 85 55" stroke="#5A5A40" strokeWidth="0.5" />
                      <path d="M15 80C35 85 45 70 65 75S85 90 95 85" stroke="#5A5A40" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="40" stroke="#5A5A40" strokeWidth="0.2" strokeDasharray="2 2" />
                    </svg>
                  </div>

                  {/* Map Pins */}
                  {filteredLocations.map((loc) => (
                    <motion.div
                      key={loc.id}
                      className="absolute cursor-pointer group"
                      style={{ left: loc.x, top: loc.y }}
                      onClick={() => setSelectedLocation(loc)}
                      onMouseEnter={() => setActiveLocation(loc.id)}
                      onMouseLeave={() => setActiveLocation(null)}
                    >
                      <div className={`relative flex items-center justify-center transition-all duration-300 ${
                        activeLocation === loc.id ? 'scale-125' : 'scale-100'
                      }`}>
                        <div className={`absolute w-12 h-12 rounded-full animate-ping opacity-20 ${
                          activeLocation === loc.id ? 'bg-[#5A5A40]' : 'bg-transparent'
                        }`}></div>
                        <div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg transition-colors flex items-center justify-center ${
                          activeLocation === loc.id ? 'bg-[#5A5A40]' : 'bg-[#1a1a1a]'
                        }`}>
                          <Star size={12} className="text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Location Detail Modal */}
              <AnimatePresence>
                {selectedLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-x-6 bottom-6 bg-white rounded-3xl shadow-2xl overflow-hidden z-30 flex flex-col md:flex-row"
                  >
                    <div className="md:w-1/2 h-48 md:h-auto">
                      <img src={selectedLocation.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="md:w-1/2 p-8 relative">
                      <button 
                        onClick={() => setSelectedLocation(null)}
                        className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={20} />
                      </button>
                      <span className="text-[#5A5A40] text-[10px] font-bold uppercase tracking-widest mb-2 block">{selectedLocation.category}</span>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-3xl font-serif">{selectedLocation.name}</h4>
                        <button 
                          onClick={() => toggleItinerary(selectedLocation)}
                          className={cn(
                            "p-3 rounded-full transition-all",
                            itinerary.find(l => l.id === selectedLocation.id)
                              ? "bg-terracotta text-white shadow-lg"
                              : "bg-terracotta/10 text-terracotta hover:bg-terracotta/20"
                          )}
                        >
                          <Bookmark size={18} fill={itinerary.find(l => l.id === selectedLocation.id) ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-ink/70 text-sm leading-relaxed mb-6">{selectedLocation.longDesc}</p>
                      <div className="p-4 bg-terracotta/5 rounded-2xl border border-terracotta/10 italic text-ink/60 text-xs leading-relaxed mb-6">
                        <span className="font-serif font-bold text-terracotta block mb-1 not-italic uppercase tracking-widest text-[9px]">Local Legend</span>
                        "{selectedLocation.story}"
                      </div>
                      <button className="flex items-center gap-2 text-terracotta font-bold text-xs uppercase tracking-widest hover:underline">
                        Explore Further <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Colosseum Virtual Explorer - Immersive Section */}

      {/* Roman Gallery Deep Dive */}
      <section className="py-24 bg-[#f5f2ed]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-[#5A5A40] uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Visual Journey</span>
            <h2 className="text-4xl md:text-6xl font-serif italic">The Arena Gallery</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-4">
              {[
                { id: 'food', label: 'Gastronomy', icon: <Utensils size={18} />, desc: 'The art of Roman cooking.' },
                { id: 'sea', label: 'The Coast', icon: <Waves size={18} />, desc: 'Where the city meets the sea.' },
                { id: 'tradition', label: 'Traditions', icon: <Heart size={18} />, desc: 'Centuries of living heritage.' },
                { id: 'history', label: 'History', icon: <History size={18} />, desc: 'Layers of the eternal city.' },
                { id: 'culture', label: 'Culture', icon: <Globe size={18} />, desc: 'Art, music, and daily life.' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGalleryTab(tab.id)}
                  className={`w-full text-left p-6 rounded-3xl transition-all border ${
                    galleryTab === tab.id 
                      ? 'bg-white border-[#5A5A40]/20 shadow-xl scale-[1.02]' 
                      : 'bg-transparent border-transparent hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-2 rounded-lg ${galleryTab === tab.id ? 'bg-[#5A5A40] text-white' : 'bg-[#5A5A40]/10 text-[#5A5A40]'}`}>
                      {tab.icon}
                    </div>
                    <span className="font-serif text-xl">{tab.label}</span>
                  </div>
                  <p className="text-sm text-[#4a4a4a] opacity-70">{tab.desc}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={galleryTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-[40px] overflow-hidden shadow-2xl min-h-[600px] flex flex-col"
                >
                  <div className="h-[400px] relative overflow-hidden">
                    <img 
                      src={galleryData[galleryTab as keyof typeof galleryData].image} 
                      className="w-full h-full object-cover" 
                      alt={galleryTab}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]">
                      Featured Insight
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col justify-center">
                    <h3 className="text-3xl font-serif mb-6 italic">{galleryData[galleryTab as keyof typeof galleryData].title}</h3>
                    <p className="text-[#4a4a4a] text-lg leading-relaxed mb-8">
                      {galleryData[galleryTab as keyof typeof galleryData].content}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryData[galleryTab as keyof typeof galleryData].highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5A5A40]/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></div>
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Spectator Ticket Generator */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-terracotta uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Interactive Experience</span>
            <h2 className="text-4xl md:text-5xl font-serif">Get Your <span className="italic">Arena Ticket</span></h2>
            <p className="text-ink/60 mt-4">Discover where you would have sat in the ancient amphitheatre based on your Roman social status.</p>
          </div>

          <div className="bg-marble p-8 md:p-12 rounded-[40px] border border-ink/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-terracotta/5 rounded-bl-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-widest font-bold opacity-40">Select Your Status</p>
                <div className="grid grid-cols-1 gap-3">
                  {['Senator', 'Equite (Knight)', 'Plebeian (Citizen)', 'Commoner'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        const gates = ['I - XX', 'XXI - XL', 'XLI - LX', 'LXI - LXXX'];
                        const tiers = ['Podium (Front Row)', 'Maenianum Primum', 'Maenianum Secundum', 'Maenianum Summum (Top)'];
                        const index = ['Senator', 'Equite (Knight)', 'Plebeian (Citizen)', 'Commoner'].indexOf(status);
                        
                        setGeneratedTicket({
                          status,
                          gate: gates[index],
                          tier: tiers[index],
                          seat: Math.floor(Math.random() * 100) + 1
                        });
                      }}
                      className={`px-6 py-4 rounded-2xl text-left transition-all border ${
                        generatedTicket?.status === status 
                          ? 'bg-terracotta text-white border-terracotta shadow-lg' 
                          : 'bg-white border-ink/10 hover:border-terracotta/50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {generatedTicket ? (
                  <motion.div
                    key="ticket"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-dashed border-terracotta/30 relative"
                  >
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-marble rounded-full border border-terracotta/20"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-marble rounded-full border border-terracotta/20"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-marble rounded-full border border-terracotta/20"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-marble rounded-full border border-terracotta/20"></div>
                    
                    <div className="text-center border-b border-ink/10 pb-6 mb-6">
                      <h3 className="font-serif text-2xl mb-1">MUNERA GLADIATORIA</h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Amphitheatrum Flavium</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Status</span>
                        <span className="font-serif text-lg text-terracotta">{generatedTicket.status}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Entrance Gate</span>
                        <span className="font-mono font-bold text-xl">{generatedTicket.gate}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Tier / Level</span>
                        <span className="text-sm font-medium">{generatedTicket.tier}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Locus (Seat)</span>
                        <span className="font-mono font-bold text-xl">{generatedTicket.seat}</span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-ink/10 flex justify-between items-center">
                      <div className="flex gap-1">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="w-1 h-4 bg-ink/10 rounded-full"></div>
                        ))}
                      </div>
                      <span className="text-[9px] font-bold opacity-20">AD 80 • ROME</span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-ink/10 rounded-3xl">
                    <History size={48} className="opacity-10 mb-4" />
                    <p className="text-ink/30 text-sm italic">Select your status to generate your ancient admission ticket.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Traditions Section */}
      <section className="py-24 bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#F27D26] uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Living Monument</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-6">Modern <span className="italic">Legacy</span></h2>
              <p className="text-white/60 max-w-2xl mx-auto">The Colosseum is no longer a place of combat, but a global symbol of peace and a stage for the world's most significant cultural events.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {[
              {
                icon: <Calendar className="text-[#F27D26]" />,
                title: "Good Friday Procession",
                desc: "Every year, the Pope leads the 'Via Crucis' (Way of the Cross) at the Colosseum, a solemn tradition that draws thousands of pilgrims from across the globe."
              },
              {
                icon: <Music className="text-[#F27D26]" />,
                title: "Global Stage",
                desc: "From Paul McCartney to Andrea Bocelli, the world's greatest artists have performed against the backdrop of the arena, transforming a site of conflict into one of harmony."
              },
              {
                icon: <Landmark className="text-[#F27D26]" />,
                title: "Symbol of Life",
                desc: "Since 2000, the Colosseum's night lighting changes from white to gold whenever a death penalty is commuted or abolished anywhere in the world."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h4 className="text-2xl font-serif mb-4">{item.title}</h4>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* New Cultural Insight: La Passeggiata */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-[#F27D26]/10 border border-[#F27D26]/20 rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center"
          >
            <div className="md:w-1/2">
              <h3 className="text-3xl font-serif mb-6 italic">La Passeggiata</h3>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                As the sun sets over the Colosseum, Romans engage in the centuries-old tradition of <span className="text-[#F27D26] font-semibold">La Passeggiata</span>. It's a slow, social stroll through the historic center, meant for seeing and being seen.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest">Social Ritual</div>
                <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest">Sunset Tradition</div>
              </div>
            </div>
            <div className="md:w-1/2 aspect-video rounded-3xl overflow-hidden">
              <img src="https://picsum.photos/seed/rome-evening/800/450" alt="Rome Evening" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nearby Gems - Bento Grid */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 vertical-text text-[10rem] font-serif font-bold opacity-[0.02] pointer-events-none">
          LOCI
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-terracotta uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Beyond the Arena</span>
              <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">Nearby Gems</h2>
              <p className="text-ink/60 text-lg mt-8 leading-relaxed font-light">Discover the hidden corners and local favorites just a short walk from the Colosseum's shadow.</p>
            </div>
            <div className="flex gap-4">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full border border-ink/10 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <ChevronRight size={24} className="rotate-180" />
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full border border-ink/10 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-all cursor-pointer shadow-sm"
              >
                <ChevronRight size={24} />
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Monti District",
                dist: "5 min walk",
                tag: "Bohemian",
                img: "https://picsum.photos/seed/monti-vibe/600/800",
                desc: "Rome's first ward, now a hip neighborhood full of vintage shops and ivy-covered alleys."
              },
              {
                name: "Arch of Constantine",
                dist: "1 min walk",
                tag: "Imperial",
                img: "https://picsum.photos/seed/arch-vibe/600/800",
                desc: "A triumphal arch situated between the Colosseum and the Palatine Hill."
              },
              {
                name: "Domus Aurea",
                dist: "8 min walk",
                tag: "Hidden",
                img: "https://picsum.photos/seed/domus-vibe/600/800",
                desc: "Nero's Golden House, a vast landscaped palace complex built in the heart of ancient Rome."
              },
              {
                name: "San Clemente",
                dist: "10 min walk",
                tag: "Mystic",
                img: "https://picsum.photos/seed/clemente-vibe/600/800",
                desc: "A multi-layered basilica built over a 4th-century church and a 2nd-century Mithraic temple."
              }
            ].map((gem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-[48px] overflow-hidden mb-8 shadow-xl">
                  <img src={gem.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-ink shadow-sm">{gem.tag}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-8 left-8 right-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-white/80 text-xs leading-relaxed">{gem.desc}</p>
                  </div>
                </div>
                <h4 className="text-2xl font-serif group-hover:text-terracotta transition-colors">{gem.name}</h4>
                <div className="flex items-center gap-3 mt-3 opacity-40">
                  <Clock size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{gem.dist}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roman Wisdom Section */}
      <section className="py-32 bg-marble relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-terracotta uppercase tracking-[0.5em] text-[10px] font-bold mb-10 block">Arena Wisdom</span>
            <blockquote className="text-4xl md:text-6xl font-serif italic leading-tight mb-12 text-balance">
              "Panem et Circenses."
            </blockquote>
            <p className="text-ink/40 uppercase tracking-[0.3em] text-xs font-bold mb-16">— Bread and Circuses</p>
            <div className="flex justify-center gap-12">
              <div className="text-center">
                <p className="text-2xl font-serif text-terracotta mb-2">1946</p>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">Years Standing</p>
              </div>
              <div className="w-px h-12 bg-ink/10"></div>
              <div className="text-center">
                <p className="text-2xl font-serif text-terracotta mb-2">80</p>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">Entrance Arches</p>
              </div>
              <div className="w-px h-12 bg-ink/10"></div>
              <div className="text-center">
                <p className="text-2xl font-serif text-terracotta mb-2">50k+</p>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">Spectators</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Traveler's Phrasebook Section */}
      <section className="py-32 bg-ink text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-terracotta uppercase tracking-[0.5em] text-[10px] font-bold mb-6 block">Lingua Latina</span>
              <h2 className="text-5xl md:text-7xl font-serif italic mb-12">The Traveler's <br /> <span className="text-white/40">Phrasebook</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { it: "Buongiorno", en: "Good morning", ph: "bwon-JOR-no" },
                  { it: "Grazie mille", en: "Thank you very much", ph: "GRAT-zee-ay MEE-lay" },
                  { it: "Per favore", en: "Please", ph: "per fa-VO-ray" },
                  { it: "Dov'è il bagno?", en: "Where is the bathroom?", ph: "do-VAY eel BAN-yo" },
                  { it: "Un caffè, per favore", en: "A coffee, please", ph: "oon kaf-FAY per fa-VO-ray" },
                  { it: "Quanto costa?", en: "How much does it cost?", ph: "KWAN-to KOS-ta" }
                ].map((phrase, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                    <p className="text-xl font-serif mb-1 group-hover:text-terracotta transition-colors">{phrase.it}</p>
                    <p className="text-xs text-white/60 mb-2">{phrase.en}</p>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-white/30 italic">{phrase.ph}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[60px] overflow-hidden">
                <img src="https://picsum.photos/seed/rome-statue/800/1000" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-terracotta rounded-full flex items-center justify-center p-12 text-center rotate-12 shadow-2xl">
                <p className="text-white font-serif italic text-2xl leading-tight">"Learn the language of the heart."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Upcoming Events Section */}
      <section className="py-24 bg-[#f5f2ed]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-terracotta uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Calendar</span>
            <h2 className="text-4xl md:text-6xl font-serif italic">Upcoming Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[40px] shadow-xl border border-ink/5"
              >
                <div className="flex items-center gap-3 text-terracotta mb-4">
                  <Calendar size={18} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">{event.date}</span>
                </div>
                <h3 className="text-2xl font-serif mb-4">{event.title}</h3>
                <p className="text-ink/60 text-sm leading-relaxed mb-6">{event.desc}</p>
                <span className="px-3 py-1 bg-terracotta/10 text-terracotta text-[9px] uppercase font-bold tracking-widest rounded-full">
                  {event.type}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticket Booking Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-terracotta uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Reservation</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Book Your <br /><span className="italic">Arena Access</span></h2>
              <p className="text-ink/70 text-lg leading-relaxed mb-10">
                Secure your entry to the Flavian Amphitheatre. Choose your preferred date and ticket type for an unforgettable journey into history.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-sm font-medium">Skip-the-line access included</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
                    <CheckCircle size={20} />
                  </div>
                  <p className="text-sm font-medium">Digital ticket delivered instantly</p>
                </div>
              </div>
            </div>

            <div className="bg-[#f5f2ed] p-10 rounded-[60px] shadow-2xl border border-ink/5">
              {isBookingSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-serif mb-4">Booking Confirmed!</h3>
                  <p className="text-ink/60 mb-8">Your journey to ancient Rome is secured. Check your email for the tickets.</p>
                  <button 
                    onClick={() => setIsBookingSuccess(false)}
                    className="px-8 py-4 bg-ink text-white rounded-full uppercase tracking-widest text-[10px] font-bold"
                  >
                    Book Another
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Select Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border border-ink/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Ticket Type</label>
                    <select 
                      className="w-full bg-white border border-ink/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                      onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                    >
                      <option value="standard">Standard Entry - €16</option>
                      <option value="underground">Underground & Arena - €24</option>
                      <option value="full">Full Experience (with Forum) - €32</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Number of Tickets</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={bookingData.tickets}
                      className="w-full bg-white border border-ink/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                      onChange={(e) => setBookingData({...bookingData, tickets: parseInt(e.target.value)})}
                    />
                  </div>
                  <button 
                    onClick={() => setIsBookingSuccess(true)}
                    className="w-full py-5 bg-terracotta text-white rounded-2xl uppercase tracking-widest text-[10px] font-bold shadow-xl hover:bg-ink transition-all"
                  >
                    Confirm Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feedback & Rating Section */}
      <section className="py-24 bg-ink text-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-terracotta uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Feedback</span>
            <h2 className="text-4xl md:text-5xl font-serif">Share Your <span className="italic">Experience</span></h2>
            <p className="text-white/40 mt-4">Your voice helps us preserve the spirit of the Eternal City.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-10 md:p-16 rounded-[60px] border border-white/10">
            {isFeedbackSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-terracotta text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={40} />
                </div>
                <h3 className="text-2xl font-serif mb-4">Gratias Tibi!</h3>
                <p className="text-white/60 mb-8">Thank you for your feedback. We appreciate your contribution to our community.</p>
                <button 
                  onClick={() => setIsFeedbackSuccess(false)}
                  className="px-8 py-4 bg-white text-ink rounded-full uppercase tracking-widest text-[10px] font-bold"
                >
                  Submit More
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="text" 
                        placeholder="Julius Caesar"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                        onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="email" 
                        placeholder="julius@rome.gov"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                        onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                      <input 
                        type="tel" 
                        placeholder="+39 06 123456"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                        onChange={(e) => setFeedbackData({...feedbackData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setFeedbackData({...feedbackData, rating: star})}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            feedbackData.rating >= star ? "bg-terracotta text-white" : "bg-white/5 text-white/20"
                          )}
                        >
                          <Star size={16} fill={feedbackData.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Your Thoughts</label>
                    <textarea 
                      rows={4}
                      placeholder="Tell us about your visit..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-none"
                      onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    onClick={() => setIsFeedbackSuccess(true)}
                    className="w-full py-5 bg-white text-ink rounded-2xl uppercase tracking-widest text-[10px] font-bold hover:bg-terracotta hover:text-white transition-all shadow-xl"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-[#1a1a1a]/5 text-center bg-white">
        <p className="font-serif italic text-xl mb-4">The Eternal Colosseum</p>
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-xs uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity">History</a>
          <a href="#" className="text-xs uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity">Architecture</a>
          <a href="#" className="text-xs uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity">Visit</a>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">© 2026 Historical Explorations. All rights reserved.</p>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-ink text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-terracotta transition-colors"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-[40px] shadow-2xl z-50 flex flex-col overflow-hidden border border-ink/5"
          >
            <div className="p-6 bg-ink text-white flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center">
                <Landmark size={20} />
              </div>
              <div>
                <p className="font-serif text-lg">Centurion Marcus</p>
                <p className="text-[9px] uppercase tracking-widest opacity-50">Imperial Guide</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-ink/40 text-sm italic">"Salve, traveler! Ask me anything about the Eternal City."</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-terracotta text-white rounded-tr-none" 
                      : "bg-[#f5f2ed] text-ink rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#f5f2ed] p-4 rounded-3xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-ink/20 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-ink/20 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-ink/20 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-ink/5 flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Marcus..."
                className="flex-1 bg-[#f5f2ed] rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="w-12 h-12 bg-ink text-white rounded-full flex items-center justify-center hover:bg-terracotta transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Itinerary Sidebar */}
      <AnimatePresence>
        {isItineraryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsItineraryOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col p-12"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-4xl font-serif italic">My Itinerary</h3>
                <button onClick={() => setIsItineraryOpen(false)} className="p-2 hover:bg-[#f5f2ed] rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
                {itinerary.length === 0 ? (
                  <div className="text-center py-24">
                    <Bookmark size={48} className="mx-auto text-ink/10 mb-6" />
                    <p className="text-ink/40 italic">Your journey is yet to be mapped. Save locations to build your itinerary.</p>
                  </div>
                ) : (
                  itinerary.map((loc) => (
                    <div key={loc.id} className="group relative flex gap-6 items-center p-4 rounded-3xl hover:bg-[#f5f2ed] transition-colors">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
                        <img src={loc.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-terracotta mb-1">{loc.category}</p>
                        <h4 className="text-xl font-serif">{loc.name}</h4>
                      </div>
                      <button 
                        onClick={() => toggleItinerary(loc)}
                        className="p-2 text-ink/20 hover:text-terracotta transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {itinerary.length > 0 && (
                <div className="mt-12 pt-12 border-t border-ink/10">
                  <button className="w-full py-5 bg-ink text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-terracotta transition-all shadow-xl flex items-center justify-center gap-3">
                    <Navigation size={16} />
                    Generate Route Map
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
