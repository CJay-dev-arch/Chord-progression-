/**
 * ========================================================
 * MELODY MINDS - COMPLETE HTML / CSS / JS ENGINE
 * "Where Little Minds Learn Through Music!"
 * Consolidated from types.ts, curriculumData.ts, & API fallbacks
 * ========================================================
 *
 * @typedef {'Discover'|'Learn'|'Practice'|'Demonstrate'|'Master'|'Expand'} Stage
 * @typedef {{ id: string, title: string, stage: Stage, status: string, icon: string }} SkillNode
 * @typedef {{ id: string, title: string, artist: string, subjectId: string, emoji: string, duration: number, tempo: number, mood: string, minTier: string, lyrics: string[], notes: string[] }} Song
 * @typedef {{ id: string, title: string, type: string, subjectId: string, difficulty: string, instructions: string, pairs?: Array<{id: string, label: string, match: string}> }} MiniGame
 * @typedef {{ id: string, title: string, emoji: string, desc: string }} Badge
 * @typedef {{ id: string, name: string, age: number, avatar: string, stars: number, streak: number, outfit: string, unlockedOutfits: string[], completedLessons: string[], favoriteSongs: string[], soundEnabled: boolean, narrationEnabled: boolean }} LearnerProfile
 */

// --- 1. WEB AUDIO API SYNTHESIZER ---
const NOTE_FREQS = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playNote(noteName, durationSec = 0.45, instrument = 'marimba') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const freq = NOTE_FREQS[noteName] || 440;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (instrument === 'marimba') {
      osc.type = 'sine';
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.45, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
    } else if (instrument === 'piano') {
      osc.type = 'triangle';
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 1.2);
    } else if (instrument === 'chime' || instrument === 'flute') {
      osc.type = 'sine';
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 1.6);
    } else if (instrument === 'guitar') {
      osc.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 1.3);
    } else {
      osc.type = 'sine';
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
    }

    osc.frequency.setValueAtTime(freq, now);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec * 1.6);
  }

  playDrumSound(type) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.22);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'snare') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'hihat') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(9000, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'clap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'chime') {
      ['C5', 'E5', 'G5', 'C6'].forEach((n, idx) => {
        setTimeout(() => this.playNote(n, 0.4, 'chime'), idx * 60);
      });
    } else if (type === 'laser') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    }
  }

  playCorrectSound() {
    ['C4', 'E4', 'G4', 'C5'].forEach((note, idx) => {
      setTimeout(() => this.playNote(note, 0.35, 'chime'), idx * 90);
    });
  }

  playTryAgainSound() {
    ['E4', 'C4'].forEach((note, idx) => {
      setTimeout(() => this.playNote(note, 0.35, 'marimba'), idx * 140);
    });
  }

  playFanfare() {
    const notes = ['C4', 'C4', 'E4', 'G4', 'G4', 'C5'];
    const times = [0, 90, 180, 290, 390, 520];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playNote(n, 0.45, 'piano'), times[idx]);
    });
  }

  playGiggle() {
    const notes = ['G4', 'C5', 'E5', 'G5', 'E5', 'C5'];
    const times = [0, 70, 140, 210, 270, 330];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playNote(n, 0.2, 'chime'), times[idx]);
    });
  }

  speakNarration(text) {
    if (this.isMuted || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1.25;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

const audio = new AudioEngine();

// --- 2. EXTENDED CURRICULUM SONGS (WITH VIP TIERS) ---
const SONGS = [
  {
    id: 'song_abc',
    title: 'The ABC Groove',
    artist: 'Melody & The Beat Crew',
    subjectId: 'reading',
    emoji: '🔤',
    duration: 16,
    tempo: 120,
    mood: 'Bouncy & Energetic',
    minTier: 'free',
    lyrics: [
      'A is for Apple, crunch so sweet! 🍎',
      'B is for Bounce to the happy beat! 🎈',
      'C is for Cat that sings along, 🐱',
      'Sing the alphabet, all day long! 🎶'
    ],
    notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4']
  },
  {
    id: 'song_math',
    title: 'Counting Beats to Ten',
    artist: 'Professor Tempo',
    subjectId: 'mathematics',
    emoji: '🔢',
    duration: 15,
    tempo: 110,
    mood: 'Joyful & Marching',
    minTier: 'free',
    lyrics: [
      'One, two, buckle your dancing shoe! 👟',
      'Three, four, rhythm on the floor! 🥁',
      'Five, six, seven, eight, nine and ten, 🌟',
      'Now count it backwards once again! 🚀'
    ],
    notes: ['C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4', 'G4', 'A4', 'G4', 'E4', 'C4']
  },
  {
    id: 'song_addition',
    title: 'Addition Bounce',
    artist: 'Melody Minds Ensemble',
    subjectId: 'mathematics',
    emoji: '➕',
    duration: 16,
    tempo: 115,
    mood: 'Upbeat & Sunny',
    minTier: 'free',
    lyrics: [
      'Two shiny stars up in the sky, ✨',
      'Add three more zooming high! 🚀',
      'Two plus three makes five in all, 🌟',
      'Math is a bouncy, happy ball! 🎈'
    ],
    notes: ['E4', 'E4', 'G4', 'G4', 'C5', 'G4', 'E4', 'C4']
  },
  {
    id: 'song_water',
    title: 'Water Cycle Stomp',
    artist: 'Eco Echoes',
    subjectId: 'science',
    emoji: '💧',
    duration: 16,
    tempo: 108,
    mood: 'Curious & Fluid',
    minTier: 'free',
    lyrics: [
      'The sun warms the puddle on the street, ☀️',
      'Rising up like misty steam with the heat! ☁️',
      'Clouds gather soft and round and gray, 🌧️',
      'Then raindrops dance and wash the day! 🌈'
    ],
    notes: ['C4', 'F4', 'A4', 'C5', 'A4', 'F4', 'C4']
  },
  {
    id: 'song_robot',
    title: 'Robot Code Groove',
    artist: 'Byte & Beat',
    subjectId: 'stem',
    emoji: '🤖',
    duration: 16,
    tempo: 124,
    mood: 'Futuristic & Funky',
    minTier: 'free',
    lyrics: [
      'Forward one step, beep beep boop! 🤖',
      'Turn to the right and do a loop! 🔄',
      'Algorithms tell us what to do, 💻',
      'Coding is fun for me and you! 🌟'
    ],
    notes: ['C4', 'C4', 'G4', 'G4', 'C5', 'G4', 'C5']
  },
  {
    id: 'song_rhythm',
    title: 'Rhythm Magic',
    artist: 'Melody Mascot',
    subjectId: 'music',
    emoji: '🎵',
    duration: 15,
    tempo: 118,
    mood: 'Playful & Melodic',
    minTier: 'free',
    lyrics: [
      'Hear the heartbeat thump so true, 💓',
      'Keeping time inside of you! 🥁',
      'Fast like a rabbit, slow like a bear, 🐇',
      'Music is magic in the air! ✨'
    ],
    notes: ['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'C5']
  },
  {
    id: 'song_dino',
    title: 'Dinosaur Rhythm Stomp',
    artist: 'T-Rex Tempo Band',
    subjectId: 'science',
    emoji: '🦖',
    duration: 16,
    tempo: 130,
    mood: 'Thunderous & Fun',
    minTier: 'rocker',
    lyrics: [
      'Boom! Crash! Here comes the T-Rex crew! 🦖',
      'Stomping to the beat like giants do! 🐾',
      'Herbivores and carnivores dance along, 🌿',
      'Prehistoric rhythms keep us strong! 💥'
    ],
    notes: ['C3', 'G3', 'C4', 'G3', 'C3', 'E3', 'G3', 'C4']
  },
  {
    id: 'song_space',
    title: 'Planetary Orbit Groove',
    artist: 'Galaxy Beats',
    subjectId: 'science',
    emoji: '🪐',
    duration: 16,
    tempo: 114,
    mood: 'Cosmic & Floating',
    minTier: 'rocker',
    lyrics: [
      'Eight round planets spinning round the sun, ☀️',
      'Mercury to Neptune, learning is fun! 🚀',
      'Gravity keeps us in a cosmic dance, 🪐',
      'Take a musical trip into space romance! ✨'
    ],
    notes: ['C4', 'G4', 'A4', 'C5', 'D5', 'C5', 'G4', 'C4']
  },
  {
    id: 'song_pizza',
    title: 'Fraction Pizza Party',
    artist: 'Chef Arpeggio',
    subjectId: 'mathematics',
    emoji: '🍕',
    duration: 16,
    tempo: 122,
    mood: 'Upbeat & Delicious',
    minTier: 'maestro',
    lyrics: [
      'Cut the pizza in half, one over two! 🍕',
      'Slice into quarters for me and you! 🍽️',
      'Fractions are equal parts of the whole, 🌟',
      'Sharing every slice is our favorite goal! 🎉'
    ],
    notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'C5', 'G4', 'C4']
  },
  {
    id: 'song_feelings_flow',
    title: 'Feelings Flow Like Waves',
    artist: 'Heart & Harmony',
    subjectId: 'emotional_intelligence',
    emoji: '💖',
    duration: 16,
    tempo: 96,
    mood: 'Calming & Gentle',
    minTier: 'free',
    lyrics: [
      'Sometimes happy, sometimes sad, 🌊',
      'Sometimes calm, and sometimes mad.',
      'Take a slow breath, count to three, 🎈',
      'All your feelings are welcome with me! 🌿'
    ],
    notes: ['G4', 'E4', 'F4', 'D4', 'C4']
  },
  {
    id: 'song_manners_matter',
    title: 'Please & Thank You Beat',
    artist: 'Sunny Smiles',
    subjectId: 'life_skills',
    emoji: '🤝',
    duration: 15,
    tempo: 114,
    mood: 'Polite & Cheerful',
    minTier: 'free',
    lyrics: [
      'Two little words have superpower keys, ✨',
      'Whenever you ask, remember PLEASE!',
      'And when a helper lends a hand, 🤝',
      'THANK YOU spreads smiles across the land! 🌸'
    ],
    notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'C5']
  },
  {
    id: 'song_symphony',
    title: 'Grand Symphony Concerto',
    artist: 'Melody Minds Philharmonic',
    subjectId: 'music',
    emoji: '🎻',
    duration: 18,
    tempo: 104,
    mood: 'Majestic & Inspiring',
    minTier: 'symphony',
    lyrics: [
      'Violins soar high up in the breeze, 🎻',
      'Cellos rumble warmly through the trees, 🌲',
      'When every instrument plays their part, 🎶',
      'Symphonies of knowledge fill the heart! 💖'
    ],
    notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'C6']
  }
];

