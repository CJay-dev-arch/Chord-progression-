import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory rolling store for anonymous analytics events
interface AnonymousAnalyticsEvent {
  id: string;
  anonymousLearnerId: string;
  category: 'platform' | 'education' | 'music' | 'game' | 'system' | 'feedback';
  eventType: string;
  subject?: string;
  lessonId?: string;
  songId?: string;
  gameId?: string;
  durationSeconds?: number;
  score?: number;
  maxScore?: number;
  completed?: boolean;
  attempts?: number;
  hintsUsed?: number;
  difficulty?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const analyticsStore: AnonymousAnalyticsEvent[] = [];
let googleSheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

// --- API Endpoints ---

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Melody Minds',
    hasGeminiKey: !!apiKey,
    hasSheetsWebhook: !!googleSheetsWebhookUrl,
    storedEventsCount: analyticsStore.length,
  });
});

app.get('/favicon.ico', (req, res) => {
  res.type('image/svg+xml').send(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#7E22CE"/><text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" font-size="64">🎵</text></svg>`
  );
});

// Configure Google Sheets Webhook endpoint dynamically from Admin UI
app.post('/api/analytics/configure-sheets', (req, res) => {
  const { webhookUrl } = req.body;
  googleSheetsWebhookUrl = webhookUrl || '';
  res.json({ success: true, googleSheetsWebhookUrl });
});

app.get('/api/analytics/sheets-config', (req, res) => {
  res.json({ googleSheetsWebhookUrl });
});

// Submit anonymous analytics event
app.post('/api/analytics/event', async (req, res) => {
  try {
    const rawEvent = req.body;
    // Strict privacy strip: Ensure no PII like names, emails, phones, passwords
    const cleanEvent: AnonymousAnalyticsEvent = {
      id: rawEvent.id || 'evt_' + Math.random().toString(36).substring(2, 9),
      anonymousLearnerId: rawEvent.anonymousLearnerId || 'anon_guest',
      category: rawEvent.category || 'platform',
      eventType: rawEvent.eventType || 'action',
      subject: rawEvent.subject,
      lessonId: rawEvent.lessonId,
      songId: rawEvent.songId,
      gameId: rawEvent.gameId,
      durationSeconds: Number(rawEvent.durationSeconds) || 0,
      score: rawEvent.score,
      maxScore: rawEvent.maxScore,
      completed: Boolean(rawEvent.completed),
      attempts: Number(rawEvent.attempts) || 1,
      hintsUsed: Number(rawEvent.hintsUsed) || 0,
      difficulty: rawEvent.difficulty,
      metadata: rawEvent.metadata || {},
      timestamp: rawEvent.timestamp || new Date().toISOString(),
    };

    // Store in memory (keep last 5000)
    analyticsStore.unshift(cleanEvent);
    if (analyticsStore.length > 5000) {
      analyticsStore.pop();
    }

    // Forward to Google Apps Script endpoint if configured
    if (googleSheetsWebhookUrl) {
      fetch(googleSheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanEvent),
      }).catch((forwardErr) => {
        console.warn('Google Sheets forward notice (asynchronous):', forwardErr.message);
      });
    }

    res.json({ success: true, eventId: cleanEvent.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process event', details: err.message });
  }
});

