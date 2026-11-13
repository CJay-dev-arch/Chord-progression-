/* SoundSprout prototype
 * Frontend-only learning demo. See CONFIG below to connect your own API.
 * Do not use the demo account flow for real children or real personal data.
 */
(() => {
  "use strict";

  const CONFIG = {
    // Set these to your deployed backend when ready. Leave blank for local demo mode.
    apiBaseUrl: "",
    websocketUrl: "",
    appVersion: "0.1.0"
  };

  const $ = (selector) => document.querySelector(selector);
  const dialog = $("#appDialog");
  const dialogBody = $("#dialogBody");
  const toast = $("#toast");

  const state = {
    profile: null,
    beatsPlayed: 0,
    starsEarned: 0,
    lessonsCompleted: [],
    testAnswers: [],
    selectedChoice: null,
    audioContext: null,
    ws: null,
    tapTimes: [],
    telemetry: [],
    currentLesson: null
  };

  const lessons = {
    rhythm: {
      title: "Rhythm Rangers",
      intro: "A rhythm is a pattern of sounds. Let’s listen and keep a steady beat!",
      question: "Which pattern has a steady beat?",
      choices: ["Tap… tap… tap…", "Tap… wait… TAP!", "No taps at all"],
      correct: 0,
      skill: "Focus & listening",
      reward: "Rhythm Ranger"
    },
    feelings: {
      title: "Feelings DJ",
      intro: "Music can sound calm, excited, or sad. All feelings are okay. Let’s notice what we hear.",
      question: "Which music might help someone feel calm before bed?",
      choices: ["A soft, slow tune", "A super-fast drum solo", "The loudest sound possible"],
      correct: 0,
      skill: "Emotional awareness",
      reward: "Feelings DJ"
    },
    saving: {
      title: "Save-a-Beat",
      intro: "Saving means keeping a little now so you can reach a goal later. Small steps add up!",
      question: "You have 5 tokens and want a toy that costs 8. What could you do?",
      choices: ["Save 3 more tokens", "Spend all 5 right away", "Give up on the goal"],
      correct: 0,
      skill: "Planning & money basics",
      reward: "Goal Getter"
    }
  };

  function logEvent(eventName, details = {}) {
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      appVersion: CONFIG.appVersion,
      details
    };
    state.telemetry.push(event);
    // Optional endpoint: send event data when a backend has been configured.
    if (CONFIG.apiBaseUrl) {
      fetch(`${CONFIG.apiBaseUrl.replace(/\/$/, "")}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        keepalive: true
      }).catch(() => {});
    }
    return event;
  }

  let sessionId;
  function getSessionId() {
    if (!sessionId) sessionId = `ss-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return sessionId;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function openDialog(content) {
    dialogBody.innerHTML = content;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  function closeDialog() {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  async function getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      showToast("Audio playback is not supported in this browser.");
      return null;
    }
    if (!state.audioContext) state.audioContext = new AudioContextClass({ latencyHint: "interactive" });
    if (state.audioContext.state === "suspended") await state.audioContext.resume();
    return state.audioContext;
  }

  async function playTone(frequency = 440, duration = 0.14, waveform = "sine") {
    const context = await getAudioContext();
    if (!context) return;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.17, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    logEvent("audio_tone_played", {
      frequencyHz: frequency,
      durationMs: Math.round(duration * 1000),
      waveform,
      outputLatencySeconds: context.outputLatency ?? null,
      baseLatencySeconds: context.baseLatency ?? null
    });
  }

  async function playSequence(notes = [392, 440, 523, 440]) {
    const context = await getAudioContext();
    if (!context) return;
    const start = context.currentTime + 0.04;
    notes.forEach((frequency, index) => {
      const at = start + index * 0.24;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.14, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.18);
    });
    logEvent("audio_sequence_played", {
      noteCount: notes.length,
      frequenciesHz: notes,
      baseLatencySeconds: context.baseLatency ?? null,
      outputLatencySeconds: context.outputLatency ?? null
    });
  }

  function updateStats() {
    $("#beatsPlayed").textContent = String(state.beatsPlayed);
    $("#starsEarned").textContent = String(state.starsEarned);
    $("#skillsCount").textContent = String(Math.max(3, new Set(state.lessonsCompleted.map((id) => lessons[id]?.skill)).size + 2));
    $("#firstStarStatus").textContent = state.starsEarned > 0 ? "⭐" : "🔒";
    $("#beatBadgeStatus").textContent = state.beatsPlayed >= 5 ? "🏅" : "🔒";
    $("#beatMessage").textContent = state.beatsPlayed ? `Great tapping! ${state.beatsPlayed} beat${state.beatsPlayed === 1 ? "" : "s"} played.` : "Ready when you are!";
  }

  function showLevelTest() {
    state.testAnswers = [];
    const questions = [
      { q: "How easy is it to follow a beat?", options: ["I’m just starting", "Sometimes I can", "I can follow most beats"] },
      { q: "When a song has a pattern, can you repeat it?", options: ["Not yet", "With a little help", "Usually, yes"] },
      { q: "How do you like to learn?", options: ["Watch and listen", "Try it with hints", "Challenge me!"] }
    ];
    let index = 0;
    function renderQuestion() {
      const item = questions[index];
      openDialog(`
        <p class="eyebrow">LEVEL CHECK · ${index + 1} OF ${questions.length}</p>
        <h2 id="dialogTitle">Let’s find your learning level!</h2>
        <p>${item.q}</p>
        <div class="choice-grid">${item.options.map((option, i) => `<button class="choice-button" type="button" data-answer="${i}">${option}</button>`).join("")}</div>
        <p class="dialog-note">This is a friendly starting point, not a test you can fail.</p>
        <div class="dialog-actions"><button class="button button-primary" id="nextTest" type="button" disabled>${index === questions.length - 1 ? "See my level" : "Next question →"}</button></div>
      `);
      state.selectedChoice = null;
      dialogBody.querySelectorAll("[data-answer]").forEach((button) => {
        button.addEventListener("click", () => {
          state.selectedChoice = Number(button.dataset.answer);
          dialogBody.querySelectorAll("[data-answer]").forEach((b) => b.classList.toggle("selected", b === button));
          $("#nextTest").disabled = false;
        });
      });
      $("#nextTest").addEventListener("click", () => {
        if (state.selectedChoice === null) return;
        state.testAnswers.push(state.selectedChoice);
        logEvent("level_check_answer", { questionIndex: index, answerIndex: state.selectedChoice });
        index += 1;
        if (index < questions.length) renderQuestion();
        else {
          const score = state.testAnswers.reduce((sum, value) => sum + value, 0);
          const level = score <= 2 ? "Seedling" : score <= 5 ? "Sprout" : "Superstar";
          logEvent("level_check_completed", { score, level });
          openDialog(`
            <p class="eyebrow">YOUR STARTING POINT</p><h2 id="dialogTitle">You’re a ${level}! 🌱</h2>
            <div class="result-score">♫ ${level} learner</div>
            <p>We’ll start with short, playful activities and you can move up whenever you feel ready. This result is only a guide—not a judgement.</p>
            <div class="dialog-actions"><button class="button button-primary" id="doneTest" type="button">Let’s learn!</button></div>
          `);
          $("#doneTest").addEventListener("click", () => { closeDialog(); showToast("Your adventure starts now!"); });
        }
      });
    }
    renderQuestion();
  }

  function startLesson(id) {
    const lesson = lessons[id];
    if (!lesson) return;
    state.currentLesson = id;
    logEvent("lesson_started", { lessonId: id, title: lesson.title });
    openDialog(`
      <p class="eyebrow">MUSIC + LIFE SKILLS</p><h2 id="dialogTitle">${lesson.title}</h2>
      <p>${lesson.intro}</p>
      <div class="beat-stage"><div class="beat-orb" aria-hidden="true">♫</div><button class="tap-button" id="lessonSound" type="button">PLAY</button></div>
      <p style="margin-top:16px"><strong>${lesson.question}</strong></p>
      <div class="choice-grid">${lesson.choices.map((choice, i) => `<button class="choice-button" data-lesson-answer="${i}" type="button">${choice}</button>`).join("")}</div>
      <p class="dialog-note" id="lessonFeedback" aria-live="polite">Choose the answer that feels right to you.</p>
      <div class="dialog-actions"><button class="button button-primary" id="finishLesson" type="button" disabled>Finish lesson</button></div>
    `);
    $("#lessonSound").addEventListener("click", () => playSequence(id === "rhythm" ? [392, 392, 392, 523] : id === "feelings" ? [523, 440, 392] : [330, 392, 440, 523]));
    let answered = false;
    dialogBody.querySelectorAll("[data-lesson-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const answer = Number(button.dataset.lessonAnswer);
        const correct = answer === lesson.correct;
        button.classList.add("selected");
        $("#lessonFeedback").textContent = correct
          ? "That’s it! You’re learning by listening and thinking. 🌟"
          : `Nice try! The answer to think about is: ${lesson.choices[lesson.correct]}`;
        logEvent("lesson_answer", { lessonId: id, answerIndex: answer, correct, skill: lesson.skill });
        $("#finishLesson").disabled = false;
      });
    });
    $("#finishLesson").addEventListener("click", () => {
      if (!answered) return;
      if (!state.lessonsCompleted.includes(id)) {
        state.lessonsCompleted.push(id);
        state.starsEarned += 1;
      }
      logEvent("lesson_completed", { lessonId: id, skill: lesson.skill, totalStars: state.starsEarned });
      saveProgress();
      updateStats();
      closeDialog();
      showToast(`Star earned! ${lesson.reward} 🌟`);
    });
  }

  function showProfile() {
    const name = state.profile?.name || "Little learner";
    openDialog(`
      <p class="eyebrow">YOUR SPACE</p><h2 id="dialogTitle">Hello, ${escapeHTML(name)}! 👋</h2>
      <p>This demo keeps your progress in this browser. A real account needs secure server-side authentication and a parent/guardian consent flow.</p>
      <label class="form-label" for="learnerName">What should we call you?</label>
      <input class="text-input" id="learnerName" maxlength="24" autocomplete="nickname" placeholder="Your first name or nickname" value="${escapeHTML(state.profile?.name || "")}">
      <div class="dialog-actions"><button class="button button-primary" id="saveProfile" type="button">Save nickname</button><button class="button button-outline" id="exportTelemetry" type="button">Export activity log</button></div>
      <p class="dialog-note">Please don’t enter your full name, school, address, or other private details in this prototype.</p>
    `);
    $("#saveProfile").addEventListener("click", () => {
      const name = $("#learnerName").value.trim().slice(0, 24);
      state.profile = { name: name || "Little learner" };
      localStorage.setItem("soundsprout-profile", JSON.stringify(state.profile));
      $("#greeting").textContent = name ? `Hey, ${name}! Ready to play?` : "Ready to make some noise?";
      logEvent("profile_nickname_saved", { nicknameProvided: Boolean(name) });
      closeDialog();
      showToast("Nickname saved on this device.");
    });
    $("#exportTelemetry").addEventListener("click", exportTelemetry);
  }

  function showProgress() {
    const completedTitles = state.lessonsCompleted.map((id) => lessons[id].title);
    openDialog(`
      <p class="eyebrow">YOUR PROGRESS</p><h2 id="dialogTitle">Every little step counts!</h2>
      <div class="result-score">⭐ ${state.starsEarned} star${state.starsEarned === 1 ? "" : "s"} earned</div>
      <p><strong>Quick-play beats:</strong> ${state.beatsPlayed}</p>
      <p><strong>Lessons finished:</strong> ${completedTitles.length ? completedTitles.map(escapeHTML).join(", ") : "Not yet—pick a lesson to get started!"}</p>
      <p class="dialog-note">Progress is stored locally in this browser for this prototype.</p>
      <div class="dialog-actions"><button class="button button-primary" id="closeProgress" type="button">Keep going</button><button class="button button-outline" id="exportProgress" type="button">Export activity log</button></div>
    `);
    $("#closeProgress").addEventListener("click", closeDialog);
    $("#exportProgress").addEventListener("click", exportTelemetry);
  }

  function exportTelemetry() {
    const payload = {
      schemaVersion: "1.0",
      appVersion: CONFIG.appVersion,
      exportedAt: new Date().toISOString(),
      sessionId: getSessionId(),
      summary: { beatsPlayed: state.beatsPlayed, starsEarned: state.starsEarned, lessonsCompleted: state.lessonsCompleted },
      events: state.telemetry
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `soundsprout-activity-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Activity log exported.");
    logEvent("telemetry_exported", { eventCount: payload.events.length });
  }

  function saveProgress() {
    const data = { beatsPlayed: state.beatsPlayed, starsEarned: state.starsEarned, lessonsCompleted: state.lessonsCompleted };
    try { localStorage.setItem("soundsprout-progress", JSON.stringify(data)); } catch (_) {}
    cacheAsset("soundsprout-progress", data);
  }

  function loadProgress() {
    try {
      const profile = JSON.parse(localStorage.getItem("soundsprout-profile") || "null");
      if (profile && typeof profile.name === "string") {
        state.profile = profile;
        $("#greeting").textContent = profile.name ? `Hey, ${profile.name}! Ready to play?` : "Ready to make some noise?";
      }
      const progress = JSON.parse(localStorage.getItem("soundsprout-progress") || "null");
      if (progress) {
        state.beatsPlayed = Number(progress.beatsPlayed) || 0;
        state.starsEarned = Number(progress.starsEarned) || 0;
        state.lessonsCompleted = Array.isArray(progress.lessonsCompleted) ? progress.lessonsCompleted.filter((id) => lessons[id]) : [];
      }
    } catch (_) {}
    updateStats();
  }

  // IndexedDB asset/progress cache. This is a lightweight local cache, not a full offline PWA.
  function openCacheDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
      const request = indexedDB.open("SoundSproutCache", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function cacheAsset(key, value) {
    try {
      const db = await openCacheDB();
      const transaction = db.transaction("assets", "readwrite");
      transaction.objectStore("assets").put(value, key);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => db.close();
    } catch (_) {
      // The app still works without IndexedDB; localStorage stores small progress values.
    }
  }

  async function connectWebSocket() {
    if (!CONFIG.websocketUrl || !("WebSocket" in window)) return;
    try {
      state.ws = new WebSocket(CONFIG.websocketUrl);
      state.ws.addEventListener("open", () => logEvent("websocket_connected"));
      state.ws.addEventListener("error", () => logEvent("websocket_error"));
      state.ws.addEventListener("close", () => logEvent("websocket_closed"));
    } catch (_) {
      logEvent("websocket_unavailable");
    }
  }

  function init() {
    loadProgress();
    connectWebSocket();
    logEvent("app_opened", { viewportWidth: window.innerWidth, viewportHeight: window.innerHeight });
    $("#startLevelTest").addEventListener("click", showLevelTest);
    $("#profileButton").addEventListener("click", showProfile);
    $("#parentSettings").addEventListener("click", () => {
      openDialog(`<p class="eyebrow">FOR PARENTS & GUARDIANS</p><h2 id="dialogTitle">A note for grown-ups</h2>
        <p>This is a frontend prototype, not a production account system. Before launch, add verified adult sign-in, parental consent, child-privacy safeguards, accessible lesson design, and a backend with appropriate security controls.</p>
        <p><strong>Performance note:</strong> this demo plays tones using the browser Web Audio API. Under-20ms end-to-end audio latency cannot be guaranteed across devices, browsers, audio hardware, or networks.</p>
        <div class="dialog-actions"><button class="button button-primary" id="parentClose" type="button">Got it</button><button class="button button-outline" id="parentExport" type="button">Export activity log</button></div>`);
      $("#parentClose").addEventListener("click", closeDialog);
      $("#parentExport").addEventListener("click", exportTelemetry);
    });
    $("#viewProgress").addEventListener("click", showProgress);
    $("#closeDialog").addEventListener("click", closeDialog);
    $("#playWelcomeTune").addEventListener("click", () => playSequence([392, 440, 523, 659]));
    $("#playBeat").addEventListener("click", async () => {
      await playTone(440, 0.13, "triangle");
      window.setTimeout(() => playTone(440, 0.13, "triangle"), 260);
      window.setTimeout(() => playTone(523, 0.13, "triangle"), 520);
      $("#beatOrb").classList.add("pulse");
      window.setTimeout(() => $("#beatOrb").classList.remove("pulse"), 650);
      logEvent("quick_play_sequence_started");
    });
    $("#tapBeat").addEventListener("click", () => {
      const now = performance.now();
      const previous = state.tapTimes[state.tapTimes.length - 1];
      const deltaMs = previous === undefined ? null : Math.round(now - previous);
      state.tapTimes.push(now);
      state.beatsPlayed += 1;
      playTone(660, 0.075, "sine");
      $("#beatOrb").classList.add("pulse");
      window.setTimeout(() => $("#beatOrb").classList.remove("pulse"), 130);
      logEvent("beat_tapped", {
        tapNumber: state.beatsPlayed,
        interTapDeltaMs: deltaMs,
        targetIntervalMs: 260,
        timingDeltaMs: deltaMs === null ? null : deltaMs - 260
      });
      updateStats();
      saveProgress();
      if (state.beatsPlayed === 5) showToast("Five beats! You unlocked Listening Legend! 🏅");
    });
    document.querySelectorAll("[data-lesson]").forEach((button) => {
      button.addEventListener("click", () => startLesson(button.dataset.lesson));
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