const SUBJECTS = [
  {
    id: 'mathematics',
    name: 'Mathematics Island',
    emoji: '🔢',
    tagline: 'Number Rhythm & Counting',
    desc: 'Explore number bonds, steady rhythm counting, addition beats, and shape geometry!',
    lessons: [
      {
        id: 'math_1',
        title: 'Counting Beats 1 to 10',
        stage: 'Discover',
        desc: 'Learn to count steady drumbeats from one to ten with Professor Tempo.',
        question: 'When counting beats in rhythm, what number comes right after 3?',
        options: ['Four (4)', 'Two (2)', 'Six (6)', 'Zero (0)'],
        correctIndex: 0,
        hint: 'Clap with the tempo: One, two, three... FOUR!',
        explanation: 'Four comes right after three! Keeping time helps our memory!'
      },
      {
        id: 'math_2',
        title: 'Addition Bounce',
        stage: 'Practice',
        desc: 'Combine groups of musical notes together to form larger chords and numbers.',
        question: 'If you have 2 stars and Melody gives you 3 more, how many do you have in total?',
        options: ['Five (5)', 'Four (4)', 'Six (6)', 'Ten (10)'],
        correctIndex: 0,
        hint: 'Hold up 2 fingers, then put up 3 more! Count them all!',
        explanation: '2 + 3 = 5! Adding brings groups together!'
      }
    ]
  },
  {
    id: 'reading',
    name: 'Reading Cove',
    emoji: '📖',
    tagline: 'Letters, Sounds & Rhymes',
    desc: 'Sing letter sounds, phonics grooves, and blend words into beautiful stories.',
    lessons: [
      {
        id: 'reading_1',
        title: 'The ABC Sound Symphony',
        stage: 'Discover',
        desc: 'Match letter shapes to musical letter sounds.',
        question: 'Which word starts with the happy bouncy /b/ sound?',
        options: ['Bounce', 'Apple', 'Cat', 'Dolphin'],
        correctIndex: 0,
        hint: 'Listen to the sound: B-B-Bounce!',
        explanation: 'Bounce starts with the letter B! /b/ /b/ Bounce!'
      },
      {
        id: 'reading_2',
        title: 'Rhyme Time Groove',
        stage: 'Learn',
        desc: 'Find words that end with the same musical sound family.',
        question: 'Which word rhymes with "Cat"?',
        options: ['Hat', 'Dog', 'Sun', 'Tree'],
        correctIndex: 0,
        hint: 'C-at and H-at make the same rhyming tune!',
        explanation: 'Cat and Hat rhyme! Rhymes make words easy to remember!'
      }
    ]
  },
  {
    id: 'writing',
    name: 'Writing Peninsula',
    emoji: '✏️',
    tagline: 'Letter Strokes & Storycraft',
    desc: 'Turn musical thoughts into sentences, poems, and illustrated adventures.',
    lessons: [
      {
        id: 'writing_1',
        title: 'Sentences Have a Melody',
        stage: 'Discover',
        desc: 'Capital letters start our song, and periods take a rest.',
        question: 'What special mark do we place at the end of a complete thought?',
        options: ['A period (.)', 'A letter A', 'A question only', 'Nothing'],
        correctIndex: 0,
        hint: 'It looks like a tiny musical dot on the line!',
        explanation: 'A period marks the end of a sentence like a gentle musical rest!'
      }
    ]
  },
  {
    id: 'science',
    name: 'Science Grove',
    emoji: '🔬',
    tagline: 'Earth, Space & Living Wonders',
    desc: 'The melody of nature: the water cycle, animal habitats, and dancing solar systems.',
    lessons: [
      {
        id: 'science_1',
        title: 'The Water Cycle Dance',
        stage: 'Discover',
        desc: 'Discover how water travels from puddles to clouds and back as rain.',
        question: 'When warm sun turns puddle water into invisible vapor, what is that called?',
        options: ['Evaporation', 'Freezing', 'Melting', 'Sleeping'],
        correctIndex: 0,
        hint: 'It rises up like invisible steam into the sky!',
        explanation: 'Evaporation happens when warm sunshine lifts water up to form clouds!'
      }
    ]
  },
  {
    id: 'stem',
    name: 'STEM Harbor',
    emoji: '🤖',
    tagline: 'Algorithms & Problem Solving',
    desc: 'Code loops, robot dance steps, and step-by-step algorithms through music.',
    lessons: [
      {
        id: 'stem_1',
        title: 'Loops in the Rhythm',
        stage: 'Learn',
        desc: 'Understand repeating code loops just like a song chorus.',
        question: 'What does a "Loop" do in coding and music?',
        options: ['Repeats an action multiple times', 'Turns off the computer', 'Erases everything', 'Stops the song'],
        correctIndex: 0,
        hint: 'Think of repeating your favorite song chorus over and over!',
        explanation: 'A loop tells our robot or music to repeat instructions without writing them again!'
      }
    ]
  },
  {
    id: 'music',
    name: 'Music & Melody Peak',
    emoji: '🎵',
    tagline: 'Xylophone, Pitches & Tempo',
    desc: 'Compose melodies on the Rainbow Xylophone and explore high and low pitches.',
    lessons: [
      {
        id: 'music_1',
        title: 'High and Low Pitches',
        stage: 'Discover',
        desc: 'Listen to tiny bird chirps (high) and big bear growls (low).',
        question: 'Which instrument makes high, bright, chime-like sounds?',
        options: ['A silver glockenspiel bell', 'A giant bass drum', 'A foghorn', 'A thunder rumble'],
        correctIndex: 0,
        hint: 'Think of sparkling fairy bells high up in the sky!',
        explanation: 'Small bells vibrate fast to make high, sparkling pitches!'
      }
    ]
  },
  {
    id: 'spelling',
    name: 'Spelling Reef',
    emoji: '🔠',
    tagline: 'Vowels & Word Families',
    desc: 'Sing A-E-I-O-U and master tricky sight words through rhythm.',
    lessons: [
      {
        id: 'spelling_1',
        title: 'The Vowel Vocal Crew',
        stage: 'Practice',
        desc: 'Meet the 5 magical vowels that sing in every single English word.',
        question: 'Which letters are the vowels that sing in our words?',
        options: ['A, E, I, O, U', 'B, C, D, F, G', 'X, Y, Z', '1, 2, 3, 4'],
        correctIndex: 0,
        hint: 'Sing them out loud: A - E - I - O - U!',
        explanation: 'A, E, I, O, U are vowels that open our mouths to sing!'
      }
    ]
  },
  {
    id: 'life_skills',
    name: 'Life Skills Oasis',
    emoji: '🤝',
    tagline: 'Kindness, Manners & Care',
    desc: 'Handwashing songs, please & thank you rhythm, and healthy daily habits.',
    lessons: [
      {
        id: 'life_1',
        title: 'The 20-Second Handwash Beat',
        stage: 'Learn',
        desc: 'Scrub soap bubbles to the tempo of our happy clean song.',
        question: 'How long should we sing while washing our hands with soap?',
        options: ['20 seconds (sing ABCs twice)', '1 second', 'An hour', 'Never use soap'],
        correctIndex: 0,
        hint: 'Singing the Happy Birthday or ABC tune twice gives germs the boot!',
        explanation: '20 seconds with soap washes away all the sneaky germs!'
      }
    ]
  },
  {
    id: 'emotional_intelligence',
    name: 'Empathy Lagoon',
    emoji: '💖',
    tagline: 'Calm Breaths & Big Emotions',
    desc: 'Naming feelings, celebrating empathy, and practicing calming balloon breaths.',
    lessons: [
      {
        id: 'ei_1',
        title: 'The Balloon Breath Calm',
        stage: 'Practice',
        desc: 'When feeling frustrated, puff your belly out like a gentle balloon.',
        question: 'What is a great thing to do when you feel frustrated or upset?',
        options: ['Take slow, calm deep breaths', 'Scream and throw things', 'Give up forever', 'Hide away'],
        correctIndex: 0,
        hint: 'Breathe in like smelling a flower, breathe out like blowing a bubble!',
        explanation: 'Slow, deep breaths help your heart and brain find calm and peace!'
      }
    ]
  },
  {
    id: 'culture',
    name: 'World Cultures Valley',
    emoji: '🌍',
    tagline: 'Global Rhythms & Greetings',
    desc: 'Say hello in different languages and explore traditional instruments worldwide.',
    lessons: [
      {
        id: 'culture_1',
        title: 'Greetings Around the Globe',
        stage: 'Discover',
        desc: 'Sing "Hola", "Bonjour", "Konnichiwa", and "Jambo" with worldwide friends.',
        question: 'How do friendly neighbors in Spanish say "Hello"?',
        options: ['Hola!', 'Goodbye', 'Night', 'Quiet'],
        correctIndex: 0,
        hint: 'It sounds like "OH-la" with a warm wave!',
        explanation: '"Hola!" is the cheerful Spanish greeting for hello!'
      }
    ]
  },
  {
    id: 'growth_mindset',
    name: 'Mindset Meadow',
    emoji: '🌱',
    tagline: 'The Superpower of YET',
    desc: 'Mistakes are how brains grow! Practice, repeat, and celebrate learning.',
    lessons: [
      {
        id: 'gm_1',
        title: 'The Magic Word: YET',
        stage: 'Master',
        desc: 'Turn "I can\'t do this" into "I can\'t do this YET!"',
        question: 'When a challenge seems tough, what magic word gives us power?',
        options: ['YET! 🌱', 'Never', 'Stop', 'Quit'],
        correctIndex: 0,
        hint: 'It has three letters: Y - E - T!',
        explanation: '"YET" means you are in the middle of learning and will get it soon!'
      }
    ]
  }
];

const MINI_GAMES = [
  {
    id: 'game_rhythm_echo',
    title: 'Rhythm Beat Tapper',
    type: 'rhythm',
    subjectId: 'music',
    difficulty: 'easy',
    instructions: 'Tap the drum on Beat 1 to build your rhythm score!'
  },
  {
    id: 'game_match_animals',
    title: '🦉 Animal Orchestra Matching',
    type: 'matching',
    subjectId: 'science',
    difficulty: 'easy',
    instructions: 'Match each animal friend to their natural habitat!',
    pairs: [
      { id: 'p1', label: '🦁 Lion', match: 'Savannah Grasslands' },
      { id: 'p2', label: '🐬 Dolphin', match: 'Deep Ocean Blue' },
      { id: 'p3', label: '🦉 Owl', match: 'Nocturnal Forest' },
      { id: 'p4', label: '🐧 Penguin', match: 'Icy Antarctica' }
    ]
  },
  {
    id: 'game_reading_phonics',
    title: '📖 Phonics Rhyme Builder',
    type: 'matching',
    subjectId: 'reading',
    difficulty: 'medium',
    instructions: 'Connect words that make the exact same rhyming beat!',
    pairs: [
      { id: 'rp1', label: 'CAT 🐱', match: 'HAT 🎩' },
      { id: 'rp2', label: 'SUN ☀️', match: 'FUN 🎉' },
      { id: 'rp3', label: 'STAR ⭐', match: 'CAR 🚗' },
      { id: 'rp4', label: 'TREE 🌳', match: 'BEE 🐝' }
    ]
  }
];

const BADGES = [
  { id: 'b_first_song', title: 'Rhythm Starter', emoji: '🎵', desc: 'Played your first educational learning song.' },
  { id: 'b_piano_star', title: 'Xylophone Composer', emoji: '🎹', desc: 'Composed your own melody with the Rainbow keys.' },
  { id: 'b_math_whiz', title: 'Counting Champion', emoji: '🔢', desc: 'Mastered counting beats to ten in rhythm.' },
  { id: 'b_science', title: 'Science Detective', emoji: '💧', desc: 'Explored the dancing water cycle and habitats.' },
  { id: 'b_robot', title: 'STEM Inventor', emoji: '🤖', desc: 'Programmed the robotic dance sequence.' },
  { id: 'b_streak_hero', title: 'Flame Keeper', emoji: '🔥', desc: 'Maintained a 4+ day rhythm learning streak.' },
  { id: 'b_growth', title: 'Growth Mindset Hero', emoji: '🌱', desc: 'Embraced the magic superpower of YET!' },
  { id: 'b_explorer', title: 'Melody Explorer', emoji: '🌟', desc: 'Explored all 11 core educational subjects.' },
  { id: 'b_vip_rocker', title: 'Rhythm VIP Rocker', emoji: '🎸', desc: 'Unlocked Unlimited Lifes with free membership pass.' }
];

const OUTFITS = [
  { id: 'outfit_none', name: 'Original Melody', emoji: '🎵', cost: 0 },
  { id: 'outfit_crown', name: 'Royal Crown', emoji: '👑', cost: 40 },
  { id: 'outfit_headphones', name: 'DJ Headphones', emoji: '🎧', cost: 30 },
  { id: 'outfit_wizard', name: 'Magic Wizard Hat', emoji: '🧙', cost: 50 },
  { id: 'outfit_glasses', name: 'Star Shades', emoji: '⭐', cost: 25 },
  { id: 'outfit_medal', name: 'Gold Medal', emoji: '🥇', cost: 35 }
];

// --- 3. STATE & PERSISTENCE ---
let state = {
  user: {
    signedIn: false,
    stageName: 'DJ Leo',
    parentEmail: '',
    tier: 'free', // 'free' | 'rocker' | 'maestro' | 'symphony'
    instrument: 'piano',
    lives: 3,
    maxLives: 3,
    unlimitedLives: false
  },
  learners: [
    {
      id: 'learner_1',
      name: 'Leo',
      age: 6,
      avatar: '🦁',
      stars: 65,
      streak: 4,
      outfit: 'outfit_none',
      unlockedOutfits: ['outfit_none'],
      completedLessons: ['math_1'],
      favoriteSongs: ['song_abc', 'song_water'],
      soundEnabled: true,
      narrationEnabled: true
    }
  ],
  activeLearnerId: 'learner_1',
  currentSongIndex: 0,
  isPlaying: false,
  recordedMelody: [],
  currentQuiz: null,
  activeFilter: 'all',
  chestOpenedToday: false
};

function getActiveLearner() {
  return state.learners.find(l => l.id === state.activeLearnerId) || state.learners[0];
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {}
}

function loadState() {
  const saved = safeStorageGet('melody_minds_condensed_v2');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    } catch (e) {}
  }
}

function saveState() {
  safeStorageSet('melody_minds_condensed_v2', JSON.stringify(state));
  updateTopBar();
  renderMascotAccessory();
}