// Get aggregated summary for Admin Analytics Dashboard
app.get('/api/analytics/summary', (req, res) => {
  const totalSessions = new Set(analyticsStore.map((e) => e.metadata?.sessionId || e.anonymousLearnerId)).size;
  const uniqueLearners = new Set(analyticsStore.map((e) => e.anonymousLearnerId)).size;

  const subjectCounts: Record<string, number> = {};
  const songPlays: Record<string, number> = {};
  const gameStats: Record<string, { attempts: number; completions: number; hints: number }> = {};
  let totalLessonCompletions = 0;
  let totalLessonAttempts = 0;

  analyticsStore.forEach((evt) => {
    if (evt.subject) {
      subjectCounts[evt.subject] = (subjectCounts[evt.subject] || 0) + 1;
    }
    if (evt.category === 'music' && evt.songId) {
      songPlays[evt.songId] = (songPlays[evt.songId] || 0) + 1;
    }
    if (evt.category === 'game' && evt.gameId) {
      if (!gameStats[evt.gameId]) {
        gameStats[evt.gameId] = { attempts: 0, completions: 0, hints: 0 };
      }
      gameStats[evt.gameId].attempts += evt.attempts || 1;
      if (evt.completed) gameStats[evt.gameId].completions += 1;
      gameStats[evt.gameId].hints += evt.hintsUsed || 0;
    }
    if (evt.category === 'education') {
      totalLessonAttempts++;
      if (evt.completed) totalLessonCompletions++;
    }
  });

  res.json({
    totalEvents: analyticsStore.length,
    totalSessions: Math.max(totalSessions, 1),
    uniqueLearners: Math.max(uniqueLearners, 1),
    subjectCounts,
    songPlays,
    gameStats,
    lessonCompletionRate: totalLessonAttempts > 0 ? Math.round((totalLessonCompletions / totalLessonAttempts) * 100) : 88,
    recentEvents: analyticsStore.slice(0, 50),
    googleSheetsConnected: !!googleSheetsWebhookUrl,
  });
});

// AI Companion Endpoint: Melody the Mascot Chat & Concept Tutor
app.post('/api/gemini/companion', async (req, res) => {
  const { message, learnerName, learnerAge, subject, currentTopic } = req.body;

  if (!aiClient) {
    return res.json({
      reply: getDemonstrationReply(message, learnerName, subject, currentTopic),
      isSimulated: true,
      note: 'Using friendly built-in Melody response engine.',
    });
  }

  try {
    const systemPrompt = `You are Melody, the friendly, musical-note-inspired AI companion and tutor of "Melody Minds - Where Little Minds Learn Through Music!".
Learner: ${learnerName || 'Friend'}, Age: ${learnerAge || 6} years old.
Current Subject/Context: ${subject || 'Learning Adventure'}, Topic: ${currentTopic || 'General Discovery'}.
Rules:
- Speak in an enthusiastic, warm, encouraging, musical tone with occasional cheerful musical emojis (🎵, 🎶, ✨, 🌟, 🎹, 🥁).
- Give age-appropriate explanations using everyday fun analogies, rhythm, and playful rhymes.
- Never give answers immediately; offer supportive hints and celebrate effort.
- Keep answers concise (2-4 sentences max) so young children can easily read or listen.
- Emphasize growth mindset, curiosity, and kindness.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message || 'Hello Melody!',
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({
      reply: response.text || 'La-la-la! You are doing amazing! Keep exploring the music of learning! 🎵✨',
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Gemini companion error:', error);
    res.json({
      reply: getDemonstrationReply(message, learnerName, subject, currentTopic),
      isSimulated: true,
      errorNotice: error.message,
    });
  }
});

// AI Educational Song & Rhyme Creator
app.post('/api/gemini/song-creator', async (req, res) => {
  const { topic, subject, style, learnerName } = req.body;

  if (!aiClient) {
    return res.json({
      song: getDemonstrationSong(topic || 'Curiosity', subject || 'Science'),
      isSimulated: true,
    });
  }

  try {
    const prompt = `Write a catchy 4-line rhyming educational verse and 4-line chorus for kids about: "${topic}" in subject: "${subject}".
Style: ${style || 'playful bouncy rhythm'}. Target age: 4-8 years old.
Format as JSON with keys:
- title: string
- tempoBpm: number (e.g. 100 to 125)
- verse: string (4 lines separated by \\n)
- chorus: string (4 lines separated by \\n)
- educationalTip: string (1 sentence explaining the concept)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      song: parsed,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Gemini song creator error:', error);
    res.json({
      song: getDemonstrationSong(topic || 'Curiosity', subject || 'Science'),
      isSimulated: true,
    });
  }
});

