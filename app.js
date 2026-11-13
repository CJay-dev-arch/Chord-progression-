/* SoundSprout prototype
 * Frontend-only learning demo. See CONFIG below to connect your own API.
 * Do not use the demo account flow for real children or real personal data.
 */

const SUPABASE_URL = 'https://aieeaeokaqgiqholitnm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zFgPi8HXGflcsYRRmz7Sag_fMFUAVpI';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

(() => {
  "use strict";

  const CONFIG = {
    apiBaseUrl: "",
    websocketUrl: "",
    appVersion: "0.2.0"
  };

  const $ = (selector) => document.querySelector(selector);
  const dialog = $("#appDialog");
  const dialogBody = $("#dialogBody");
  const toast = $("#toast");

  const state = {
    profile: null,
    level: "Level Check",
    beatsPlayed: 0,
    starsEarned: 0,
    lessonsCompleted: [],
    testAnswers: [],
    selectedChoice: null,
    selectedLetter: "A",
    audioContext: null,
    ws: null,
    tapTimes: [],
    telemetry: [],
    currentLesson: null
  };

  const phonicsData = [
    { letter: "A", label: "Aa", phrase: "A is for Apple 🍎", freq: 261.63 },
    { letter: "B", label: "Bb", phrase: "B is for Bear 🐻", freq: 293.66 },
    { letter: "C", label: "Cc", phrase: "C is for Cat 🐱", freq: 329.63 },
    { letter: "D", label: "Dd", phrase: "D is for Drum 🥁", freq: 349.23 },
    { letter: "E", label: "Ee", phrase: "E is for Elephant 🐘", freq: 392.00 },
    { letter: "F", label: "Ff", phrase: "F is for Frog 🐸", freq: 440.00 },
    { letter: "G", label: "Gg", phrase: "G is for Guitar 🎸", freq: 493.88 },
    { letter: "H", label: "Hh", phrase: "H is for Harp 🎶", freq: 523.25 },
    { letter: "I", label: "Ii", phrase: "I is for Iguana 🦎", freq: 261.63 },
    { letter: "J", label: "Jj", phrase: "J is for Jellyfish 🪼", freq: 293.66 },
    { letter: "K", label: "Kk", phrase: "K is for Koala 🐨", freq: 329.63 },
    { letter: "L", label: "Ll", phrase: "L is for Lion 🦁", freq: 349.23 },
    { letter: "M", label: "Mm", phrase: "M is for Music 🎵", freq: 392.00 },
    { letter: "N", label: "Nn", phrase: "N is for Note 🎼", freq: 440.00 },
    { letter: "O", label: "Oo", phrase: "O is for Owl 🦉", freq: 493.88 },
    { letter: "P", label: "Pp", phrase: "P is for Piano 🎹", freq: 523.25 },
    { letter: "Q", label: "Qq", phrase: "Q is for Queen 👑", freq: 261.63 },
    { letter: "R", label: "Rr", phrase: "R is for Rhythm 🪘", freq: 293.66 },
    { letter: "S", label: "Ss", phrase: "S is for Star ⭐", freq: 329.63 },
    { letter: "T", label: "Tt", phrase: "T is for Tiger 🐯", freq: 349.23 },
    { letter: "U", label: "Uu", phrase: "U is for Ukulele 🪕", freq: 392.00 },
    { letter: "V", label: "Vv", phrase: "V is for Violin 🎻", freq: 440.00 },
    { letter: "W", label: "Ww", phrase: "W is for Whale 🐳", freq: 493.88 },
    { letter: "X", label: "Xx", phrase: "X is for Xylophone 🎶", freq: 523.25 },
    { letter: "Y", label: "Yy", phrase: "Y is for Yo-Yo 🪀", freq: 587.33 },
    { letter: "Z", label: "Zz", phrase: "Z is for Zebra 🦓", freq: 659.25 }
  ];

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

  let sessionId;
  function getSessionId() {
    if (!sessionId) sessionId = `ss-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return sessionId;
  }

  function logEvent(eventName, details = {}) {
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      appVersion: CONFIG.appVersion,
      details
    };
    state.telemetry.push(event);
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

  async function playTone(frequency = 440, duration = 0.16, waveform = "sine") {
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
    logEvent("audio_tone_played", { frequencyHz: frequency, durationMs: Math.round(duration * 1000), waveform });
  }

  async function playSequence(notes = [392, 440, 523, 659]) {
    const context = await getAudioContext();
    if (!context) return;
    const start = context.currentTime + 0.04;
    notes.forEach((frequency, index) => {
      const at = start + index * 0.22;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.15, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.2);
    });
    logEvent("audio_sequence_played", { noteCount: notes.length, frequenciesHz: notes });
  }

  function renderAlphabetGrid() {
    const grid = $("#alphabetGrid");
    grid.innerHTML = phonicsData
      .map(
        (item) => `
        <button
          class="letter-btn ${item.letter === state.selectedLetter ? "active" : ""}"
          type="button"
          data-letter="${item.letter}"
        >${item.label}</button>
      `
      )
      .join("");

    grid.querySelectorAll(".letter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const letter = btn.dataset.letter;
        const entry = phonicsData.find((p) => p.letter === letter);
        if (!entry) return;
        state.selectedLetter = letter;
        $("#nowPlayingDisplay").innerHTML = `🎵 <span id="phonicsPhrase">${entry.phrase}</span>`;
        grid.querySelectorAll(".letter-btn").forEach((b) => b.classList.toggle("active", b === btn));
        playSequence([entry.freq, entry.freq * 1.25]);
        logEvent("classroom_letter_tapped", { letter });
      });
    });
  }

  function openXylophone() {
    const notes = [
      { note: "C", freq: 261.63, color: "#ff595e" },
      { note: "D", freq: 293.66, color: "#ff924c" },
      { note: "E", freq: 329.63, color: "#ffca3a" },
      { note: "F", freq: 349.23, color: "#8ac926" },
      { note: "G", freq: 392.00, color: "#1982c4" },
      { note: "A", freq: 440.00, color: "#6a4c93" },
      { note: "B", freq: 493.88, color: "#f15bb5" },
      { note: "C2", freq: 523.25, color: "#00bbf9" }
    ];

    openDialog(`
      <p class="eyebrow">FREE PLAY INSTRUMENT</p>
      <h2 id="dialogTitle">Rainbow Xylophone 🎹</h2>
      <p>Tap the colorful bars to compose your own melody!</p>
      <div class="xylo-keys">
        ${notes
          .map(
            (n) => `<button class="xylo-bar" type="button" data-freq="${n.freq}" style="background:${n.color}">${n.note}</button>`
          )
          .join("")}
      </div>
      <div class="dialog-actions">
        <button class="button button-primary" id="closeXylo" type="button">Done playing</button>
      </div>
    `);

    dialogBody.querySelectorAll(".xylo-bar").forEach((bar) => {
      bar.addEventListener("click", () => {
        playTone(Number(bar.dataset.freq), 0.25, "triangle");
      });
    });
    $("#closeXylo").addEventListener("click", closeDialog);
  }

  function updateStats() {
    $("#starsEarned").textContent = String(state.starsEarned);
    $("#beatsCountTop").textContent = `${Math.min(state.beatsPlayed, 5)}/5`;
    $("#firstStarStatus").textContent = state.starsEarned > 0 ? "⭐" : "🔒";
    $("#beatBadgeStatus").textContent = state.beatsPlayed >= 5 ? "🏅" : "🔒";
    $("#beatMessage").textContent = state.beatsPlayed
      ? `Great tapping! ${state.beatsPlayed} beat${state.beatsPlayed === 1 ? "" : "s"} played.`
      : "Listen to the beat, then tap along to earn badges!";
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
        <div class="choice-grid">${item.options
          .map((option, i) => `<button class="choice-button" type="button" data-answer="${i}">${option}</button>`)
          .join("")}</div>
        <p class="dialog-note">This is a friendly starting point, not a test you can fail.</p>
        <div class="dialog-actions"><button class="button button-primary" id="nextTest" type="button" disabled>${
          index === questions.length - 1 ? "See my level" : "Next question →"
        }</button></div>
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
          state.level = level;
          $("#learnerLevelBadge").textContent = level;
          logEvent("level_check_completed", { score, level });
          openDialog(`
            <p class="eyebrow">YOUR STARTING POINT</p>
            <h2 id="dialogTitle">You’re a ${level}! 🌱</h2>
            <div class="result-score">♫ ${level} learner</div>
            <p>We’ll start with short, playful activities and you can move up whenever you feel ready.</p>
            <div class="dialog-actions"><button class="button button-primary" id="doneTest" type="button">Let’s learn!</button></div>
          `);
          $("#doneTest").addEventListener("click", () => {
            closeDialog();
            showToast("Your adventure starts now!");
          });
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
      <p class="eyebrow">MUSIC + LIFE SKILLS</p>
      <h2 id="dialogTitle">${lesson.title}</h2>
      <p>${lesson.intro}</p>
      <div style="margin: 12px 0;">
        <button class="button button-outline" id="lessonSound" type="button">▶ Play Lesson Melody</button>
      </div>
      <p><strong>${lesson.question}</strong></p>
      <div class="choice-grid">${lesson.choices
        .map((choice, i) => `<button class="choice-button" data-lesson-answer="${i}" type="button">${choice}</button>`)
        .join("")}</div>
      <p class="dialog-note" id="lessonFeedback" aria-live="polite">Choose the answer that feels right to you.</p>
      <div class="dialog-actions"><button class="button button-primary" id="finishLesson" type="button" disabled>Finish lesson</button></div>
    `);
    $("#lessonSound").addEventListener("click", () =>
      playSequence(id === "rhythm" ? [392, 392, 392, 523] : id === "feelings" ? [523, 440, 392] : [330, 392, 440, 523])
    );
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
    const name = state.profile?.name || "Learner";
    openDialog(`
      <p class="eyebrow">YOUR SPACE</p>
      <h2 id="dialogTitle">Hello, ${escapeHTML(name)}! 👋</h2>
      <p>This demo keeps your progress in this browser. A real account needs secure server-side authentication and a parent/guardian consent flow.</p>
      <label class="form-label" for="learnerName">What should we call you?</label>
      <input class="text-input" id="learnerName" maxlength="24" autocomplete="nickname" placeholder="Your first name or nickname" value="${escapeHTML(
        state.profile?.name || ""
      )}">
      <div class="dialog-actions">
        <button class="button button-primary" id="saveProfile" type="button">Save nickname</button>
        <button class="button button-outline" id="exportTelemetry" type="button">Export activity log</button>
      </div>
      <p class="dialog-note">Please don’t enter your full name, school, address, or other private details in this prototype.</p>
    `);
    $("#saveProfile").addEventListener("click", () => {
      const enteredName = $("#learnerName").value.trim().slice(0, 24);
      state.profile = { name: enteredName || "Learner" };
      localStorage.setItem("soundsprout-profile", JSON.stringify(state.profile));
      $("#headerName").textContent = state.profile.name;
      logEvent("profile_nickname_saved", { nicknameProvided: Boolean(enteredName) });
      closeDialog();
      showToast("Nickname saved on this device.");
    });
    $("#exportTelemetry").addEventListener("click", exportTelemetry);
  }

  function showProgress() {
    const completedTitles = state.lessonsCompleted.map((id) => lessons[id].title);
    openDialog(`
      <p class="eyebrow">YOUR PROGRESS</p>
      <h2 id="dialogTitle">Every little step counts!</h2>
      <div class="result-score">⭐ ${state.starsEarned} star${state.starsEarned === 1 ? "" : "s"} earned</div>
      <p><strong>Quick-play beats:</strong> ${state.beatsPlayed}</p>
      <p><strong>Lessons finished:</strong> ${
        completedTitles.length ? completedTitles.map(escapeHTML).join(", ") : "Not yet—pick a tile above to get started!"
      }</p>
      <div class="dialog-actions">
        <button class="button button-primary" id="closeProgress" type="button">Keep going</button>
        <button class="button button-outline" id="exportProgress" type="button">Export activity log</button>
      </div>
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
    try {
      localStorage.setItem("soundsprout-progress", JSON.stringify(data));
    } catch (_) {}
  }

  function loadProgress() {
    try {
      const profile = JSON.parse(localStorage.getItem("soundsprout-profile") || "null");
      if (profile && typeof profile.name === "string") {
        state.profile = profile;
        $("#headerName").textContent = profile.name || "Learner";
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

  function init() {
    loadProgress();
    renderAlphabetGrid();
    logEvent("app_opened", { viewportWidth: window.innerWidth, viewportHeight: window.innerHeight });

    $("#startLevelTest").addEventListener("click", showLevelTest);
    $("#tileLevelCheck").addEventListener("click", showLevelTest);
    $("#tileXylophone").addEventListener("click", openXylophone);
    $("#tileBeatGame").addEventListener("click", () => {
      $("#beatGameSection").scrollIntoView({ behavior: "smooth" });
      $("#tapBeat").focus();
    });
    $("#profileButton").addEventListener("click", showProfile);
    $("#parentSettings").addEventListener("click", () => {
      openDialog(`
        <p class="eyebrow">FOR PARENTS & GUARDIANS</p>
        <h2 id="dialogTitle">A note for grown-ups</h2>
        <p>This is a frontend prototype, not a production account system. Before launch, add verified adult sign-in, parental consent, child-privacy safeguards, accessible lesson design, and a backend with appropriate security controls.</p>
        <div class="dialog-actions">
          <button class="button button-primary" id="parentClose" type="button">Got it</button>
          <button class="button button-outline" id="parentExport" type="button">Export activity log</button>
        </div>
      `);
      $("#parentClose").addEventListener("click", closeDialog);
      $("#parentExport").addEventListener("click", exportTelemetry);
    });
    $("#viewProgress").addEventListener("click", showProgress);
    $("#closeDialog").addEventListener("click", closeDialog);
    $("#playWelcomeTune").addEventListener("click", () => {
      playSequence([392, 440, 523, 659]);
      showToast("Playing Jukebox melody! 🎶");
    });

    $("#playBeat").addEventListener("click", async () => {
      await playTone(440, 0.13, "triangle");
      window.setTimeout(() => playTone(440, 0.13, "triangle"), 260);
      window.setTimeout(() => playTone(523, 0.13, "triangle"), 520);
      $("#beatOrb").classList.add("pulse");
      window.setTimeout(() => $("#beatOrb").classList.remove("pulse"), 650);
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
      logEvent("beat_tapped", { tapNumber: state.beatsPlayed, interTapDeltaMs: deltaMs });
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