function updateTopBar() {
  const learner = getActiveLearner();
  const displayName = state.user.signedIn ? state.user.stageName : learner.name;
  const starsEl = document.getElementById('stat-stars');
  const streakEl = document.getElementById('stat-streak');
  const nameEl = document.getElementById('stat-name');
  const avatarEl = document.getElementById('stat-avatar');
  const heroNameEl = document.getElementById('hero-learner-name');
  const streakDaysEl = document.getElementById('streak-days-display');

  // Left-Rail Profile & Classroom Level Sync
  const railAvatar = document.getElementById('rail-avatar');
  const railName = document.getElementById('rail-learner-name');
  const railStars = document.getElementById('rail-stars');
  const levelPill = document.getElementById('classroom-level-pill');

  if (starsEl) starsEl.textContent = learner.stars;
  if (streakEl) streakEl.textContent = learner.streak + 'd';
  if (nameEl) nameEl.textContent = displayName;
  if (avatarEl) avatarEl.textContent = learner.avatar;
  if (heroNameEl) heroNameEl.textContent = displayName;
  if (streakDaysEl) streakDaysEl.textContent = learner.streak;

  if (railAvatar) railAvatar.textContent = learner.avatar;
  if (railName) railName.textContent = displayName;
  if (railStars) railStars.textContent = learner.stars;
  if (levelPill) {
    const levelNum = Math.max(1, 1 + Math.floor((learner.completedLessons || []).length / 2));
    levelPill.textContent = `⭐ Level ${levelNum} Explorer`;
  }

  // Lifes Indicator Update
  const livesBadge = document.getElementById('stat-lives-badge');
  const livesCount = document.getElementById('stat-lives-count');
  const livesIcon = document.getElementById('stat-lives-icon');

  if (state.user.unlimitedLives || state.user.signedIn) {
    if (livesBadge) livesBadge.className = 'stat-pill stat-lives unlimited';
    if (livesIcon) livesIcon.textContent = '💛';
    if (livesCount) livesCount.textContent = 'Unlimited (∞)';
  } else {
    if (livesBadge) livesBadge.className = 'stat-pill stat-lives';
    if (livesIcon) livesIcon.textContent = '🎵';
    if (livesCount) livesCount.textContent = `${state.user.lives}/${state.user.maxLives}`;
  }

  // Auth Header Label
  const authLabel = document.getElementById('auth-header-label');
  if (authLabel) {
    if (state.user.signedIn) {
      const tierNames = { rocker: 'Rhythm Rocker 🎸', maestro: 'Maestro 👑', symphony: 'Grand Symphony 🎓' };
      authLabel.textContent = tierNames[state.user.tier] || 'Member 🌟';
    } else {
      authLabel.textContent = 'VIP Pass';
    }
  }

  // Parent view tier indicator
  const parentTier = document.getElementById('parent-membership-tier');
  const parentDesc = document.getElementById('parent-membership-desc');
  if (parentTier) {
    const tierNames = { free: 'Free Guest', rocker: 'Rhythm Rocker', maestro: 'Melody Maestro', symphony: 'Grand Symphony' };
    parentTier.textContent = tierNames[state.user.tier] || 'Free Guest';
  }
  if (parentDesc) {
    parentDesc.textContent = state.user.unlimitedLives ? 'Unlimited Lifes Active (No Limits)' : 'Standard Guest Mode';
  }

  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) soundBtn.textContent = learner.soundEnabled ? '🔊' : '🔇';
  audio.isMuted = !learner.soundEnabled;
}

// --- 4. VIEW NAVIGATION ---
function showView(viewId) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.dock-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));

  const targetView = document.getElementById(`view-${viewId}`);
  const targetDockBtn = document.getElementById(`dock-btn-${viewId}`);
  const targetRailBtn = document.getElementById(`rail-btn-${viewId}`);

  if (targetView) targetView.classList.add('active');
  if (targetDockBtn) targetDockBtn.classList.add('active');
  if (targetRailBtn) targetRailBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewId === 'home') renderHomeSubjects();
  if (viewId === 'learn') renderLearnView();
  if (viewId === 'piano') setupPiano();
  if (viewId === 'dj') { /* beat studio ready */ }
  if (viewId === 'music') renderMusicView();
  if (viewId === 'rewards') renderRewardsView();
  if (viewId === 'parent') renderParentView();
  if (viewId === 'vip') renderVipView();
}

// --- 5. VIP PASS & AUTHENTICATION HANDLERS ---
let authMode = 'signup'; // 'signup' | 'signin'
let selectedInstrument = 'piano';

function switchVipTab(tab) {
  const btnSignup = document.getElementById('btn-tab-signup');
  const btnTiers = document.getElementById('btn-tab-tiers');
  const panelSignup = document.getElementById('vip-panel-signup');
  const panelTiers = document.getElementById('vip-panel-tiers');

  if (tab === 'signup') {
    btnSignup.classList.add('active');
    btnTiers.classList.remove('active');
    panelSignup.style.display = 'block';
    panelTiers.style.display = 'none';
  } else {
    btnSignup.classList.remove('active');
    btnTiers.classList.add('active');
    panelSignup.style.display = 'none';
    panelTiers.style.display = 'block';
  }
}

function pickInstrument(inst, el) {
  selectedInstrument = inst;
  document.querySelectorAll('.instrument-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');

  // Play instrument sample
  if (inst === 'piano') {
    ['C4', 'E4', 'G4', 'C5'].forEach((n, idx) => setTimeout(() => audio.playNote(n, 0.3, 'piano'), idx * 80));
  } else if (inst === 'drums') {
    audio.playDrumSound('kick');
    setTimeout(() => audio.playDrumSound('snare'), 120);
    setTimeout(() => audio.playDrumSound('hihat'), 240);
  } else if (inst === 'guitar') {
    ['E3', 'B3', 'E4', 'G4'].forEach((n, idx) => setTimeout(() => audio.playNote(n, 0.4, 'guitar'), idx * 70));
  } else if (inst === 'flute') {
    ['G4', 'B4', 'D5', 'G5'].forEach((n, idx) => setTimeout(() => audio.playNote(n, 0.4, 'flute'), idx * 90));
  }
}