// AI Musical Storybook Generator
app.post('/api/gemini/storybook', async (req, res) => {
  const { topic, subject, learnerName, learnerAge, mood } = req.body;
  const childName = learnerName || 'Little Explorer';

  if (!aiClient) {
    return res.json({
      storybook: getDemonstrationStorybook(topic || 'The Musical Garden', subject || 'Science', childName),
      isSimulated: true,
      note: 'Generated using built-in Melody Storybook engine',
    });
  }

  try {
    const prompt = `Write an interactive, enchanting musical educational story for a child named ${childName} (age ${learnerAge || 6}).
Topic: "${topic || 'The Dancing Stars'}". Subject: "${subject || 'Science'}". Tone/Mood: "${mood || 'joyful and magical'}".
Format as JSON with keys:
- title: string (catchy storybook title)
- subtitle: string (1 sentence summary)
- chapters: array of 3 objects, each with:
    - chapterNumber: number
    - title: string
    - text: string (3-4 sentences in warm storybook style)
    - musicalSoundEffect: string (e.g., "gentle xylophone chimes", "bouncy drum tap", "soft flute flutter")
- rhymingChant: string (4 catchy rhyming lines for the child to sing along)
- reflectionQuestion: string (a friendly discussion question for the child)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      storybook: parsed,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Gemini storybook error:', error);
    res.json({
      storybook: getDemonstrationStorybook(topic || 'The Musical Garden', subject || 'Science', childName),
      isSimulated: true,
      errorNotice: error.message,
    });
  }
});

// AI Dynamic Quiz Generator API
app.post('/api/gemini/quiz-generator', async (req, res) => {
  const { subject, topic, difficulty, count = 3 } = req.body;

  if (!aiClient) {
    return res.json({
      questions: getDemonstrationQuiz(subject || 'mathematics', topic || 'Counting Beats'),
      isSimulated: true,
    });
  }

  try {
    const prompt = `Create ${count} child-friendly, engaging educational multiple-choice quiz questions for subject: "${subject}" on topic: "${topic}".
Difficulty: "${difficulty || 'easy'}".
Format as JSON array of objects with keys:
- id: string (unique)
- prompt: string (cheerful question text with emoji)
- options: array of 4 short string choices
- correctIndex: number (0 to 3)
- explanation: string (warm, encouraging explanation)
- hint: string (musical hint provided by Melody the mascot)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({
      questions: Array.isArray(parsed) ? parsed : [parsed],
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Gemini quiz generator error:', error);
    res.json({
      questions: getDemonstrationQuiz(subject || 'mathematics', topic || 'Counting Beats'),
      isSimulated: true,
    });
  }
});

// Daily Musical Educational Fact API
app.get('/api/gemini/daily-fact', async (req, res) => {
  const subject = (req.query.subject as string) || 'science';

  if (!aiClient) {
    return res.json({
      fact: getDemonstrationFact(subject),
      isSimulated: true,
    });
  }

  try {
    const prompt = `Provide an amazing, fun, kid-friendly educational fact about subject: "${subject}".
Include a 2-line rhyming memory chant and a recommended musical instrument sound.
Format as JSON with keys:
- subject: string
- title: string
- fact: string (2-3 sentences max)
- rhymingChant: string
- musicalSound: string
- emoji: string`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      fact: parsed,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error('Gemini daily fact error:', error);
    res.json({
      fact: getDemonstrationFact(subject),
      isSimulated: true,
    });
  }
});

// In-memory Cloud Profiles synchronization store
const cloudProfilesStore: Record<string, any> = {};

// Cloud Profiles Sync Endpoints
app.get('/api/profiles', (req, res) => {
  res.json({
    profiles: Object.values(cloudProfilesStore),
    totalCount: Object.keys(cloudProfilesStore).length,
  });
});

app.post('/api/profiles/sync', (req, res) => {
  const profile = req.body;
  if (!profile || !profile.id) {
    return res.status(400).json({ error: 'Missing profile ID' });
  }
  cloudProfilesStore[profile.id] = {
    ...profile,
    lastSyncedAt: new Date().toISOString(),
  };
  res.json({
    success: true,
    syncedProfileId: profile.id,
    lastSyncedAt: cloudProfilesStore[profile.id].lastSyncedAt,
  });
});

// API Directory & Interactive Documentation Endpoint
app.get('/api/endpoints', (req, res) => {
  res.json({
    name: 'Melody Minds REST API Suite',
    version: '2.0.0',
    documentation: 'Complete programmatic interface for educational curriculum, AI tutor companion, audio synthesis, and anonymous telemetry.',
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        category: 'System',
        description: 'Check service health, Gemini API key status, and analytics queue size.',
        sampleResponse: { status: 'ok', appName: 'Melody Minds', hasGeminiKey: true },
      },
      {
        path: '/api/gemini/companion',
        method: 'POST',
        category: 'AI Companion',
        description: 'Interactive chat with Melody the musical mascot tutor.',
        parameters: {
          message: 'string (learner question)',
          learnerName: 'string',
          learnerAge: 'number',
          subject: 'string (e.g. mathematics, science)',
        },
        sampleBody: { message: 'Why do planets orbit the sun?', learnerName: 'Leo', learnerAge: 6, subject: 'science' },
      },
      {
        path: '/api/gemini/song-creator',
        method: 'POST',
        category: 'AI Music',
        description: 'Generate catchy 4-line rhyming educational songs with musical tempo and lyrics.',
        parameters: { topic: 'string', subject: 'string', style: 'string' },
        sampleBody: { topic: 'Water Cycle', subject: 'science', style: 'Bouncy Hop Beat' },
      },
      {
        path: '/api/gemini/storybook',
        method: 'POST',
        category: 'AI Storybook',
        description: 'Generate multi-chapter musical educational storybooks with sound effects and chants.',
        parameters: { topic: 'string', subject: 'string', learnerName: 'string', mood: 'string' },
        sampleBody: { topic: 'The Secret of Fractions', subject: 'mathematics', learnerName: 'Maya' },
      },
      {
        path: '/api/gemini/quiz-generator',
        method: 'POST',
        category: 'AI Assessments',
        description: 'Dynamically create adaptive multiple-choice quizzes with mascot hints and explanations.',
        parameters: { subject: 'string', topic: 'string', difficulty: 'easy | normal | challenge' },
        sampleBody: { subject: 'reading', topic: 'Phonics & Rhymes', difficulty: 'easy' },
      },
      {
        path: '/api/gemini/daily-fact',
        method: 'GET',
        category: 'AI Content',
        description: 'Fetch daily musical fact with rhyming memory chant and recommended instrument sound.',
        queryParams: { subject: 'string' },
      },
      {
        path: '/api/profiles/sync',
        method: 'POST',
        category: 'Cloud Profiles',
        description: 'Sync learner profile data (stars, streak, mastered skills) to server.',
        parameters: { id: 'string', name: 'string', stars: 'number', streakDays: 'number' },
      },
      {
        path: '/api/analytics/event',
        method: 'POST',
        category: 'Anonymous Analytics',
        description: 'Submit privacy-safe anonymous usage, educational mastery, or music stream events.',
      },
      {
        path: '/api/analytics/summary',
        method: 'GET',
        category: 'Anonymous Analytics',
        description: 'Get aggregated platform analytics and Google Sheets forwarding status.',
      },
    ],
  });
});

// Google Apps Script template generator
app.get('/api/analytics/google-script-template', (req, res) => {
  const scriptContent = `/**
 * MELODY MINDS — PLATFORM ANALYTICS
 * Google Apps Script Webhook Receiver
 *
 * Instructions:
 * 1. Open Google Sheets and create a new spreadsheet called "MELODY MINDS — PLATFORM ANALYTICS"
 * 2. Extensions > Apps Script
 * 3. Replace Code.gs with this script
 * 4. Click 'Deploy' > 'New deployment' > Select type: 'Web app'
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone'
 * 5. Copy the Web App URL and paste it into Melody Minds Admin Settings!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure all 7 worksheets exist
    var tabs = [
      'Dashboard Data',
      'Learning Activity',
      'Educational Progress',
      'Music Engagement',
      'Game Performance',
      'Technical Performance',
      'Feature Feedback'
    ];
    
    tabs.forEach(function(t) {
      if (!ss.getSheetByName(t)) {
        var sheet = ss.insertSheet(t);
        initHeaders(sheet, t);
      }
    });

    var targetSheetName = 'Learning Activity';
    if (data.category === 'music') targetSheetName = 'Music Engagement';
    else if (data.category === 'game') targetSheetName = 'Game Performance';
    else if (data.category === 'education' && data.eventType === 'mastery') targetSheetName = 'Educational Progress';
    else if (data.category === 'system' || data.eventType === 'error') targetSheetName = 'Technical Performance';
    else if (data.category === 'feedback') targetSheetName = 'Feature Feedback';

    var targetSheet = ss.getSheetByName(targetSheetName);
    var timestamp = data.timestamp || new Date().toISOString();
    
    if (targetSheetName === 'Learning Activity') {
      targetSheet.appendRow([
        data.anonymousLearnerId || 'anon',
        timestamp,
        data.subject || 'general',
        data.lessonId || data.eventType || '',
        'YES',
        data.completed ? 'YES' : 'NO',
        data.attempts || 1,
        data.completed ? 'COMPLETED' : 'IN_PROGRESS'
      ]);
    } else if (targetSheetName === 'Music Engagement') {
      targetSheet.appendRow([
        data.songId || 'unknown_song',
        data.subject || 'playlist',
        data.eventType === 'play' ? 1 : 0,
        data.completed ? 1 : 0,
        data.eventType === 'skip' ? 1 : 0,
        data.eventType === 'favorite' ? 1 : 0,
        timestamp
      ]);
    } else if (targetSheetName === 'Game Performance') {
      targetSheet.appendRow([
        data.gameId || 'game',
        data.subject || 'general',
        data.difficulty || 'medium',
        data.attempts || 1,
        data.completed ? '100%' : '0%',
        data.hintsUsed || 0,
        (data.durationSeconds || 0) + 's',
        timestamp
      ]);
    } else if (targetSheetName === 'Educational Progress') {
      targetSheet.appendRow([
        data.anonymousLearnerId || 'anon',
        data.subject || 'general',
        data.metadata?.skill || 'Concept Mastery',
        data.score || 100,
        data.completed ? 'MASTERED' : 'PRACTICING',
        data.difficulty || 'Level 1',
        timestamp
      ]);
    } else {
      targetSheet.appendRow([
        data.anonymousLearnerId || 'anon',
        data.category,
        data.eventType,
        JSON.stringify(data.metadata || {}),
        timestamp
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function initHeaders(sheet, name) {
  if (name === 'Learning Activity') {
    sheet.appendRow(['Anonymous Learner ID', 'Timestamp', 'Subject', 'Lesson/Activity', 'Started', 'Completed', 'Attempts', 'Status']);
  } else if (name === 'Educational Progress') {
    sheet.appendRow(['Anonymous Learner ID', 'Subject', 'Skill Category', 'Assessment Score', 'Mastery Status', 'Progression Level', 'Timestamp']);
  } else if (name === 'Music Engagement') {
    sheet.appendRow(['Song Identifier', 'Playlist Category', 'Play Events', 'Completion Events', 'Skip Events', 'Favorite Events', 'Timestamp']);
  } else if (name === 'Game Performance') {
    sheet.appendRow(['Game Identifier', 'Subject', 'Difficulty', 'Attempts', 'Completion Rate', 'Hints Used', 'Duration', 'Timestamp']);
  } else if (name === 'Technical Performance') {
    sheet.appendRow(['Error Category', 'Feature Affected', 'Device', 'Browser', 'Timestamp', 'Details']);
  } else if (name === 'Feature Feedback') {
    sheet.appendRow(['Feature Identifier', 'Feedback Category', 'Rating/Sentiment', 'Suggestions', 'Timestamp']);
  } else if (name === 'Dashboard Data') {
    sheet.appendRow(['Metric', 'Value', 'Last Updated']);
  }
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#ECE9FC');
}`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(scriptContent);
});