function toggleAuthMode() {
  authMode = authMode === 'signup' ? 'signin' : 'signup';
  const title = document.getElementById('form-auth-title');
  const subtitle = document.getElementById('form-auth-subtitle');
  const submitBtn = document.getElementById('auth-submit-btn');
  const prompt = document.getElementById('auth-toggle-prompt');
  const link = document.getElementById('auth-toggle-link');
  const instPicker = document.getElementById('instrument-picker').parentElement;

  if (authMode === 'signin') {
    title.textContent = 'Welcome Back, Musical Explorer!';
    subtitle.textContent = 'Sign in to access your Unlimited Lifes and saved quests.';
    submitBtn.textContent = 'Sign In to My Account 🚀';
    prompt.textContent = "Don't have an account yet?";
    link.textContent = 'Create free account';
    instPicker.style.display = 'none';
  } else {
    title.textContent = 'Create Your Free Musical Account';
    subtitle.textContent = 'Get instant Unlimited Lifes, +100 bonus stars, and save your progress!';
    submitBtn.textContent = '🚀 Unlock Unlimited Lifes & Start Playing!';
    prompt.textContent = 'Already have an account?';
    link.textContent = 'Sign In here';
    instPicker.style.display = 'block';
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('auth-child-name');
  const emailInput = document.getElementById('auth-email');
  const stageName = nameInput ? nameInput.value.trim() : 'DJ Leo';
  const email = emailInput ? emailInput.value.trim() : 'parent@example.com';

  state.user.signedIn = true;
  state.user.stageName = stageName || 'DJ Leo';
  state.user.parentEmail = email;
  state.user.instrument = selectedInstrument;
  state.user.unlimitedLives = true;
  state.user.lives = Infinity;
  if (state.user.tier === 'free') {
    state.user.tier = 'rocker';
  }

  const activeLearner = getActiveLearner();
  activeLearner.name = stageName;
  activeLearner.stars += 100; // Welcome reward!

  saveState();
  audio.playFanfare();
  triggerConfetti();

  showToast(`🎉 Welcome ${stageName}! UNLIMITED LIFES UNLOCKED! 💛 +100 Stars!`);
  setTimeout(() => {
    showView('home');
  }, 1200);
}

function activateTier(tierId) {
  state.user.tier = tierId;
  if (tierId !== 'free') {
    state.user.signedIn = true;
    state.user.unlimitedLives = true;
    state.user.lives = Infinity;
  } else {
    state.user.unlimitedLives = false;
    state.user.lives = 3;
  }

  saveState();
  audio.playFanfare();
  triggerConfetti();

  const tierLabels = {
    free: 'Melody Explorer Guest',
    rocker: 'Rhythm Rocker (Unlimited Lifes Active!)',
    maestro: 'Melody Maestro Family Pass',
    symphony: 'Grand Symphony Academy Pass'
  };

  showToast(`🌟 Activated: ${tierLabels[tierId]}!`);
  renderVipView();
  renderMusicView();
  renderLearnView();
}

function renderVipView() {
  const currentTier = state.user.tier;
  ['free', 'rocker', 'maestro', 'symphony'].forEach(t => {
    const card = document.getElementById(`tier-card-${t}`);
    if (card) {
      if (currentTier === t) {
        card.style.borderColor = '#10B981';
      } else {
        card.style.borderColor = '';
      }
    }
  });
}

function refillGuestLives() {
  state.user.lives = 3;
  saveState();
  audio.playNote('C5', 0.3, 'chime');
  showToast('Note Lifes Refilled! 🎵🎵🎵');
}

// --- 6. INTERACTIVE MASCOT MELODY PLAYROOM ---
function setMascotSpeech(text) {
  const el = document.getElementById('mascot-speech-bubble');
  if (el) {
    el.textContent = text;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'notePop 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
  }
}

function tickleMelody() {
  audio.playGiggle();
  triggerMascotWiggle();
  setMascotSpeech("Hehehe! That tickles! 🎵 +2 Stars!");
  const learner = getActiveLearner();
  learner.stars += 2;
  saveState();
}

function feedMelodySnack() {
  audio.playDrumSound('clap');
  audio.playNote('C5', 0.25, 'chime');
  triggerMascotBounce();
  setMascotSpeech("Yum! Delicious musical note cookie! 🍪✨");
  showToast("Melody enjoyed a yummy rhythm snack! 🍪");
}

function melodySingNote() {
  ['C4', 'E4', 'G4', 'C5'].forEach((note, idx) => {
    setTimeout(() => audio.playNote(note, 0.35, 'marimba'), idx * 80);
  });
  triggerMascotBounce();
  setMascotSpeech("La-la-la-la! Pure harmony! 🎶");
}

function melodyDanceSpin() {
  audio.playFanfare();
  const mascot = document.getElementById('mascot-character');
  if (mascot) {
    mascot.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    mascot.style.transform = 'rotate(360deg) scale(1.15)';
    setTimeout(() => {
      mascot.style.transform = '';
    }, 650);
  }
  setMascotSpeech("Woohoo! Spin dance! 💃⭐");
}

function triggerMascotWiggle() {
  const mascot = document.getElementById('mascot-character');
  if (mascot) {
    mascot.style.transition = 'transform 0.1s';
    mascot.style.transform = 'rotate(-10deg) scale(1.1)';
    setTimeout(() => {
      mascot.style.transform = 'rotate(10deg) scale(1.1)';
      setTimeout(() => {
        mascot.style.transform = '';
      }, 100);
    }, 100);
  }
}

function triggerMascotBounce() {
  const mascot = document.getElementById('mascot-character');
  if (mascot) {
    mascot.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    mascot.style.transform = 'translateY(-18px) scale(1.08)';
    setTimeout(() => {
      mascot.style.transform = '';
    }, 220);
  }
}

function renderMascotAccessory() {
  const slot = document.getElementById('mascot-accessory-slot');
  if (!slot) return;
  const learner = getActiveLearner();
  const outfit = learner.outfit || 'outfit_none';

  if (outfit === 'outfit_crown') {
    slot.innerHTML = `
      <polygon points="40,64 48,46 54,60 62,44 70,64" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
      <circle cx="48" cy="46" r="2.5" fill="#EF4444"/>
      <circle cx="54" cy="59" r="2" fill="#3B82F6"/>
      <circle cx="62" cy="44" r="2.5" fill="#10B981"/>
    `;
  } else if (outfit === 'outfit_headphones') {
    slot.innerHTML = `
      <path d="M 30 85 C 30 50, 78 50, 78 85" fill="none" stroke="#EC4899" stroke-width="6" stroke-linecap="round"/>
      <rect x="25" y="80" width="10" height="20" rx="5" fill="#DB2777"/>
      <rect x="74" y="80" width="10" height="20" rx="5" fill="#DB2777"/>
    `;
  } else if (outfit === 'outfit_glasses') {
    slot.innerHTML = `
      <path d="M 36 88 L 41 84 L 46 88 L 44 93 L 38 93 Z" fill="#FACC15" stroke="#422006" stroke-width="1.5"/>
      <path d="M 61 85 L 66 81 L 71 85 L 69 90 L 63 90 Z" fill="#FACC15" stroke="#422006" stroke-width="1.5"/>
      <line x1="46" y1="88" x2="61" y2="85" stroke="#422006" stroke-width="2"/>
    `;
  } else if (outfit === 'outfit_wizard') {
    slot.innerHTML = `
      <polygon points="32,68 55,24 76,66" fill="#6366F1" stroke="#312E81" stroke-width="2"/>
      <ellipse cx="54" cy="67" rx="26" ry="6" fill="#4338CA"/>
      <circle cx="55" cy="42" r="3" fill="#FDE047"/>
    `;
  } else if (outfit === 'outfit_medal') {
    slot.innerHTML = `
      <path d="M 46 112 L 53 125 L 60 112" fill="none" stroke="#EF4444" stroke-width="3"/>
      <circle cx="53" cy="128" r="7" fill="#FACC15" stroke="#CA8A04" stroke-width="1.5"/>
    `;
  } else {
    slot.innerHTML = '';
  }
}

// --- 7. DAILY MAGIC TREASURE CHEST ---
function openMagicChest() {
  if (state.chestOpenedToday) {
    audio.playNote('C5', 0.25, 'chime');
    showToast("You already opened today's magic chest! Come back tomorrow! 🌟");
    return;
  }

  audio.playFanfare();
  triggerConfetti();
  state.chestOpenedToday = true;
  const learner = getActiveLearner();
  learner.stars += 25;
  saveState();

  const iconBox = document.getElementById('chest-box-icon');
  const statusText = document.getElementById('chest-status-text');
  if (iconBox) iconBox.textContent = '🌟';
  if (statusText) statusText.textContent = 'Unlocked! +25 Stars added to your bank! ⭐';

  showToast("🎉 MAGIC CHEST OPENED! +25 Stars! ⭐");
}

// --- 8. KID DJ BEAT MACHINE & SOUND PADS ---
let autoLoopInterval = null;
let autoLoopStep = 0;

function hitDrumPad(type) {
  audio.playDrumSound(type);
  const padBtn = document.querySelector(`.pad-${type}`);
  if (padBtn) {
    padBtn.classList.add('hit');
    setTimeout(() => padBtn.classList.remove('hit'), 140);
  }
}

function toggleAutoBeatLoop() {
  const btn = document.getElementById('btn-loop-groove');
  if (autoLoopInterval) {
    clearInterval(autoLoopInterval);
    autoLoopInterval = null;
    if (btn) btn.innerHTML = '<span>🔁</span> Start Backing Groove';
    showToast('Beat loop paused ⏸️');
  } else {
    autoLoopStep = 0;
    autoLoopInterval = setInterval(() => {
      if (autoLoopStep % 4 === 0) {
        audio.playDrumSound('kick');
        audio.playDrumSound('hihat');
      } else if (autoLoopStep % 4 === 2) {
        audio.playDrumSound('snare');
        audio.playDrumSound('hihat');
      } else {
        audio.playDrumSound('hihat');
      }
      autoLoopStep++;
    }, 380);

    if (btn) btn.innerHTML = '<span>⏹️</span> Stop Backing Groove';
    showToast('Backing groove jamming! Play xylophone on top! 🎶');
  }
}

// --- 9. ANIMAL SOUND SAFARI ORCHESTRA ---
function playAnimalSound(animal) {
  const card = document.getElementById(`animal-${animal}`);
  if (card) {
    card.classList.add('singing');
    setTimeout(() => card.classList.remove('singing'), 350);
  }

  if (animal === 'lion') {
    audio.playNote('C3', 0.4, 'marimba');
    setTimeout(() => audio.playNote('G3', 0.5, 'piano'), 120);
    showToast('Leo the Lion: ROOOAAR in C-Major! 🦁🎵');
  } else if (animal === 'frog') {
    audio.playNote('E3', 0.2, 'marimba');
    setTimeout(() => audio.playNote('G3', 0.25, 'marimba'), 100);
    showToast('Freddy the Frog: Ribbit-ribbit beat! 🐸🥁');
  } else if (animal === 'bird') {
    audio.playNote('C5', 0.2, 'chime');
    setTimeout(() => audio.playNote('E5', 0.2, 'chime'), 80);
    setTimeout(() => audio.playNote('G5', 0.3, 'chime'), 160);
    showToast('Penny Songbird: Sweet soprano trill! 🐦🎶');
  } else if (animal === 'robot') {
    audio.playDrumSound('laser');
    setTimeout(() => audio.playNote('C5', 0.15, 'piano'), 100);
    showToast('Beep the Bot: 8-bit computational groove! 🤖⚡');
  }
}

// --- 10. INTERACTIVE RAINBOW XYLOPHONE ---
const PIANO_KEYS = [
  { note: 'C4', label: 'C', sol: 'Do', cls: 'key-c' },
  { note: 'D4', label: 'D', sol: 'Re', cls: 'key-d' },
  { note: 'E4', label: 'E', sol: 'Mi', cls: 'key-e' },
  { note: 'F4', label: 'F', sol: 'Fa', cls: 'key-f' },
  { note: 'G4', label: 'G', sol: 'Sol', cls: 'key-g' },
  { note: 'A4', label: 'A', sol: 'La', cls: 'key-a' },
  { note: 'B4', label: 'B', sol: 'Ti', cls: 'key-b' },
  { note: 'C5', label: 'C²', sol: 'Do', cls: 'key-c2' }
];

function setupPiano() {
  const container = document.getElementById('piano-keys');
  if (!container) return;
  container.innerHTML = '';

  PIANO_KEYS.forEach((k, idx) => {
    const btn = document.createElement('button');
    btn.className = `key-btn ${k.cls}`;
    btn.innerHTML = `
      <span style="font-size:12px; opacity:0.9;">${k.sol}</span>
      <span style="font-size:18px; font-weight:800;">${k.label}</span>
      <span style="font-size:11px; opacity:0.75;">[${idx + 1}]</span>
    `;
    btn.onclick = () => {
      audio.playNote(k.note, 0.45, 'marimba');
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);
      if (state.recordedMelody.length < 16) {
        state.recordedMelody.push(k.note);
        renderRecordedNotes();
      }
    };
    container.appendChild(btn);
  });

  if (!window._pianoKeyListenerAdded) {
    window._pianoKeyListenerAdded = true;
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 8) {
        const k = PIANO_KEYS[keyNum - 1];
        if (k) {
          audio.playNote(k.note, 0.45, 'marimba');
          if (state.recordedMelody.length < 16) {
            state.recordedMelody.push(k.note);
            renderRecordedNotes();
          }
        }
      }
    });
  }
}

function renderRecordedNotes() {
  const display = document.getElementById('recorded-notes');
  if (!display) return;
  if (state.recordedMelody.length === 0) {
    display.textContent = 'Tap keys or 1–8 to record notes...';
  } else {
    display.textContent = state.recordedMelody.join(' · ');
  }
}

function playRecordedMelody() {
  if (state.recordedMelody.length === 0) {
    showToast('Record some keys first! 🎵');
    return;
  }
  state.recordedMelody.forEach((n, idx) => {
    setTimeout(() => audio.playNote(n, 0.4, 'marimba'), idx * 340);
  });
}

function clearRecordedMelody() {
  state.recordedMelody = [];
  renderRecordedNotes();
}

function loadPresetMelody(presetName) {
  let notes = [];
  if (presetName === 'twinkle') {
    notes = ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'];
  } else if (presetName === 'abc') {
    notes = ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'C4'];
  } else if (presetName === 'lamb') {
    notes = ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'];
  }
  state.recordedMelody = notes;
  renderRecordedNotes();
  playRecordedMelody();
  showToast(`Loaded ${presetName.toUpperCase()} tune! 🎶`);
}

// --- 11. MUSIC PLAYER ---
let playerInterval = null;

function playCurrentSong() {
  const song = SONGS[state.currentSongIndex];
  state.isPlaying = true;

  const titleEl = document.getElementById('player-song-title');
  const artistEl = document.getElementById('player-song-artist');
  const emojiEl = document.getElementById('player-emoji');
  const playBtn = document.getElementById('play-btn');
  const wavesEl = document.getElementById('player-waves');

  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;
  if (emojiEl) emojiEl.textContent = song.emoji;
  if (playBtn) playBtn.textContent = '⏸';
  if (wavesEl) wavesEl.style.display = 'flex';

  if (song.notes && song.notes.length) {
    song.notes.forEach((note, idx) => {
      setTimeout(() => {
        if (state.isPlaying) audio.playNote(note, 0.45, 'piano');
      }, idx * 450);
    });
  }

  let lineIdx = 0;
  if (playerInterval) clearInterval(playerInterval);
  const lyricsEl = document.getElementById('player-lyrics');
  if (lyricsEl && song.lyrics.length) {
    lyricsEl.textContent = song.lyrics[0];
  }

  playerInterval = setInterval(() => {
    if (!state.isPlaying) return;
    lineIdx = (lineIdx + 1) % song.lyrics.length;
    if (lyricsEl) lyricsEl.textContent = song.lyrics[lineIdx];
  }, 3500);
}

function togglePlay() {
  if (state.isPlaying) {
    state.isPlaying = false;
    const playBtn = document.getElementById('play-btn');
    const wavesEl = document.getElementById('player-waves');
    if (playBtn) playBtn.textContent = '▶';
    if (wavesEl) wavesEl.style.display = 'none';
    if (playerInterval) clearInterval(playerInterval);
  } else {
    playCurrentSong();
  }
}

function nextSong() {
  state.currentSongIndex = (state.currentSongIndex + 1) % SONGS.length;
  playCurrentSong();
}

function prevSong() {
  state.currentSongIndex = (state.currentSongIndex - 1 + SONGS.length) % SONGS.length;
  playCurrentSong();
}

function playSongById(songId) {
  const idx = SONGS.findIndex(s => s.id === songId);
  if (idx !== -1) {
    const song = SONGS[idx];
    // Check if song requires tier
    if (song.minTier && song.minTier !== 'free' && !isTierUnlocked(song.minTier)) {
      showToast(`🔒 ${song.title} requires the ${song.minTier.toUpperCase()} VIP Pass!`);
      showView('vip');
      return;
    }
    state.currentSongIndex = idx;
    playCurrentSong();
  }
}

function isTierUnlocked(requiredTier) {
  const hierarchy = { free: 0, rocker: 1, maestro: 2, symphony: 3 };
  const userRank = hierarchy[state.user.tier] || 0;
  const neededRank = hierarchy[requiredTier] || 0;
  return userRank >= neededRank;
}

function syncMusicPlayerUI() {
  const song = SONGS[state.currentSongIndex] || SONGS[0];
  const titleEl = document.getElementById('player-song-title');
  const artistEl = document.getElementById('player-song-artist');
  const emojiEl = document.getElementById('player-emoji');
  const lyricsEl = document.getElementById('player-lyrics');
  const playBtn = document.getElementById('play-btn');
  const wavesEl = document.getElementById('player-waves');

  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;
  if (emojiEl) emojiEl.textContent = song.emoji;
  if (lyricsEl && song.lyrics && song.lyrics.length) lyricsEl.textContent = song.lyrics[0];
  if (playBtn) playBtn.textContent = state.isPlaying ? '⏸' : '▶';
  if (wavesEl) wavesEl.style.display = state.isPlaying ? 'flex' : 'none';
}