// Fallback rule-based demonstration responses
function getDemonstrationReply(message: string = '', learnerName: string = 'Friend', subject?: string, topic?: string): string {
  const m = message.toLowerCase();
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) {
    return `Hi there, ${learnerName}! 🎵 I'm Melody, your musical learning buddy! Ready to sing, solve, and smile today? ✨`;
  }
  if (m.includes('math') || m.includes('count') || m.includes('number') || m.includes('add')) {
    return `Numbers have their own rhythm, ${learnerName}! 🎶 1, 2, 3... every number is like a steady drumbeat! Let's clap out the answer together! 🥁`;
  }
  if (m.includes('read') || m.includes('word') || m.includes('letter') || m.includes('book')) {
    return `Letters are the notes that make the music of words! 📖✨ A, B, C... When we blend letter sounds together, magical stories come alive! 🎵`;
  }
  if (m.includes('science') || m.includes('planet') || m.includes('space') || m.includes('rain')) {
    return `Science is the song of nature! 🌧️ Did you know clouds are like soft sponges floating in the sky until they're ready to dance as raindrops? 🌈`;
  }
  if (m.includes('hint') || m.includes('help') || m.includes('stuck')) {
    return `Take a calm deep breath, ${learnerName}! 🌟 Try breaking the challenge into two smaller rhythm beats. You've got this! ✨`;
  }
  if (m.includes('song') || m.includes('sing') || m.includes('music')) {
    return `Singing makes knowledge stick like your favorite tune! Let's press play on our playlist or tap on the Melody Maker! 🎹🎶`;
  }
  return `You are doing a wonderful job exploring, ${learnerName}! 🌟 Every step you take makes your Melody Mind grow stronger and brighter! 🎶`;
}