function renderMusicView() {
  const container = document.getElementById('music-grid');
  if (!container) return;
  container.innerHTML = '';

  const searchInput = document.getElementById('music-search');
  const query = (searchInput ? searchInput.value : '').toLowerCase();
  const learner = getActiveLearner();
  const favs = learner.favoriteSongs || [];

  const filtered = SONGS.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.artist.toLowerCase().includes(query) ||
    s.mood.toLowerCase().includes(query)
  );

  filtered.forEach(song => {
    const locked = song.minTier && song.minTier !== 'free' && !isTierUnlocked(song.minTier);
    const isFav = favs.includes(song.id);
    const row = document.createElement('div');
    row.className = 'song-row-card';
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; min-width:0;">
        <div class="player-emoji-box">${song.emoji}</div>
        <div style="min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="font-fun" style="font-size:17px; font-weight:800; color:#1E1B4B;">${song.title}</span>
            ${song.minTier !== 'free' ? `<span style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:10px; background:${locked ? '#FEF3C7' : '#ECFDF5'}; color:${locked ? '#B45309' : '#047857'}; text-transform:uppercase;">${locked ? '🔒 ' + song.minTier : '✓ ' + song.minTier}</span>` : ''}
          </div>
          <div style="font-size:13px; color:#64748B; font-weight:700;">${song.artist} · ${song.mood} · ${song.tempo} BPM</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
        <button onclick="toggleFavoriteSong('${song.id}')" style="background:#FAF5FF; border:2px solid #E9D5FF; width:38px; height:38px; border-radius:12px; cursor:pointer; font-size:16px;" title="Favorite Song">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <button class="btn-duo ${locked ? 'btn-duo-yellow' : 'btn-duo-purple'}" style="padding:9px 16px; font-size:12px;" onclick="playSongById('${song.id}')">
          ${locked ? '👑 Unlock' : '▶ Sing'}
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

function toggleFavoriteSong(songId) {
  const learner = getActiveLearner();
  const favs = learner.favoriteSongs || [];
  if (favs.includes(songId)) {
    learner.favoriteSongs = favs.filter(id => id !== songId);
    showToast('Removed from favorites 💔');
  } else {
    learner.favoriteSongs.push(songId);
    audio.playCorrectSound();
    showToast('Added to Favorite Songs! ❤️');
  }
  saveState();
  renderMusicView();
}

// --- 12. LEARN VIEW: 11 EDUCATIONAL ISLANDS ---
function renderLearnView() {
  const container = document.getElementById('learn-subjects-grid');
  if (!container) return;
  container.innerHTML = '';

  const searchInput = document.getElementById('learn-search');
  const query = (searchInput ? searchInput.value : '').toLowerCase();

  const filtered = SUBJECTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query);
    const matchesFilter = !state.activeFilter || state.activeFilter === 'all' || s.id === state.activeFilter;
    return matchesSearch && matchesFilter;
  });

  const activeLearner = getActiveLearner();
  const completed = activeLearner.completedLessons || [];

  filtered.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'quest-card';

    const isCompleted = completed.includes(sub.id);

    card.innerHTML = `
      <div>
        <div class="card-top">
          <div class="card-icon">${sub.emoji}</div>
          <div>
            <div class="card-title">${sub.name}</div>
            <div class="card-tagline">${sub.tagline}</div>
          </div>
        </div>
        <div class="card-desc">${sub.desc}</div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
          ${sub.lessons.map(l => {
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#FAF5FF; border-radius:14px; border:1.5px solid #F3E8FF;">
                <div>
                  <span style="font-weight:700; font-size:13px; color:#1E1B4B;">${l.title}</span>
                  <span style="font-size:11px; font-weight:800; color:#7E22CE; margin-left:6px;">[${l.stage}]</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  ${isCompleted ? '<span style="color:#059669; font-weight:800; font-size:12px;">✓ Mastered</span>' : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="card-footer">
        <span class="badge-pill">${isCompleted ? '✓ 100% Mastered' : `${sub.lessons.length} Core Quests`}</span>
        <button class="btn-duo btn-duo-purple" style="padding:10px 18px; font-size:13px;" onclick="startDuoLesson('${sub.id}')">
          ${isCompleted ? 'Replay ⭐' : 'Play Quest ▶'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterSubjects(cat) {
  state.activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === cat);
  });
  renderLearnView();
}

function openChestStep(chestId, reward) {
  if (!state.openedChests) state.openedChests = [];
  if (state.openedChests.includes(chestId)) {
    showToast('Already opened this milestone chest! ⭐');
    return;
  }
  state.openedChests.push(chestId);
  const learner = getActiveLearner();
  learner.stars += reward;
  saveState();
  audio.playFanfare();
  triggerConfetti();
  showToast(`🎁 Milestone Chest Opened! +${reward} Stars Claimed! ⭐`);
  renderPathTrail();
}

// --- 13. DUOLINGO-STYLE INTERACTIVE LESSON ENGINE ---
const DUO_LESSONS = {
  mathematics: {
    title: 'Counting Beats to Four',
    prompt: 'Tap the steady drumbeats in order:',
    speech: 'Can you count the steady beats from one to four?',
    correctSequence: ['One 🥁', 'Two 🥁', 'Three 🥁', 'Four 🥁'],
    wordBank: ['Two 🥁', 'Ten 🌟', 'One 🥁', 'Zero ⚪', 'Four 🥁', 'Three 🥁', 'Five ✋'],
    explanation: 'One, two, three, four! Rhythm makes our brain remember numbers!'
  },
  reading: {
    title: 'ABC Rhyme Builder',
    prompt: 'Build the rhyme: "A is for Apple, crunch so..."',
    speech: 'Complete the musical rhyme: A is for Apple, crunch so...',
    correctSequence: ['sweet! 🍎', 'Bounce 🎈', 'to', 'the beat! 🎶'],
    wordBank: ['sweet! 🍎', 'banana 🍌', 'Bounce 🎈', 'cat 🐱', 'to', 'dog 🐶', 'the beat! 🎶'],
    explanation: 'A is for Apple, crunch so sweet! Bounce to the beat!'
  },
  writing: {
    title: 'Sentence Melody',
    prompt: 'Arrange words into a complete sentence with a period:',
    speech: 'Every musical sentence starts with a capital and ends with a period.',
    correctSequence: ['We', 'sing', 'happy', 'songs. 🎶'],
    wordBank: ['songs. 🎶', 'We', 'running', 'sing', 'jumping', 'happy'],
    explanation: 'Sentences carry complete musical thoughts!'
  },
  science: {
    title: 'Water Cycle Dance',
    prompt: 'Order the steps of how rain is made:',
    speech: 'Sun warms the puddle, vapor rises, and raindrops fall!',
    correctSequence: ['Sun warms ☀️', 'Clouds form ☁️', 'Rain dances 🌧️'],
    wordBank: ['Clouds form ☁️', 'Snow freezes ❄️', 'Sun warms ☀️', 'Thunder ⚡', 'Rain dances 🌧️'],
    explanation: 'Evaporation lifts water up, then condensation brings rain!'
  },
  stem: {
    title: 'Robot Code Groove',
    prompt: 'Code the robot to repeat the rhythm:',
    speech: 'Program the robot: Step forward, loop, and dance to the beat!',
    correctSequence: ['Step forward 🤖', 'Repeat loop 🔄', 'Dance beat 💃'],
    wordBank: ['Step forward 🤖', 'Sleep 💤', 'Repeat loop 🔄', 'Stop 🛑', 'Dance beat 💃'],
    explanation: 'Loops tell computers and musicians to repeat patterns!'
  },
  music: {
    title: 'High & Low Pitches',
    prompt: 'Order the xylophone notes from lowest to highest:',
    speech: 'Arrange the musical pitches from low Do up to high Sol!',
    correctSequence: ['Do 🎵', 'Re 🎹', 'Mi 🌟', 'Fa 🔔', 'Sol 🎺'],
    wordBank: ['Sol 🎺', 'Low Bass 🥁', 'Do 🎵', 'Fa 🔔', 'Re 🎹', 'Mi 🌟'],
    explanation: 'Do, Re, Mi, Fa, Sol! Pitches rise as sound frequencies increase!'
  },
  spelling: {
    title: 'Vowel Vocal Crew',
    prompt: 'Pick the 5 singing vowels in alphabetical order:',
    speech: 'Sing the five vowels that open our mouths in every song!',
    correctSequence: ['A 🅰️', 'E 📧', 'I ℹ️', 'O ⭕', 'U 🦄'],
    wordBank: ['A 🅰️', 'B 🅱️', 'E 📧', 'C 🌊', 'I ℹ️', 'O ⭕', 'K 🪁', 'U 🦄'],
    explanation: 'A, E, I, O, U are the magic vowels of language!'
  },
  life_skills: {
    title: '20-Second Handwash Beat',
    prompt: 'Arrange the healthy handwashing sequence:',
    speech: 'Warm water, bubbly soap, and scrub for 20 whole seconds!',
    correctSequence: ['Warm water 💧', 'Bubbly soap 🧼', 'Scrub 20 seconds ⏰'],
    wordBank: ['Bubbly soap 🧼', 'Mud 🐾', 'Warm water 💧', 'Dirty towel 🧺', 'Scrub 20 seconds ⏰'],
    explanation: '20 seconds of bubbly washing washes every sneaky germ away!'
  },
  emotional_intelligence: {
    title: 'The Balloon Breath Calm',
    prompt: 'When frustrated, follow the calming balloon rhythm:',
    speech: 'Breathe in like smelling a flower, hold, and breathe out gently.',
    correctSequence: ['Breathe in 🌸', 'Hold gentle 🎈', 'Breathe out 💨'],
    wordBank: ['Breathe in 🌸', 'Scream loud 📢', 'Hold gentle 🎈', 'Breathe out 💨', 'Stomp feet 👣'],
    explanation: 'Slow balloon breaths give your brain oxygen and calm!'
  },
  culture: {
    title: 'Global Greetings Jam',
    prompt: 'Match friendly greetings around the world:',
    speech: 'Say hello in English, Spanish, French, and Japanese!',
    correctSequence: ['Hello 🇺🇸', 'Hola 🇪🇸', 'Bonjour 🇫🇷', 'Konnichiwa 🇯🇵'],
    wordBank: ['Hola 🇪🇸', 'Goodbye 🚪', 'Hello 🇺🇸', 'Night 🌙', 'Bonjour 🇫🇷', 'Konnichiwa 🇯🇵'],
    explanation: 'Music and kind greetings connect hearts across the globe!'
  },
  growth_mindset: {
    title: 'The Power of YET',
    prompt: 'Build the super-learning mindset statement:',
    speech: 'Whenever something is tough, remember the magic word YET!',
    correctSequence: ['I can\'t', 'do this', 'YET! 🌱'],
    wordBank: ['do this', 'never 🚫', 'I can\'t', 'quit 🛑', 'YET! 🌱', 'impossible ❌'],
    explanation: 'YET means your brain is growing every time you practice!'
  }
};

let currentLessonState = {
  subjectId: null,
  lesson: null,
  selectedTiles: [],
  bankTiles: [],
  status: 'idle',
  startTime: 0
};

function startDuoLesson(subjectId) {
  // Check if guest has lifes
  if (!state.user.unlimitedLives && state.user.lives <= 0) {
    document.getElementById('modal-out-of-lives').classList.add('open');
    return;
  }

  const lesson = DUO_LESSONS[subjectId] || DUO_LESSONS.mathematics;
  currentLessonState.subjectId = subjectId;
  currentLessonState.lesson = lesson;
  currentLessonState.selectedTiles = [];
  currentLessonState.bankTiles = lesson.wordBank.map((word, idx) => ({ text: word, originalIndex: idx, used: false }));
  currentLessonState.status = 'idle';
  currentLessonState.startTime = Date.now();

  // Update prompt and speech
  const promptEl = document.getElementById('duo-lesson-prompt-text');
  if (promptEl) promptEl.textContent = lesson.prompt;

  // Update lives display in lesson modal
  const livesCountEl = document.getElementById('duo-lesson-lives-count');
  const livesBadge = document.getElementById('duo-lesson-lives');
  if (livesCountEl) {
    if (state.user.unlimitedLives) {
      livesCountEl.textContent = '∞';
      if (livesBadge) livesBadge.className = 'stat-pill stat-lives unlimited';
    } else {
      livesCountEl.textContent = `${state.user.lives}/3`;
      if (livesBadge) livesBadge.className = 'stat-pill stat-lives';
    }
  }

  // Reset bottom bar
  resetLessonBottomBar();

  // Render slots & bank
  renderLessonSlotsAndBank();

  // Open modal
  const modal = document.getElementById('modal-duo-lesson');
  if (modal) modal.classList.add('open');

  audio.playNote('C5', 0.25, 'chime');
  setTimeout(() => {
    replayLessonAudio();
  }, 350);
}

function replayLessonAudio() {
  if (currentLessonState.lesson) {
    audio.speakNarration(currentLessonState.lesson.speech || currentLessonState.lesson.prompt);
  }
}

function renderLessonSlotsAndBank() {
  // Render Answer Slots
  const slotsContainer = document.getElementById('duo-answer-slots');
  if (slotsContainer) {
    slotsContainer.innerHTML = '';
    if (currentLessonState.selectedTiles.length === 0) {
      slotsContainer.innerHTML = '<span class="slot-placeholder-text">Tap tiles below to build the musical answer...</span>';
    } else {
      currentLessonState.selectedTiles.forEach((tile, sIdx) => {
        const chip = document.createElement('button');
        chip.className = 'word-tile';
        chip.textContent = tile.text;
        chip.title = 'Tap to remove';
        chip.onclick = () => removeAnswerTile(sIdx);
        slotsContainer.appendChild(chip);
      });
    }
  }

  // Render Word Bank
  const bankContainer = document.getElementById('duo-word-bank');
  if (bankContainer) {
    bankContainer.innerHTML = '';
    currentLessonState.bankTiles.forEach((tile) => {
      const chip = document.createElement('button');
      chip.className = `word-tile ${tile.used ? 'used' : ''}`;
      chip.textContent = tile.text;
      if (!tile.used && currentLessonState.status !== 'correct') {
        chip.onclick = () => selectWordTile(tile.originalIndex);
      }
      bankContainer.appendChild(chip);
    });
  }

  // Check Button State
  const checkBtn = document.getElementById('duo-check-btn');
  if (checkBtn && currentLessonState.status === 'idle') {
    if (currentLessonState.selectedTiles.length > 0) {
      checkBtn.className = 'btn-duo btn-duo-green';
      checkBtn.disabled = false;
    } else {
      checkBtn.className = 'btn-duo btn-duo-gray';
      checkBtn.disabled = true;
    }
  }
}

function selectWordTile(originalIndex) {
  if (currentLessonState.status !== 'idle') return;
  const tile = currentLessonState.bankTiles.find(t => t.originalIndex === originalIndex);
  if (!tile || tile.used) return;

  audio.playNote('C5', 0.12, 'marimba');
  tile.used = true;
  currentLessonState.selectedTiles.push(tile);
  renderLessonSlotsAndBank();
}

function removeAnswerTile(selectedIndex) {
  if (currentLessonState.status !== 'idle') return;
  const removed = currentLessonState.selectedTiles.splice(selectedIndex, 1)[0];
  if (removed) {
    audio.playNote('G4', 0.12, 'marimba');
    const bTile = currentLessonState.bankTiles.find(t => t.originalIndex === removed.originalIndex);
    if (bTile) bTile.used = false;
  }
  renderLessonSlotsAndBank();
}

function resetLessonBottomBar() {
  const bar = document.getElementById('duo-bottom-bar');
  const feedbackLeft = document.getElementById('duo-feedback-left');
  const checkBtn = document.getElementById('duo-check-btn');

  if (bar) bar.className = 'bottom-check-bar';
  if (feedbackLeft) feedbackLeft.style.display = 'none';
  if (checkBtn) {
    checkBtn.textContent = 'CHECK';
    checkBtn.className = 'btn-duo btn-duo-gray';
    checkBtn.disabled = true;
  }
}

function checkLessonAnswer() {
  if (currentLessonState.status === 'correct') {
    continueLesson();
    return;
  }

  if (currentLessonState.status === 'incorrect') {
    // Reset and try again
    currentLessonState.status = 'idle';
    currentLessonState.selectedTiles = [];
    currentLessonState.bankTiles.forEach(t => t.used = false);
    resetLessonBottomBar();
    renderLessonSlotsAndBank();
    return;
  }

  const selectedWords = currentLessonState.selectedTiles.map(t => t.text);
  const correctWords = currentLessonState.lesson.correctSequence;

  const isCorrect = selectedWords.length === correctWords.length &&
    selectedWords.every((w, i) => w === correctWords[i]);

  const bar = document.getElementById('duo-bottom-bar');
  const feedbackLeft = document.getElementById('duo-feedback-left');
  const feedbackIcon = document.getElementById('duo-feedback-icon');
  const feedbackTitle = document.getElementById('duo-feedback-title');
  const feedbackSubtitle = document.getElementById('duo-feedback-subtitle');
  const checkBtn = document.getElementById('duo-check-btn');

  if (isCorrect) {
    currentLessonState.status = 'correct';
    audio.playFanfare();
    if (bar) bar.className = 'bottom-check-bar correct-feedback';
    if (feedbackLeft) feedbackLeft.style.display = 'flex';
    if (feedbackIcon) {
      feedbackIcon.textContent = '✓';
      feedbackIcon.style.background = '#58CC02';
    }
    if (feedbackTitle) {
      feedbackTitle.textContent = 'Correct!';
      feedbackTitle.style.color = '#58CC02';
    }
    if (feedbackSubtitle) feedbackSubtitle.textContent = 'High note! You hit every beat!';
    if (checkBtn) {
      checkBtn.textContent = 'CONTINUE';
      checkBtn.className = 'btn-duo btn-duo-green';
      checkBtn.disabled = false;
    }
  } else {
    currentLessonState.status = 'incorrect';
    audio.playTryAgainSound();
    if (bar) bar.className = 'bottom-check-bar error-feedback';
    if (feedbackLeft) feedbackLeft.style.display = 'flex';
    if (feedbackIcon) {
      feedbackIcon.textContent = '✕';
      feedbackIcon.style.background = '#FF4B4B';
    }
    if (feedbackTitle) {
      feedbackTitle.textContent = 'Not quite!';
      feedbackTitle.style.color = '#FF4B4B';
    }
    if (feedbackSubtitle) feedbackSubtitle.textContent = currentLessonState.lesson.explanation;
    if (checkBtn) {
      checkBtn.textContent = 'GOT IT';
      checkBtn.className = 'btn-duo btn-duo-coral';
      checkBtn.disabled = false;
    }

    // Deduct life if guest user
    if (!state.user.unlimitedLives) {
      state.user.lives = Math.max(0, state.user.lives - 1);
      saveState();
      updateTopBar();

      // Update lesson lives indicator
      const livesCountEl = document.getElementById('duo-lesson-lives-count');
      if (livesCountEl) livesCountEl.textContent = `${state.user.lives}/3`;

      if (state.user.lives <= 0) {
        setTimeout(() => {
          closeLessonModal();
          document.getElementById('modal-out-of-lives').classList.add('open');
        }, 850);
      }
    }
  }
}

function continueLesson() {
  closeLessonModal();
  const modal = document.getElementById('modal-lesson-complete');
  if (modal) modal.classList.add('open');

  audio.playFanfare();
  triggerConfetti();

  const learner = getActiveLearner();
  if (!learner.completedLessons) learner.completedLessons = [];
  if (!learner.completedLessons.includes(currentLessonState.subjectId)) {
    learner.completedLessons.push(currentLessonState.subjectId);
  }
  learner.stars += 20;
  saveState();
  updateTopBar();
}

function claimLessonReward() {
  const modal = document.getElementById('modal-lesson-complete');
  if (modal) modal.classList.remove('open');

  showToast('⭐ +20 Stars Claimed! Quest Mastered!');
  showView('learn');
}

function closeLessonModal() {
  const modal = document.getElementById('modal-duo-lesson');
  if (modal) modal.classList.remove('open');
}

// --- 15. REWARDS & DRESS-UP STUDIO ---
function renderRewardsView() {
  const activeLearner = getActiveLearner();
  const starsTotal = document.getElementById('rewards-stars-total');
  if (starsTotal) starsTotal.textContent = activeLearner.stars;

  const outfitGrid = document.getElementById('outfits-grid');
  if (outfitGrid) {
    outfitGrid.innerHTML = '';
    OUTFITS.forEach(outfit => {
      const isUnlocked = activeLearner.unlockedOutfits.includes(outfit.id) || state.user.tier !== 'free';
      const isEquipped = activeLearner.outfit === outfit.id;

      const card = document.createElement('div');
      card.className = `outfit-card ${isEquipped ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="outfit-emoji">${outfit.emoji}</div>
        <div class="outfit-name">${outfit.name}</div>
        <div style="font-size:12px; margin-top:6px; font-weight:800;">
          ${isEquipped ? '<span style="color:#7E22CE;">Wearing ✨</span>' :
            isUnlocked ? '<span style="color:#059669;">Equip</span>' :
            `<span style="color:#D97706;">⭐ ${outfit.cost} Stars</span>`}
        </div>
      `;
      card.onclick = () => selectOutfit(outfit);
      outfitGrid.appendChild(card);
    });
  }

  const badgesGrid = document.getElementById('badges-grid');
  if (badgesGrid) {
    badgesGrid.innerHTML = '';
    BADGES.forEach(badge => {
      const card = document.createElement('div');
      card.className = 'quest-card';
      card.style.textAlign = 'center';
      card.style.padding = '22px';
      card.innerHTML = `
        <div style="font-size:42px; margin-bottom:8px;">${badge.emoji}</div>
        <div class="font-fun" style="font-size:18px; font-weight:700; color:#1E1B4B; margin-bottom:4px;">${badge.title}</div>
        <div style="font-size:13px; color:#64748B;">${badge.desc}</div>
        <div style="margin-top:12px; font-size:12px; font-weight:800; color:#059669;">✓ UNLOCKED</div>
      `;
      badgesGrid.appendChild(card);
    });
  }
}

function selectOutfit(outfit) {
  const learner = getActiveLearner();
  const isUnlocked = learner.unlockedOutfits.includes(outfit.id) || state.user.tier !== 'free';

  if (isUnlocked) {
    learner.outfit = outfit.id;
    audio.playFanfare();
    showToast(`Melody is now wearing the ${outfit.name}! 🌟`);
  } else {
    if (learner.stars >= outfit.cost) {
      learner.stars -= outfit.cost;
      learner.unlockedOutfits.push(outfit.id);
      learner.outfit = outfit.id;
      audio.playFanfare();
      triggerConfetti();
      showToast(`Unlocked ${outfit.name}! 🎉`);
    } else {
      audio.playTryAgainSound();
      showToast(`Need ${outfit.cost - learner.stars} more Stars to unlock! ⭐`);
      return;
    }
  }
  saveState();
  renderRewardsView();
  renderMascotAccessory();
}

// --- 16. PARENT / TEACHER ZONE ---
function renderParentView() {
  const learner = getActiveLearner();
  const nameEl = document.getElementById('parent-learner-name');
  const ageEl = document.getElementById('parent-learner-age');
  const timeEl = document.getElementById('parent-learner-time');

  if (nameEl) nameEl.textContent = state.user.signedIn ? state.user.stageName : learner.name;
  if (ageEl) ageEl.textContent = `${learner.age} Years Old`;
  if (timeEl) timeEl.textContent = `${learner.completedLessons.length * 8} mins`;
}

let parentGateExpected = 12;

function openParentGate() {
  const n1 = 3 + Math.floor(Math.random() * 5);
  const n2 = 2 + Math.floor(Math.random() * 4);
  parentGateExpected = n1 * n2;
  const qEl = document.getElementById('parent-gate-question');
  const inp = document.getElementById('parent-gate-input');
  if (qEl) qEl.textContent = `Parent Gate Verification: What is ${n1} × ${n2}?`;
  if (inp) inp.value = '';
  openModal('modal-parent-gate');
}

function submitParentGate(e) {
  e.preventDefault();
  const inp = document.getElementById('parent-gate-input');
  const val = parseInt(inp ? inp.value : '', 10);
  if (val === parentGateExpected) {
    closeModals();
    showView('parent');
    showToast('Welcome to the Parent & Teacher Dashboard 👨‍👩‍👧');
  } else {
    audio.playTryAgainSound();
    showToast('Not quite — check the math and try again!');
  }
}

function switchLearner(learnerId) {
  state.activeLearnerId = learnerId;
  saveState();
  updateTopBar();
  renderHomeSubjects();
  renderMascotAccessory();
  showToast(`Switched profile to ${getActiveLearner().name}! 🌟`);
}

function addNewProfile() {
  const nameInp = document.getElementById('new-profile-name');
  const ageInp = document.getElementById('new-profile-age');
  if (nameInp) nameInp.value = '';
  if (ageInp) ageInp.value = '6';
  openModal('modal-new-profile');
}

function submitNewProfile(e) {
  e.preventDefault();
  const nameInp = document.getElementById('new-profile-name');
  const ageInp = document.getElementById('new-profile-age');
  const name = nameInp ? nameInp.value.trim() : '';
  if (!name) return;
  const age = parseInt((ageInp ? ageInp.value : '6') || '6', 10);
  const avatars = ['🦁', '🦋', '🐼', '🦊', '🚀', '🐬', '🦄'];
  const newLearner = {
    id: 'learner_' + Date.now(),
    name,
    age: isNaN(age) ? 6 : age,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    stars: 50,
    streak: 1,
    outfit: 'outfit_none',
    unlockedOutfits: ['outfit_none'],
    completedLessons: [],
    favoriteSongs: ['song_abc'],
    soundEnabled: true,
    narrationEnabled: true
  };
  state.learners.push(newLearner);
  state.activeLearnerId = newLearner.id;
  saveState();
  updateTopBar();
  renderHomeSubjects();
  renderMascotAccessory();
  closeModals();
  showToast(`Welcome ${newLearner.name}! 🌟`);
}

// --- 17. AI COMPANION (MELODY THE MASCOT) ---
let _backendApiAvailable =
  window.location.protocol !== 'file:' &&
  (window.location.port === '3000' || window.location.hostname.endsWith('.run.app'));

function canUseBackendApi() {
  return _backendApiAvailable;
}

async function sendCompanionMessage() {
  const input = document.getElementById('companion-input');
  if (!input || !input.value.trim()) return;

  const msg = input.value.trim();
  input.value = '';
  addChatMessage('user', msg);

  const learner = getActiveLearner();
  const loadingBubble = addChatMessage('assistant', 'Melody is humming and thinking... 🎵✨');

  if (canUseBackendApi()) {
    try {
      const res = await fetch('/api/gemini/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          learnerName: state.user.signedIn ? state.user.stageName : learner.name,
          learnerAge: learner.age,
          subject: 'General Curiosity'
        })
      });
      if (!res.ok) {
        if (res.status === 404) _backendApiAvailable = false;
        throw new Error('Offline mode');
      }
      const data = await res.json();
      loadingBubble.textContent = data.reply || getLocalMascotReply(msg, learner.name);
      if (learner.narrationEnabled) audio.speakNarration(loadingBubble.textContent);
      return;
    } catch (err) {
      // Fall through to local Mascot response
    }
  }

  loadingBubble.textContent = getLocalMascotReply(msg, learner.name);
  if (learner.narrationEnabled) {
    audio.speakNarration(loadingBubble.textContent);
  }
}

function addChatMessage(role, text) {
  const window = document.getElementById('companion-chat-window');
  if (!window) return null;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = text;
  window.appendChild(bubble);
  window.scrollTop = window.scrollHeight;
  return bubble;
}

function sendPresetCompanionPrompt(presetText) {
  const input = document.getElementById('companion-input');
  if (input) {
    input.value = presetText;
    sendCompanionMessage();
  }
}

function getLocalMascotReply(msg, name) {
  const m = msg.toLowerCase();
  if (m.includes('math') || m.includes('count')) {
    return `Numbers have their own rhythm, ${name}! 🥁 1, 2, 3... every number is like a steady drumbeat! Let's clap out the answer together! ✨`;
  }
  if (m.includes('read') || m.includes('letter') || m.includes('book')) {
    return `Letters are the notes that compose the music of words! 📖 When we sing letter sounds together, stories come alive! 🎶`;
  }
  if (m.includes('science') || m.includes('rain') || m.includes('space')) {
    return `Science is nature's song! 🌧️ Did you know clouds are like soft sponges floating in the sky until they dance as raindrops? 🌈`;
  }
  return `Hi ${name}! 🎵 Every question you ask makes your Melody Mind grow brighter! Remember the superpower of YET! 🌟`;
}