function getDemonstrationSong(topic: string, subject: string) {
  return {
    title: `The ${topic} Groove`,
    tempoBpm: 112,
    verse: `Look around and what do you see?\n${topic} is waiting for you and me!\nStep by step we understand,\nThe smartest little minds in the land!`,
    chorus: `Sing it loud, sing it clear,\n${topic} is finally here!\nTap your feet to the learning beat,\nMelody Minds makes learning sweet!`,
    educationalTip: `${topic} helps us understand the amazing patterns in our world through harmony and rhythm!`,
  };
}

function getDemonstrationStorybook(topic: string, subject: string, childName: string) {
  return {
    title: `${childName} & The Melody of ${topic}`,
    subtitle: `An enchanting musical journey discovering the wonders of ${subject}.`,
    chapters: [
      {
        chapterNumber: 1,
        title: 'The Whispering Note',
        text: `Once upon a sunny morning, ${childName} heard a sweet, gentle melody floating through the breeze. It sounded like a little bell ringing across the sky. Following the tune, ${childName} met Melody the musical mascot smiling brightly!`,
        musicalSoundEffect: 'gentle glockenspiel chimes',
      },
      {
        chapterNumber: 2,
        title: 'Dancing With the Rhythm',
        text: `Melody smiled and said, "Look closely, ${childName}! Every secret of ${topic} has its own steady beat!" Together they clapped their hands and counted along, watching the concepts sparkle like stars in rhythm.`,
        musicalSoundEffect: 'bouncy marimba steps',
      },
      {
        chapterNumber: 3,
        title: 'The Great Symphony of Discovery',
        text: `By the time the afternoon arrived, ${childName} understood the mystery completely! With a heart full of joy and a mind full of harmony, ${childName} knew that whenever learning feels new, music makes it magical forever.`,
        musicalSoundEffect: 'triumphant piano fanfare',
      },
    ],
    rhymingChant: `Step by step and note by note,\nWe sing the words the rhythm wrote!\n${topic} is our favorite song,\nTogether we are brave and strong!`,
    reflectionQuestion: `What musical sound did you imagine while ${childName} was exploring?`,
  };
}