// --- 18. AI STORYBOOK GENERATOR (WITH 100% STANDALONE FALLBACK) ---
function buildLocalStorybook(topic, subject, childName) {
  return {
    title: `${childName} & The Melody of ${topic}`,
    subtitle: `An enchanting musical journey discovering ${subject}.`,
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Whispering Note',
        text: `Once upon a sunny morning, ${childName} heard a sweet melody floating through the breeze like a silver chime. Following the tune, ${childName} met Melody the musical mascot smiling brightly!`,
        musicalSoundEffect: 'gentle glockenspiel chimes'
      },
      {
        chapterNumber: 2,
        title: 'Dancing With the Rhythm',
        text: `Melody smiled and said, "Look closely, ${childName}! Every wonder of ${topic} has its own steady beat!" Together they clapped along and watched ideas sparkle in rhythm.`,
        musicalSoundEffect: 'bouncy marimba steps'
      },
      {
        chapterNumber: 3,
        title: 'The Great Symphony of Discovery',
        text: `With a heart full of joy and a mind full of harmony, ${childName} discovered that whenever learning feels brand-new, music makes it unforgettable forever!`,
        musicalSoundEffect: 'triumphant piano fanfare'
      }
    ],
    rhymingChant: `Step by step and note by note, we sing the words the rhythm wrote! ${topic} is our favorite song, together we are brave and strong!`
  };
}