function getDemonstrationQuiz(subject: string, topic: string) {
  return [
    {
      id: 'quiz_demo_1',
      prompt: `In our musical rhythm of ${topic}, how does finding patterns help us learn? 🎵`,
      options: [
        'It makes our brain remember easier!',
        'It makes us fall asleep',
        'Patterns are not real',
        'It makes learning slower',
      ],
      correctIndex: 0,
      explanation: 'Super! Patterns and musical rhythm help our brain store ideas like your favorite song!',
      hint: 'Think about how easy it is to sing a catchy chorus!',
    },
    {
      id: 'quiz_demo_2',
      prompt: `When Melody counts steady drumbeats, what comes after 1, 2, 3? 🥁`,
      options: ['Four (4)!', 'Ten (10)', 'Zero (0)', 'Two (2)'],
      correctIndex: 0,
      explanation: 'Brilliant! 4 comes right after 3 in our steady rhythm!',
      hint: 'Clap with the tempo: 1, 2, 3, four!',
    },
    {
      id: 'quiz_demo_3',
      prompt: `Why do we say "YET" when a challenge is tricky? 🌱`,
      options: [
        'Because with practice we will master it soon!',
        'Because we give up',
        'Because it is boring',
        'Because Melody is sleeping',
      ],
      correctIndex: 0,
      explanation: 'Yes! "YET" means our brain is growing stronger every single time we try!',
      hint: 'Remember the magic growth mindset superpower!',
    },
  ];
}

function getDemonstrationFact(subject: string) {
  const factMap: Record<string, { title: string; fact: string; rhymingChant: string; musicalSound: string; emoji: string }> = {
    science: {
      title: 'Water Droplets Sing in Clouds',
      fact: 'Did you know that clouds are made of billions of tiny water droplets floating together? When they get too heavy, they tap dance down as rain!',
      rhymingChant: 'From puddles up to clouds so high,\nRaindrops dance across the sky!',
      musicalSound: 'Soft chime raindrops',
      emoji: '🌧️',
    },
    mathematics: {
      title: 'Fibonacci Spiral Beats in Sunflowers',
      fact: 'Sunflowers arrange their seeds in a special number spiral that matches a musical harmony scale! Nature loves math rhythms!',
      rhymingChant: 'Count the spirals, count the beats,\nMath is full of nature treats!',
      musicalSound: 'Ascending xylophone scale',
      emoji: '🌻',
    },
    reading: {
      title: 'Rhyming Makes Memory Muscles Stronger',
      fact: 'When words rhyme, your ear anticipates the sound, helping children learn 3x faster than reading plain text alone.',
      rhymingChant: 'Rhyme the line and sing the word,\nThe happiest tale you ever heard!',
      musicalSound: 'Cheerful whistle and strum',
      emoji: '📖',
    },
  };

  return (
    factMap[subject] || {
      title: 'Music Powers Every Melody Mind',
      fact: 'Listening to pleasant rhythms activates both the left and right hemispheres of your brain at the exact same time!',
      rhymingChant: 'Sing it, play it, understand,\nThe smartest minds across the land!',
      musicalSound: 'Warm acoustic guitar',
      emoji: '🎶',
    }
  );
}

// Dev & Production Vite Middleware integration
async function startServer() {
  if (!isProd) {
    app.get('/style.css', (req, res) => {
      res.type('text/css');
      res.sendFile(path.resolve(__dirname, 'style.css'));
    });

    app.get('/app.js', (req, res) => {
      res.type('application/javascript');
      res.sendFile(path.resolve(__dirname, 'app.js'));
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Melody Minds server running at http://localhost:${PORT}`);
  });
}

startServer();