function renderStorybookHTML(output, story) {
  output.innerHTML = `
    <div style="background:#FAF5FF; padding:20px; border-radius:24px; border:3px solid #E9D5FF; margin-top:16px;">
      <h4 class="font-fun" style="font-size:22px; color:#7E22CE; margin-bottom:4px;">${story.title}</h4>
      <p style="font-size:13px; color:#64748B; margin-bottom:16px;">${story.subtitle || ''}</p>
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${story.chapters.map(c => `
          <div style="background:#FFFFFF; padding:14px 16px; border-radius:18px; border:2px solid #F3E8FF;">
            <div style="font-weight:700; font-size:15px; color:#1E1B4B;">Chapter ${c.chapterNumber}: ${c.title}</div>
            <div style="font-size:14px; color:#4B5563; line-height:1.5; margin-top:6px;">${c.text}</div>
            <div style="font-size:12px; font-weight:800; color:#7E22CE; margin-top:8px;">🎵 Sound Effect: ${c.musicalSoundEffect}</div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:16px; padding:12px 16px; background:#FEF3C7; border-radius:18px; font-weight:700; font-size:14px; color:#92400E; border:2px solid #FDE68A;">
        Sing-Along Chant: <br><span style="font-style:italic; font-weight:600;">${story.rhymingChant}</span>
      </div>
    </div>
  `;
}

async function generateAIStorybook() {
  const topicInput = document.getElementById('storybook-topic');
  const topic = (topicInput ? topicInput.value.trim() : '') || 'The Musical Garden';
  const learner = getActiveLearner();
  const childName = state.user.signedIn ? state.user.stageName : learner.name;
  const output = document.getElementById('storybook-result');
  if (output) output.innerHTML = '<p style="text-align:center; padding:20px;">Weaving a magical musical tale for you... 🎶📖</p>';

  if (canUseBackendApi()) {
    try {
      const res = await fetch('/api/gemini/storybook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject: 'Story Adventure',
          learnerName: childName,
          learnerAge: learner.age
        })
      });
      if (!res.ok) {
        if (res.status === 404) _backendApiAvailable = false;
        throw new Error('Offline mode');
      }
      const data = await res.json();
      if (data && data.storybook && data.storybook.chapters) {
        renderStorybookHTML(output, data.storybook);
        audio.playCorrectSound();
        return;
      }
    } catch (e) {
      // Seamless standalone client-side fallback
    }
  }

  if (output) {
    renderStorybookHTML(output, buildLocalStorybook(topic, 'Story Adventure', childName));
    audio.playCorrectSound();
  }
}

// --- 18B. SONG & RHYME CREATOR (CONSOLIDATED FROM SERVER) ---
function buildLocalSong(topic) {
  return {
    title: `The ${topic} Groove`,
    tempoBpm: 114,
    verse: `Look around and what do you see?\n${topic} is waiting for you and me!\nStep by step we understand,\nThe brightest little minds in the land!`,
    chorus: `Sing it loud, sing it clear,\n${topic} music is right here!\nTap your feet to the learning beat,\nMelody Minds makes learning sweet!`,
    educationalTip: `${topic} helps us notice joyful patterns and rhythm in our world!`
  };
}

async function generateCustomSong() {
  const input = document.getElementById('song-creator-topic');
  const topic = (input ? input.value.trim() : '') || 'Dancing Stars';
  const output = document.getElementById('song-creator-result');
  if (!output) return;

  output.innerHTML = '<p style="text-align:center; padding:16px;">Composing a bouncy rhythm... 🎤🎵</p>';
  let song = null;

  if (canUseBackendApi()) {
    try {
      const res = await fetch('/api/gemini/song-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subject: 'Music & Discovery', style: 'bouncy kids song' })
      });
      if (!res.ok && res.status === 404) _backendApiAvailable = false;
      if (res.ok) {
        const data = await res.json();
        if (data && data.song && data.song.title) song = data.song;
      }
    } catch (e) {}
  }

  if (!song) song = buildLocalSong(topic);

  output.innerHTML = `
    <div class="song-verse-box">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;">
        <h4 class="font-fun" style="font-size:20px; color:#7E22CE;">🎶 ${song.title}</h4>
        <span class="badge-pill">${song.tempoBpm || 114} BPM</span>
      </div>
      <div style="background:#FFFFFF; padding:12px 14px; border-radius:14px; border:1.5px solid #E9D5FF; margin-bottom:10px; white-space:pre-line; font-size:14px;">
        <strong style="color:#EC4899;">Verse:</strong>\n${song.verse}
      </div>
      <div style="background:#FEF3C7; padding:12px 14px; border-radius:14px; border:1.5px solid #FDE68A; margin-bottom:10px; white-space:pre-line; font-size:14px; color:#78350F;">
        <strong style="color:#B45309;">Chorus:</strong>\n${song.chorus}
      </div>
      <div style="font-size:13px; font-weight:700; color:#1E1B4B;">💡 ${song.educationalTip}</div>
    </div>
  `;
  audio.playFanfare();
}

// --- 18C. MATCHING MINI-GAME (ANIMAL ORCHESTRA & PHONICS RHYMES) ---
let matchState = { gameId: 'game_match_animals', selectedLeft: null, matchedIds: [] };

function startMatchGame(gameId = 'game_match_animals') {
  const game = MINI_GAMES.find(g => g.id === gameId) || MINI_GAMES[1];
  matchState = { gameId: game.id, selectedLeft: null, matchedIds: [] };

  const titleEl = document.getElementById('match-game-title');
  const descEl = document.getElementById('match-game-desc');
  const progEl = document.getElementById('match-game-progress');
  const btnAnimals = document.getElementById('match-switch-animals');
  const btnPhonics = document.getElementById('match-switch-phonics');

  if (titleEl) titleEl.textContent = game.title;
  if (descEl) descEl.textContent = game.instructions;
  if (progEl) progEl.textContent = `0 / ${game.pairs.length}`;
  if (btnAnimals) btnAnimals.classList.toggle('active', game.id === 'game_match_animals');
  if (btnPhonics) btnPhonics.classList.toggle('active', game.id === 'game_reading_phonics');

  const leftCol = document.getElementById('match-left-col');
  const rightCol = document.getElementById('match-right-col');
  if (leftCol && rightCol) {
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    const shuffledRight = [...game.pairs].sort(() => Math.random() - 0.5);

    game.pairs.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'match-chip';
      btn.id = `match-left-${p.id}`;
      btn.textContent = p.label;
      btn.onclick = () => selectMatchItem('left', p.id);
      leftCol.appendChild(btn);
    });

    shuffledRight.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'match-chip';
      btn.id = `match-right-${p.id}`;
      btn.textContent = p.match;
      btn.onclick = () => selectMatchItem('right', p.id);
      rightCol.appendChild(btn);
    });
  }

  openModal('modal-match-game');
}

function selectMatchItem(side, pairId) {
  if (matchState.matchedIds.includes(pairId)) return;

  if (side === 'left') {
    document.querySelectorAll('#match-left-col .match-chip').forEach(b => b.classList.remove('selected'));
    matchState.selectedLeft = pairId;
    const el = document.getElementById(`match-left-${pairId}`);
    if (el) el.classList.add('selected');
    audio.playNote('C5', 0.15, 'marimba');
    return;
  }

  if (!matchState.selectedLeft) {
    showToast('Tap a card on the left column first! 👈');
    return;
  }

  const game = MINI_GAMES.find(g => g.id === matchState.gameId);
  if (matchState.selectedLeft === pairId) {
    matchState.matchedIds.push(pairId);
    const lEl = document.getElementById(`match-left-${pairId}`);
    const rEl = document.getElementById(`match-right-${pairId}`);
    if (lEl) { lEl.classList.remove('selected'); lEl.classList.add('matched'); }
    if (rEl) rEl.classList.add('matched');
    matchState.selectedLeft = null;
    audio.playCorrectSound();

    const progEl = document.getElementById('match-game-progress');
    if (progEl && game) progEl.textContent = `${matchState.matchedIds.length} / ${game.pairs.length}`;

    if (game && matchState.matchedIds.length === game.pairs.length) {
      getActiveLearner().stars += 15;
      saveState();
      triggerConfetti();
      audio.playFanfare();
      showToast('🎉 All Pairs Matched! +15 Stars! ⭐');
    }
  } else {
    audio.playTryAgainSound();
    showToast('Try another match! 🎵');
    document.querySelectorAll('#match-left-col .match-chip').forEach(b => b.classList.remove('selected'));
    matchState.selectedLeft = null;
  }
}

// --- 19. MINI-GAME (RHYTHM BEAT TAPPER) ---
let gameInterval = null;
let gameBeat = 1;
let gameScore = 0;

function startRhythmGame() {
  document.getElementById('modal-minigame').classList.add('open');
  gameScore = 0;
  gameBeat = 1;
  const scoreEl = document.getElementById('minigame-score');
  if (scoreEl) scoreEl.textContent = '0';
  nextGameBeat();
}

function nextGameBeat() {
  if (gameInterval) clearInterval(gameInterval);
  const visualEl = document.getElementById('rhythm-beat-circle');

  gameInterval = setInterval(() => {
    gameBeat = (gameBeat % 4) + 1;
    if (visualEl) {
      visualEl.textContent = gameBeat;
      visualEl.style.transform = 'scale(1.22)';
      visualEl.style.background = gameBeat === 1 ? '#EF4444' : '#F59E0B';
      setTimeout(() => {
        visualEl.style.transform = 'scale(1)';
      }, 150);
    }
    audio.playNote(gameBeat === 1 ? 'C5' : 'G4', 0.15, 'marimba');
  }, 750);
}

function tapRhythmDrum() {
  if (gameBeat === 1) {
    audio.playFanfare();
    gameScore += 10;
    showToast('PERFECT BEAT! 🎯 +10 Points!');
  } else {
    audio.playNote('E4', 0.2, 'chime');
    gameScore += 3;
    showToast('Good Tap! 🥁');
  }
  const scoreEl = document.getElementById('minigame-score');
  if (scoreEl) scoreEl.textContent = gameScore;
  if (gameScore >= 50) {
    clearInterval(gameInterval);
    triggerConfetti();
    getActiveLearner().stars += 25;
    saveState();
    showToast('🎉 RHYTHM MASTER! You earned 25 Stars! ⭐');
    closeModals();
  }
}

function stopRhythmGame() {
  if (gameInterval) clearInterval(gameInterval);
  closeModals();
}

// --- 20. CELEBRATE STREAK & CONFETTI ---
function celebrateStreak() {
  audio.playFanfare();
  triggerConfetti();
  showToast(`🔥 BLAZING BRIGHT! You have a ${getActiveLearner().streak}-Day Rhythm Streak!`);
}

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#A855F7', '#EC4899', '#FBBF24', '#34D399', '#60A5FA', '#F43F5E'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 18,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 7 + Math.random() * 8,
      alpha: 1
    });
  }

  let animId = null;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38;
      p.alpha -= 0.015;
      if (p.alpha > 0) {
        alive = true;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (alive) {
      animId = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animId);
    }
  }
  update();
}

// --- 21. UTILITIES & TOASTS ---
function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  if (gameInterval) clearInterval(gameInterval);
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function toggleSound() {
  const learner = getActiveLearner();
  learner.soundEnabled = !learner.soundEnabled;
  audio.isMuted = !learner.soundEnabled;
  saveState();
  updateTopBar();
  showToast(learner.soundEnabled ? 'Sound is now ON 🔊' : 'Sound Muted 🔇');
}

function showToast(msg) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// --- 22. CLASSROOM ALPHABET STRIP & STARFALL DAILY FACT ---
const ALPHA_WORDS = {
  A: 'Apple 🍎', B: 'Beat 🥁', C: 'Chime 🔔', D: 'Drum 🥁', E: 'Echo 🎶',
  F: 'Flute 🪈', G: 'Guitar 🎸', H: 'Harp 🎵', I: 'Instrument 🎹', J: 'Jazz 🎷',
  K: 'Key 🎹', L: 'Lyric 📖', M: 'Melody 🎵', N: 'Note 🎼', O: 'Octave 🌟',
  P: 'Piano 🎹', Q: 'Quartet 🎻', R: 'Rhythm 💃', S: 'Song 🎤', T: 'Tempo ⏱️',
  U: 'Ukulele 🪕', V: 'Violin 🎻', W: 'Waltz ✨', X: 'Xylophone 🌈', Y: 'YET! 🌱', Z: 'Zing! ⚡'
};

const ALPHA_SCALE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

function renderAlphabetStrip() {
  const strip = document.getElementById('alphabet-strip');
  if (!strip) return;
  strip.innerHTML = '';

  Object.keys(ALPHA_WORDS).forEach((letter, idx) => {
    const btn = document.createElement('button');
    btn.className = 'alpha-key';
    btn.textContent = `${letter}${letter.toLowerCase()}`;
    btn.title = `${letter} is for ${ALPHA_WORDS[letter]}`;
    btn.onclick = () => playAlphaKey(letter, idx, btn);
    strip.appendChild(btn);
  });
}

function playAlphaKey(letter, idx, btnEl) {
  document.querySelectorAll('.alpha-key').forEach(k => k.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const note = ALPHA_SCALE[idx % ALPHA_SCALE.length];
  audio.playNote(note, 0.35, 'marimba');

  const phrase = `${letter} is for ${ALPHA_WORDS[letter]}`;
  const banner = document.getElementById('alpha-now-playing');
  if (banner) banner.textContent = `🎵 ${phrase}`;
  setMascotSpeech(`${phrase}! Sing the sound with me! 🎶`);

  const learner = getActiveLearner();
  if (learner.narrationEnabled) {
    audio.speakNarration(`${letter} is for ${ALPHA_WORDS[letter].replace(/[^a-zA-Z !]/g, '')}`);
  }
}

const FALLBACK_FACTS = [
  {
    emoji: '🌈',
    title: 'Music Grows Brains!',
    fact: 'Singing a steady rhythm activates both sides of your brain at the exact same time!',
    rhymingChant: 'Clap-clap, tap-tap, learning feels like fun!'
  },
  {
    emoji: '🐸',
    title: 'Frogs Sing Scales!',
    fact: 'Tree frogs chirp in steady musical beats so their forest friends can hear them!',
    rhymingChant: 'Ribbit-beat, hopping sweet, dancing in the rain!'
  },
  {
    emoji: '🪐',
    title: 'Planetary Tempo!',
    fact: 'Every planet in our solar system keeps a steady beat spinning around the glowing Sun!',
    rhymingChant: 'Spinning round, cosmic sound, eight worlds in a groove!'
  },
  {
    emoji: '📖',
    title: 'Rhyming Builds Super Memory!',
    fact: 'When words rhyme in a song, your ears predict the next sound—helping kids remember new words 3x faster!',
    rhymingChant: 'Rhyme the line and sing the word, the happiest tale you ever heard!'
  },
  {
    emoji: '🌻',
    title: 'Math Beats in Sunflowers!',
    fact: 'Sunflowers arrange their seeds in musical Fibonacci spirals so every seed gets cozy sunshine!',
    rhymingChant: 'Count the spirals, count the beats, math is full of nature treats!'
  },
  {
    emoji: '🌧️',
    title: 'Clouds Tap-Dance as Rain!',
    fact: 'Clouds hold millions of tiny water droplets floating high until they get heavy and tap-dance down as rain!',
    rhymingChant: 'From puddles up to clouds so high, raindrops dance across the sky!'
  }
];

async function loadDailyFact(forceRefresh = false) {
  const titleEl = document.getElementById('daily-fact-title');
  const textEl = document.getElementById('daily-fact-text');
  const chantEl = document.getElementById('daily-fact-chant');
  const emojiEl = document.getElementById('daily-fact-emoji');

  if (!titleEl || !textEl) return;

  if (canUseBackendApi()) {
    try {
      const subjects = ['Music & Rhythm', 'Mathematics', 'Science & Space', 'Reading & Phonics'];
      const pick = subjects[Math.floor(Math.random() * subjects.length)];
      const res = await fetch(`/api/gemini/daily-fact?subject=${encodeURIComponent(pick)}`);
      if (!res.ok) {
        if (res.status === 404) _backendApiAvailable = false;
        throw new Error('Fact unavailable');
      }
      const data = await res.json();
      const f = (data && data.fact && typeof data.fact === 'object') ? data.fact : data;
      if (f && f.title && f.fact) {
        if (emojiEl) emojiEl.textContent = f.emoji || '🎵';
        titleEl.textContent = f.title;
        textEl.textContent = f.fact;
        if (chantEl) chantEl.textContent = `"${f.rhymingChant || 'Sing and learn every day!'}"`;
        if (forceRefresh) {
          audio.playNote('E5', 0.25, 'chime');
          showToast('Loaded a fresh musical fact! ✨');
        }
        return;
      }
    } catch (e) {
      // Graceful local fallback
    }
  }

  const fb = FALLBACK_FACTS[Math.floor(Math.random() * FALLBACK_FACTS.length)];
  if (emojiEl) emojiEl.textContent = fb.emoji;
  titleEl.textContent = fb.title;
  textEl.textContent = fb.fact;
  if (chantEl) chantEl.textContent = `"${fb.rhymingChant}"`;
  if (forceRefresh) {
    audio.playNote('C5', 0.25, 'chime');
    showToast('Loaded a fresh musical fact! ✨');
  }
}

function renderHomeSubjects() {
  updateTopBar();
  renderMascotAccessory();
}

function cycleOrAddProfile() {
  if (state.learners.length > 1) {
    const idx = state.learners.findIndex(l => l.id === state.activeLearnerId);
    const next = state.learners[(idx + 1) % state.learners.length];
    switchLearner(next.id);
  } else {
    addNewProfile();
  }
}

// --- INITIALIZE ON LOAD ---
function initMelodyMindsApp() {
  if (window.__melodyMindsInitialized) return;
  window.__melodyMindsInitialized = true;
  loadState();
  updateTopBar();
  renderAlphabetStrip();
  setupPiano();
  renderMascotAccessory();
  renderLearnView();
  renderMusicView();
  syncMusicPlayerUI();
  loadDailyFact(false);
  showView('home');
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initMelodyMindsApp);
} else {
  initMelodyMindsApp();
}

// Expose globals for inline HTML event handlers
window.showView = showView;
window.renderHomeSubjects = renderHomeSubjects;
window.renderLearnView = renderLearnView;
window.renderMusicView = renderMusicView;
window.filterSubjects = filterSubjects;
window.startDuoLesson = startDuoLesson;
window.selectWordTile = selectWordTile;
window.removeAnswerTile = removeAnswerTile;
window.checkLessonAnswer = checkLessonAnswer;
window.continueLesson = continueLesson;
window.claimLessonReward = claimLessonReward;
window.replayLessonAudio = replayLessonAudio;
window.closeLessonModal = closeLessonModal;
window.openChestStep = openChestStep;
window.togglePlay = togglePlay;
window.nextSong = nextSong;
window.prevSong = prevSong;
window.playSongById = playSongById;
window.toggleFavoriteSong = toggleFavoriteSong;
window.playRecordedMelody = playRecordedMelody;
window.clearRecordedMelody = clearRecordedMelody;
window.loadPresetMelody = loadPresetMelody;
window.celebrateStreak = celebrateStreak;
window.openParentGate = openParentGate;
window.submitParentGate = submitParentGate;
window.switchLearner = switchLearner;
window.addNewProfile = addNewProfile;
window.submitNewProfile = submitNewProfile;
window.cycleOrAddProfile = cycleOrAddProfile;
window.sendCompanionMessage = sendCompanionMessage;
window.sendPresetCompanionPrompt = sendPresetCompanionPrompt;
window.generateAIStorybook = generateAIStorybook;
window.generateCustomSong = generateCustomSong;
window.startMatchGame = startMatchGame;
window.selectMatchItem = selectMatchItem;
window.startRhythmGame = startRhythmGame;
window.tapRhythmDrum = tapRhythmDrum;
window.stopRhythmGame = stopRhythmGame;
window.openModal = openModal;
window.closeModals = closeModals;
window.toggleSound = toggleSound;
window.tickleMelody = tickleMelody;
window.feedMelodySnack = feedMelodySnack;
window.melodySingNote = melodySingNote;
window.melodyDanceSpin = melodyDanceSpin;
window.hitDrumPad = hitDrumPad;
window.toggleAutoBeatLoop = toggleAutoBeatLoop;
window.playAnimalSound = playAnimalSound;
window.openMagicChest = openMagicChest;
window.selectOutfit = selectOutfit;
window.switchVipTab = switchVipTab;
window.pickInstrument = pickInstrument;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.activateTier = activateTier;
window.refillGuestLives = refillGuestLives;
window.playAlphaKey = playAlphaKey;
window.loadDailyFact = loadDailyFact;
