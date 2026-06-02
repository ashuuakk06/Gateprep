// script.js
document.getElementById("signinForm").addEventListener("submit", function(e){
  e.preventDefault();
  document.getElementById("signin").style.display = "none";
  document.getElementById("main").style.display = "block";
  updateGreeting();
  setInterval(updateGreeting, 1000); // update every second
});

function updateGreeting(){
  let now = new Date();
  let hours = now.getHours();
  let greetingText = "";

  if(hours >= 5 && hours < 12){
    greetingText = "🌞 Good Morning!";
  } else if(hours >= 12 && hours < 18){
    greetingText = "☀️ Good Afternoon!";
  } else if(hours >= 18 && hours < 22){
    greetingText = "🌆 Good Evening!";
  } else {
    greetingText = "🌙 Good Night!";
  }

  document.getElementById("greeting").innerText = greetingText;
  document.getElementById("time").innerText = "Current Time: " + now.toLocaleTimeString();
}
const STORAGE = {
  users: "gatePrepTrackerUsers",
  session: "gatePrepTrackerSession",
  theme: "gatePrepTrackerTheme"
};

const SUBJECTS = [
  {
    name: "Engineering Mathematics",
    short: "Maths",
    icon: "fa-square-root-variable",
    chapters: ["Linear Algebra", "Calculus", "Probability", "Statistics", "Discrete Mathematics", "Numerical Methods", "Transforms"]
  },
  {
    name: "Aptitude",
    short: "Aptitude",
    icon: "fa-puzzle-piece",
    chapters: ["Quantitative Aptitude", "Verbal Ability", "Data Interpretation", "Logical Reasoning", "Spatial Aptitude"]
  },
  {
    name: "DSA",
    short: "DSA",
    icon: "fa-diagram-project",
    chapters: ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Hashing", "Heaps"]
  },
  {
    name: "Algorithms",
    short: "Algo",
    icon: "fa-code-branch",
    chapters: ["Asymptotic Analysis", "Sorting", "Searching", "Greedy", "Dynamic Programming", "Divide and Conquer", "Graph Algorithms", "NP Completeness"]
  },
  {
    name: "OS",
    short: "OS",
    icon: "fa-microchip",
    chapters: ["Processes", "Threads", "CPU Scheduling", "Synchronization", "Deadlock", "Memory Management", "Paging", "File Systems"]
  },
  {
    name: "DBMS",
    short: "DBMS",
    icon: "fa-database",
    chapters: ["ER Model", "Relational Model", "SQL", "Normalization", "Transactions", "Concurrency Control", "Indexing", "Query Optimization"]
  },
  {
    name: "CN",
    short: "CN",
    icon: "fa-network-wired",
    chapters: ["Network Models", "Data Link Layer", "Routing", "Transport Layer", "Congestion Control", "Application Layer", "Security Basics"]
  },
  {
    name: "COA",
    short: "COA",
    icon: "fa-memory",
    chapters: ["Number Systems", "Instruction Set", "CPU Design", "Pipelining", "Pipeline Hazards", "Memory Hierarchy", "I/O Organization"]
  },
  {
    name: "TOC",
    short: "TOC",
    icon: "fa-infinity",
    chapters: ["Regular Languages", "Finite Automata", "Context Free Grammar", "Pushdown Automata", "Turing Machines", "Decidability", "Complexity"]
  },
  {
    name: "Compiler Design",
    short: "Compiler",
    icon: "fa-code",
    chapters: ["Lexical Analysis", "Parsing", "Syntax Directed Translation", "Runtime Environments", "Intermediate Code", "Code Optimization", "Code Generation"]
  },
  {
    name: "Digital Logic",
    short: "Digital",
    icon: "fa-toggle-on",
    chapters: ["Boolean Algebra", "K Maps", "Combinational Circuits", "Sequential Circuits", "Counters", "Registers", "ADC and DAC"]
  }
];

const state = {
  users: [],
  currentUser: null,
  charts: {},
  countdownTimer: null,
  clockTimer: null,
  sessionTimer: null,
  timer: {
    mode: "focus",
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    running: false,
    interval: null,
    activeFocusSeconds: 0
  }
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

function init() {
  state.users = loadUsers();
  renderSubjectCheckboxes();
  hydrateSelects();
  bindEvents();
  applyTheme(localStorage.getItem(STORAGE.theme) || "dark");
  restoreSession();
  updateCountdown();
  state.countdownTimer = window.setInterval(updateCountdown, 1000);
  state.sessionTimer = window.setInterval(checkSessionTimeout, 30000);
  renderShell();
}

function bindEvents() {
  qsa(".theme-toggle").forEach((button) => button.addEventListener("click", toggleTheme));
  qsa(".auth-open").forEach((button) => button.addEventListener("click", () => openAuth(button.dataset.authTab || "login")));
  qsa("[data-close-modal]").forEach((node) => node.addEventListener("click", closeAuth));
  qsa(".auth-tab").forEach((tab) => tab.addEventListener("click", () => setAuthTab(tab.dataset.tab)));

  qs("#signupForm").addEventListener("submit", handleSignup);
  qs("#loginForm").addEventListener("submit", handleLogin);
  qs("#onboardingForm").addEventListener("submit", handleOnboarding);
  qs("#onboardingLogout").addEventListener("click", logout);
  qs("#logoutBtn").addEventListener("click", logout);

  qsa(".nav-link").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  qs("#menuToggle").addEventListener("click", () => qs("#appSidebar").classList.toggle("open"));
  qs("#mentorToggle").addEventListener("click", () => qs("#mentorRail").classList.toggle("open"));
  qs("#closeMentor").addEventListener("click", () => qs("#mentorRail").classList.remove("open"));

  qs("#regeneratePlan").addEventListener("click", () => {
    renderPlanner();
    renderDashboard();
  });

  qs("#chapterSubjectSelect").addEventListener("change", renderChapterTracker);
  qs("#chapterList").addEventListener("change", handleChapterToggle);
  qs("#mockForm").addEventListener("submit", handleMockSubmit);
  qs("#mockTable").addEventListener("click", handleMockDelete);
  qs("#revisionGrid").addEventListener("change", handleRevisionToggle);
  qs("#pyqForm").addEventListener("submit", handlePyqSubmit);
  qs("#pyqTable").addEventListener("click", handlePyqDelete);
  qs("#noteForm").addEventListener("submit", handleNoteSubmit);
  qs("#notesList").addEventListener("click", handleNoteAction);
  qs("#exportPdf").addEventListener("click", exportPdfReport);
  qs("#reportType").addEventListener("change", renderReportPreview);
  qs("#quickPrompts").addEventListener("click", handleQuickPrompt);
  qs("#mentorForm").addEventListener("submit", handleMentorSubmit);

  qsa("[data-timer-mode]").forEach((button) => button.addEventListener("click", () => setTimerMode(button.dataset.timerMode)));
  qs("#timerStart").addEventListener("click", startTimer);
  qs("#timerPause").addEventListener("click", pauseTimer);
  qs("#timerReset").addEventListener("click", resetTimer);
  qs("#customMinutes").addEventListener("change", () => {
    if (state.timer.mode === "custom") setTimerMode("custom");
  });
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.users)) || [];
  } catch {
    return [];
  }
}

function saveUsers() {
  localStorage.setItem(STORAGE.users, JSON.stringify(state.users));
}

function saveCurrentUser() {
  if (!state.currentUser) return;
  const index = state.users.findIndex((user) => user.id === state.currentUser.id);
  if (index >= 0) {
    state.users[index] = state.currentUser;
    saveUsers();
  }
}

function restoreSession() {
  const raw = localStorage.getItem(STORAGE.session);
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    if (!session.email || Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE.session);
      return;
    }
    state.currentUser = state.users.find((user) => user.email === session.email) || null;
    if (state.currentUser) ensureUserData(state.currentUser);
  } catch {
    localStorage.removeItem(STORAGE.session);
  }
}

function setSession(email, remember) {
  const minutes = remember ? 60 * 24 * 30 : 45;
  localStorage.setItem(STORAGE.session, JSON.stringify({
    email,
    expiresAt: Date.now() + minutes * 60 * 1000,
    remember: Boolean(remember)
  }));
}

function checkSessionTimeout() {
  if (!state.currentUser) return;
  const raw = localStorage.getItem(STORAGE.session);
  if (!raw) return logout();
  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      alert("Session timed out. Please log in again.");
      logout();
    }
  } catch {
    logout();
  }
}

function ensureUserData(user) {
  user.data = user.data || {};
  user.data.subjectProgress = user.data.subjectProgress || {};
  user.data.revisions = user.data.revisions || {};
  user.data.mocks = user.data.mocks || [];
  user.data.pyq = user.data.pyq || [];
  user.data.notes = user.data.notes || [];
  user.data.activity = user.data.activity || {};
  user.data.timer = user.data.timer || { focusSeconds: 0 };
  user.data.mentor = user.data.mentor || [
    {
      role: "assistant",
      text: "I am ready. Ask me what to study, where you are weak, or how to push toward your target score."
    }
  ];

  SUBJECTS.forEach((subject) => {
    if (!Array.isArray(user.data.subjectProgress[subject.name])) {
      user.data.subjectProgress[subject.name] = subject.chapters.map(() => false);
    }
    if (!Array.isArray(user.data.revisions[subject.name])) {
      user.data.revisions[subject.name] = [false, false, false];
    }
  });
}

function renderShell() {
  const isLoggedIn = Boolean(state.currentUser);
  qs("#publicHeader").classList.toggle("hidden", isLoggedIn);
  qs("#publicView").classList.toggle("hidden", isLoggedIn);
  qs("#onboardingView").classList.toggle("hidden", !isLoggedIn || Boolean(state.currentUser?.profile));
  qs("#appView").classList.toggle("hidden", !isLoggedIn || !state.currentUser?.profile);

  if (!isLoggedIn) {
    destroyCharts();
    return;
  }

  ensureUserData(state.currentUser);

  if (!state.currentUser.profile) {
    prefillOnboarding();
    return;
  }

  renderApp();
}

function renderApp() {
  refreshClock();
  window.clearInterval(state.clockTimer);
  state.clockTimer = window.setInterval(refreshClock, 1000);
  renderUserChip();
  renderDashboard();
  renderPlanner();
  renderSubjectProgress();
  renderChapterTracker();
  renderMocks();
  renderRevision();
  renderPyq();
  renderTimer();
  renderActivity();
  renderAnalytics();
  renderNotes();
  renderMentor();
  renderReportPreview();
}

function openAuth(tab) {
  qs("#authModal").setAttribute("aria-hidden", "false");
  setAuthTab(tab);
}

function closeAuth() {
  qs("#authModal").setAttribute("aria-hidden", "true");
  setMessage("#authMessage", "");
}

function setAuthTab(tabName) {
  qsa(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  qsa(".auth-form").forEach((form) => form.classList.toggle("active", form.id === `${tabName}Form`));
  qs("#authTitle").textContent = tabName === "signup" ? "Create your account" : "Welcome back";
  setMessage("#authMessage", "");
}

async function handleSignup(event) {
  event.preventDefault();
  clearAuthErrors("signup");
  const form = event.currentTarget;
  const fullName = sanitize(form.fullName.value);
  const email = sanitize(form.email.value).toLowerCase();
  const phone = sanitize(form.phone.value);
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  let valid = true;

  if (!fullName) valid = setFieldError("signup-name", "Name is required.");
  if (!isEmail(email)) valid = setFieldError("signup-email", "Enter a valid email address.");
  if (!isPhone(phone)) valid = setFieldError("signup-phone", "Enter a valid 10 to 15 digit phone number.");
  if (!isStrongPassword(password)) valid = setFieldError("signup-password", "Use 8+ chars with uppercase, lowercase, number, and symbol.");
  if (password !== confirmPassword) valid = setFieldError("signup-confirm", "Passwords do not match.");
  if (state.users.some((user) => user.email === email)) valid = setFieldError("signup-email", "An account with this email already exists.");

  if (!valid) return;

  const passwordHash = await hashPassword(password);
  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
    fullName,
    email,
    phone,
    passwordHash,
    createdAt: new Date().toISOString(),
    profile: null,
    data: {}
  };
  ensureUserData(user);
  state.users.push(user);
  state.currentUser = user;
  saveUsers();
  setSession(email, form.remember.checked);
  closeAuth();
  renderShell();
}

async function handleLogin(event) {
  event.preventDefault();
  clearAuthErrors("login");
  const form = event.currentTarget;
  const email = sanitize(form.email.value).toLowerCase();
  const password = form.password.value;
  let valid = true;

  if (!email) valid = setFieldError("login-email", "Email is required.");
  if (!password) valid = setFieldError("login-password", "Password is required.");
  if (!valid) return;

  const user = state.users.find((entry) => entry.email === email);
  const passwordHash = await hashPassword(password);
  if (!user || user.passwordHash !== passwordHash) {
    setMessage("#authMessage", "Invalid login credentials.", false);
    return;
  }

  state.currentUser = user;
  ensureUserData(state.currentUser);
  setSession(email, form.remember.checked);
  closeAuth();
  renderShell();
}

function handleOnboarding(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const profile = {
    fullName: sanitize(form.fullName.value),
    branch: sanitize(form.branch.value),
    currentYear: numberValue(form.currentYear.value),
    currentSemester: numberValue(form.currentSemester.value),
    collegeName: sanitize(form.collegeName.value),
    cgpa: numberValue(form.cgpa.value),
    targetYear: numberValue(form.targetYear.value),
    targetScore: numberValue(form.targetScore.value),
    targetRank: numberValue(form.targetRank.value),
    currentMockScore: numberValue(form.currentMockScore.value),
    dailyHours: numberValue(form.dailyHours.value),
    preferredTime: sanitize(form.preferredTime.value),
    coaching: sanitize(form.coaching.value),
    weakSubjects: getCheckedSubjects("weakSubjects"),
    strongSubjects: getCheckedSubjects("strongSubjects")
  };

  if (!profile.fullName || !profile.collegeName || !profile.targetYear || !profile.dailyHours) {
    setMessage("#onboardingMessage", "Complete all required onboarding fields.", false);
    return;
  }

  state.currentUser.fullName = profile.fullName;
  state.currentUser.profile = profile;
  saveCurrentUser();
  setMessage("#onboardingMessage", "Profile saved.", true);
  renderShell();
}

function prefillOnboarding() {
  const form = qs("#onboardingForm");
  const nextYear = getNextGateDate().getFullYear();
  form.fullName.value = state.currentUser.fullName || "";
  form.currentYear.value = form.currentYear.value || 3;
  form.currentSemester.value = form.currentSemester.value || 6;
  form.cgpa.value = form.cgpa.value || 8.0;
  form.targetYear.value = form.targetYear.value || nextYear;
  form.targetScore.value = form.targetScore.value || 750;
  form.targetRank.value = form.targetRank.value || 1000;
  form.currentMockScore.value = form.currentMockScore.value || 35;
  form.dailyHours.value = form.dailyHours.value || 4;
}

function logout() {
  pauseTimer();
  state.currentUser = null;
  localStorage.removeItem(STORAGE.session);
  window.clearInterval(state.clockTimer);
  renderShell();
}

function switchView(view) {
  qsa(".nav-link").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  qsa(".view").forEach((section) => section.classList.toggle("active", section.id === `view-${view}`));
  const active = qs(`#view-${view}`);
  qs("#viewTitle").textContent = active?.dataset.title || "Dashboard";
  qs("#topEyebrow").textContent = view === "dashboard" ? "Premium dashboard" : "GATE Prep Tracker AI";
  qs("#appSidebar").classList.remove("open");
  if (view === "mentor") syncMentorExpanded();
}

function renderUserChip() {
  const name = state.currentUser.profile?.fullName || state.currentUser.fullName || "GP";
  qs("#userChip").textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function refreshClock() {
  if (!state.currentUser?.profile) return;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : hour < 21 ? "Good Evening" : "Good Night";
  qs("#greetingText").textContent = greeting;
  qs("#dashboardName").textContent = state.currentUser.profile.fullName;
  qs("#currentDate").textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  qs("#currentTime").textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function renderDashboard() {
  const metrics = calculateMetrics();
  const stats = [
    ["Questions Solved", metrics.questionsSolved, "fa-circle-question"],
    ["Overall Accuracy", `${metrics.overallAccuracy}%`, "fa-crosshairs"],
    ["Hours Studied", metrics.hoursStudied.toFixed(1), "fa-clock"],
    ["Mock Tests Completed", metrics.mockCount, "fa-file-lines"],
    ["Current Streak", `${metrics.streak} days`, "fa-fire"],
    ["Days Left To GATE", metrics.daysLeft, "fa-hourglass-half"],
    ["Revision Progress", `${metrics.revisionProgress}%`, "fa-rotate"],
    ["Study Completion", `${metrics.studyCompletion}%`, "fa-list-check"]
  ];

  qs("#dashboardStats").innerHTML = stats.map(([label, value, icon]) => `
    <article class="stat-card">
      <i class="fa-solid ${icon}"></i>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `).join("");

  qs("#prepMeterRadial").style.setProperty("--value", `${metrics.preparationMeter}%`);
  qs("#prepMeterRadial span").textContent = `${metrics.preparationMeter}%`;
  renderTasks("#todayTasks", generateStudyPlan().daily);
  renderDashboardTrendChart();
}

function renderPlanner() {
  const plan = generateStudyPlan();
  renderTasks("#plannerDaily", plan.daily);
  qs("#weeklyPlanner").innerHTML = plan.weekly.map((item) => `
    <div class="planner-item">
      <strong>${escapeHtml(item.day)}</strong>
      <span>${escapeHtml(item.focus)}</span>
    </div>
  `).join("");
  qs("#monthlyPlanner").innerHTML = plan.monthly.map((item) => `
    <article class="month-card panel">
      <p class="eyebrow">${escapeHtml(item.week)}</p>
      <h3>${escapeHtml(item.theme)}</h3>
      <p>${escapeHtml(item.work)}</p>
    </article>
  `).join("");
}

function renderTasks(selector, tasks) {
  qs(selector).innerHTML = tasks.map((task) => `
    <div class="task-item">
      <time>${escapeHtml(task.time)}</time>
      <div>
        <strong>${escapeHtml(task.subject)}</strong>
        <p>${escapeHtml(task.topic)}</p>
      </div>
      <span class="badge">${escapeHtml(task.type)}</span>
    </div>
  `).join("");
}

function generateStudyPlan() {
  const profile = state.currentUser.profile;
  const metrics = calculateMetrics();
  const hours = Math.max(1, profile.dailyHours || 4);
  const weak = profile.weakSubjects.length ? profile.weakSubjects : getLowestSubjects(4).map((subject) => subject.name);
  const strong = profile.strongSubjects.length ? profile.strongSubjects : SUBJECTS.slice(0, 3).map((subject) => subject.name);
  const rotation = uniqueList([...weak, ...getLowestSubjects(6).map((subject) => subject.name), ...strong, ...SUBJECTS.map((subject) => subject.name)]);
  const slotCount = Math.min(4, Math.max(2, Math.round(hours)));
  const startHour = { Morning: 7, Afternoon: 13, Evening: 17, Night: 20 }[profile.preferredTime] || 7;
  const gap = Math.max(1, Math.floor(hours / slotCount));
  const todayIndex = new Date().getDay();
  const daily = Array.from({ length: slotCount }, (_, index) => {
    const subjectName = rotation[(todayIndex + index) % rotation.length];
    const subject = SUBJECTS.find((entry) => entry.name === subjectName) || SUBJECTS[index % SUBJECTS.length];
    const topic = pickTopic(subject.name, index);
    const hour = (startHour + index * gap) % 24;
    return {
      time: formatHour(hour),
      subject: subject.name,
      topic,
      type: weak.includes(subject.name) ? "Weak" : index === slotCount - 1 ? "Revision" : "Core"
    };
  });

  if (!daily.some((item) => item.type === "Revision")) {
    daily[daily.length - 1].type = "Revision";
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekly = dayNames.map((day, index) => {
    const subjectA = rotation[(index * 2) % rotation.length];
    const subjectB = rotation[(index * 2 + 1) % rotation.length];
    const testing = index === 6 ? "Full mock test and error log" : `${subjectA} drills, ${subjectB} PYQs, 30-minute formula revision`;
    return { day, focus: testing };
  });

  const monthly = [
    { week: "Week 1", theme: "Weak-topic repair", work: `${weak.slice(0, 3).join(", ")} concept rebuild with chapter checkboxes and PYQ sets.` },
    { week: "Week 2", theme: "Core scoring sprint", work: `${rotation.slice(2, 6).join(", ")} timed practice and one sectional mock.` },
    { week: "Week 3", theme: "Mock and analysis cycle", work: "Two full mocks, error notebook updates, and accuracy trend correction." },
    { week: "Week 4", theme: "Revision and rank push", work: `${strong.slice(0, 3).join(", ")} fast revision plus critical weak topics until preparation meter rises above ${Math.min(92, metrics.preparationMeter + 8)}%.` }
  ];

  return { daily, weekly, monthly };
}

function renderSubjectProgress() {
  const data = state.currentUser.data.subjectProgress;
  qs("#subjectProgress").innerHTML = SUBJECTS.map((subject) => {
    const completed = data[subject.name].filter(Boolean).length;
    const total = subject.chapters.length;
    const percent = Math.round((completed / total) * 100);
    return `
      <article class="subject-card">
        <header>
          <h3><i class="fa-solid ${subject.icon}"></i> ${escapeHtml(subject.name)}</h3>
          <strong>${percent}%</strong>
        </header>
        <p>${completed} completed, ${total - completed} remaining</p>
        <div class="progress-track"><span style="width:${percent}%"></span></div>
      </article>
    `;
  }).join("");
}

function renderChapterTracker() {
  const select = qs("#chapterSubjectSelect");
  if (!select.value) select.value = SUBJECTS[0].name;
  const subject = SUBJECTS.find((entry) => entry.name === select.value) || SUBJECTS[0];
  const progress = state.currentUser.data.subjectProgress[subject.name];
  const completed = progress.filter(Boolean).length;
  const percent = Math.round((completed / subject.chapters.length) * 100);
  qs("#chapterSummary").innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(subject.name)}</p>
      <h3>${completed} of ${subject.chapters.length} chapters completed</h3>
    </div>
    <strong>${percent}%</strong>
  `;
  qs("#chapterList").innerHTML = subject.chapters.map((chapter, index) => `
    <label class="chapter-item">
      <span>${escapeHtml(chapter)}</span>
      <input type="checkbox" data-subject="${escapeHtml(subject.name)}" data-index="${index}" ${progress[index] ? "checked" : ""}>
    </label>
  `).join("");
}

function handleChapterToggle(event) {
  const checkbox = event.target;
  if (!checkbox.matches("input[type='checkbox']")) return;
  const subject = checkbox.dataset.subject;
  const index = Number(checkbox.dataset.index);
  state.currentUser.data.subjectProgress[subject][index] = checkbox.checked;
  saveCurrentUser();
  renderSubjectProgress();
  renderChapterTracker();
  renderDashboard();
  renderAnalytics();
}

function handleMockSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const mock = {
    id: `mock-${Date.now()}`,
    name: sanitize(form.mockName.value),
    score: numberValue(form.score.value),
    accuracy: numberValue(form.accuracy.value),
    timeTaken: numberValue(form.timeTaken.value),
    date: form.date.value || todayKey()
  };

  if (!mock.name || mock.score < 0 || mock.accuracy < 0 || !mock.timeTaken) return;
  state.currentUser.data.mocks.push(mock);
  addActivity(mock.date, { mocks: 1 });
  saveCurrentUser();
  form.reset();
  form.date.value = todayKey();
  renderMocks();
  renderDashboard();
  renderActivity();
  renderAnalytics();
  renderReportPreview();
}

function handleMockDelete(event) {
  const button = event.target.closest("[data-delete-mock]");
  if (!button) return;
  state.currentUser.data.mocks = state.currentUser.data.mocks.filter((mock) => mock.id !== button.dataset.deleteMock);
  saveCurrentUser();
  renderMocks();
  renderDashboard();
  renderAnalytics();
}

function renderMocks() {
  const mocks = getSortedMocks();
  const stats = mockStats(mocks);
  qs("#mockStats").innerHTML = [
    ["Average Score", stats.averageScore, "fa-chart-simple"],
    ["Highest Score", stats.highestScore, "fa-arrow-trend-up"],
    ["Lowest Score", stats.lowestScore, "fa-arrow-trend-down"],
    ["Overall Accuracy", `${stats.averageAccuracy}%`, "fa-crosshairs"]
  ].map(([label, value, icon]) => statCard(label, value, icon)).join("");

  qs("#mockTable").innerHTML = mocks.map((mock) => `
    <tr>
      <td>${escapeHtml(mock.name)}</td>
      <td>${mock.score}</td>
      <td>${mock.accuracy}%</td>
      <td>${mock.timeTaken} min</td>
      <td>${escapeHtml(formatDate(mock.date))}</td>
      <td><button class="icon-btn" type="button" data-delete-mock="${mock.id}" aria-label="Delete mock"><i class="fa-solid fa-trash"></i></button></td>
    </tr>
  `).join("") || `<tr><td colspan="6">Add your first mock test to start trend analysis.</td></tr>`;

  renderWeakTopics();
  renderScoreCharts(mocks);
}

function renderWeakTopics() {
  const topics = detectWeakTopics();
  qs("#weakTopics").innerHTML = topics.map((item) => `
    <div class="weak-topic">
      <div>
        <strong>${escapeHtml(item.subject)}: ${escapeHtml(item.topic)}</strong>
        <p>${escapeHtml(item.reason)}</p>
      </div>
      <span class="badge priority-${item.priority.toLowerCase()}">${escapeHtml(item.priority)}</span>
    </div>
  `).join("");
}

function detectWeakTopics() {
  const profile = state.currentUser.profile;
  const mocks = getSortedMocks();
  const latest = mocks[mocks.length - 1];
  const lowestSubjects = getLowestSubjects(6);
  const priorityBase = uniqueList([...profile.weakSubjects, ...lowestSubjects.map((subject) => subject.name)]);
  return priorityBase.slice(0, 8).map((subjectName, index) => {
    const subject = SUBJECTS.find((entry) => entry.name === subjectName) || SUBJECTS[index % SUBJECTS.length];
    const progress = getSubjectPercent(subject.name);
    const topic = pickTopic(subject.name, index);
    let priority = "Minor";
    if (progress < 35 || (latest && latest.accuracy < 55 && index < 3)) priority = "Critical";
    else if (progress < 65 || (latest && latest.accuracy < 70)) priority = "Moderate";
    return {
      subject: subject.name,
      topic,
      priority,
      reason: `Completion ${progress}%, ${latest ? `latest mock accuracy ${latest.accuracy}%` : "baseline profile analysis"}.`
    };
  });
}

function renderRevision() {
  qs("#revisionGrid").innerHTML = SUBJECTS.map((subject) => {
    const revisions = state.currentUser.data.revisions[subject.name];
    return `
      <div class="revision-row">
        <strong>${escapeHtml(subject.name)}</strong>
        ${[0, 1, 2].map((index) => `
          <label class="revision-toggle">
            <input type="checkbox" data-subject="${escapeHtml(subject.name)}" data-index="${index}" ${revisions[index] ? "checked" : ""}>
            <span>Revision ${index + 1}</span>
          </label>
        `).join("")}
      </div>
    `;
  }).join("");
  renderRevisionHeatmap();
}

function handleRevisionToggle(event) {
  const checkbox = event.target;
  if (!checkbox.matches("input[type='checkbox']")) return;
  state.currentUser.data.revisions[checkbox.dataset.subject][Number(checkbox.dataset.index)] = checkbox.checked;
  saveCurrentUser();
  renderRevision();
  renderDashboard();
  renderAnalytics();
  renderReportPreview();
}

function renderRevisionHeatmap() {
  const cells = [];
  SUBJECTS.forEach((subject) => {
    const count = state.currentUser.data.revisions[subject.name].filter(Boolean).length;
    cells.push(`<span class="heat-cell level-${count ? count + 1 : 0}" title="${escapeHtml(subject.name)}: ${count}/3"></span>`);
  });
  qs("#revisionHeatmap").innerHTML = cells.join("");
}

function handlePyqSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const item = {
    id: `pyq-${Date.now()}`,
    subject: sanitize(form.subject.value),
    attempted: numberValue(form.attempted.value),
    correct: numberValue(form.correct.value),
    incorrect: numberValue(form.incorrect.value),
    skipped: numberValue(form.skipped.value),
    date: todayKey()
  };
  if (item.correct + item.incorrect > item.attempted) {
    alert("Correct plus incorrect cannot exceed attempted questions.");
    return;
  }
  state.currentUser.data.pyq.push(item);
  addActivity(item.date, { questions: item.attempted });
  saveCurrentUser();
  form.reset();
  hydrateSelects();
  renderPyq();
  renderDashboard();
  renderActivity();
  renderAnalytics();
  renderReportPreview();
}

function handlePyqDelete(event) {
  const button = event.target.closest("[data-delete-pyq]");
  if (!button) return;
  state.currentUser.data.pyq = state.currentUser.data.pyq.filter((item) => item.id !== button.dataset.deletePyq);
  saveCurrentUser();
  renderPyq();
  renderDashboard();
  renderAnalytics();
}

function renderPyq() {
  const items = state.currentUser.data.pyq;
  const attempted = sum(items, "attempted");
  const correct = sum(items, "correct");
  const incorrect = sum(items, "incorrect");
  const skipped = sum(items, "skipped");
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const successRate = attempted + skipped ? Math.round((correct / (attempted + skipped)) * 100) : 0;
  qs("#pyqStats").innerHTML = [
    ["Questions Attempted", attempted, "fa-circle-question"],
    ["Correct", correct, "fa-check"],
    ["Incorrect", incorrect, "fa-xmark"],
    ["Skipped", skipped, "fa-forward"],
    ["Accuracy", `${accuracy}%`, "fa-crosshairs"],
    ["Success Rate", `${successRate}%`, "fa-trophy"]
  ].map(([label, value, icon]) => statCard(label, value, icon)).join("");

  qs("#pyqTable").innerHTML = items.map((item) => {
    const itemAccuracy = item.attempted ? Math.round((item.correct / item.attempted) * 100) : 0;
    return `
      <tr>
        <td>${escapeHtml(item.subject)}</td>
        <td>${item.attempted}</td>
        <td>${item.correct}</td>
        <td>${item.incorrect}</td>
        <td>${item.skipped}</td>
        <td>${itemAccuracy}%</td>
        <td><button class="icon-btn" type="button" data-delete-pyq="${item.id}" aria-label="Delete PYQ"><i class="fa-solid fa-trash"></i></button></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="7">Add PYQ practice to calculate accuracy and success rate.</td></tr>`;
}

function setTimerMode(mode) {
  pauseTimer();
  state.timer.mode = mode;
  const customMinutes = clamp(numberValue(qs("#customMinutes").value), 1, 240);
  const minutes = mode === "focus" ? 25 : mode === "break" ? 5 : customMinutes;
  state.timer.totalSeconds = minutes * 60;
  state.timer.remainingSeconds = state.timer.totalSeconds;
  state.timer.activeFocusSeconds = 0;
  qsa("[data-timer-mode]").forEach((button) => button.classList.toggle("active", button.dataset.timerMode === mode));
  renderTimer();
}

function startTimer() {
  if (state.timer.running) return;
  state.timer.running = true;
  state.timer.interval = window.setInterval(() => {
    if (state.timer.remainingSeconds <= 0) {
      completeTimerSession();
      return;
    }
    state.timer.remainingSeconds -= 1;
    if (state.timer.mode !== "break") {
      state.timer.activeFocusSeconds += 1;
      state.currentUser.data.timer.focusSeconds += 1;
      if (state.timer.activeFocusSeconds % 60 === 0) {
        addActivity(todayKey(), { focusMinutes: 1 });
        saveCurrentUser();
      }
    }
    renderTimer();
  }, 1000);
}

function pauseTimer() {
  state.timer.running = false;
  if (state.timer.interval) window.clearInterval(state.timer.interval);
  state.timer.interval = null;
  if (state.currentUser) saveCurrentUser();
}

function resetTimer() {
  pauseTimer();
  state.timer.remainingSeconds = state.timer.totalSeconds;
  state.timer.activeFocusSeconds = 0;
  renderTimer();
}

function completeTimerSession() {
  pauseTimer();
  if (state.timer.mode !== "break") {
    addActivity(todayKey(), { focusMinutes: Math.max(1, Math.round(state.timer.totalSeconds / 60)) });
  }
  alert(state.timer.mode === "break" ? "Break complete." : "Focus session complete.");
  resetTimer();
  renderDashboard();
  renderActivity();
  renderAnalytics();
}

function renderTimer() {
  qs("#timerDisplay").textContent = formatSeconds(state.timer.remainingSeconds);
  const total = state.currentUser?.data?.timer?.focusSeconds || 0;
  qs("#timerTotal").textContent = `Total focus hours: ${(total / 3600).toFixed(1)}`;
}

function renderActivity() {
  const activity = state.currentUser.data.activity;
  const days = getRecentDays(91);
  qs("#activityHeatmap").innerHTML = days.map((day) => {
    const level = activityLevel(activity[day] || {});
    return `<span class="heat-cell level-${level}" title="${day}: ${activityText(activity[day])}"></span>`;
  }).join("");

  const last30 = days.slice(-30);
  const focusMinutes = last30.reduce((total, day) => total + ((activity[day] || {}).focusMinutes || 0), 0);
  const questions = last30.reduce((total, day) => total + ((activity[day] || {}).questions || 0), 0);
  const mocks = last30.reduce((total, day) => total + ((activity[day] || {}).mocks || 0), 0);
  const activeDays = last30.filter((day) => activityLevel(activity[day] || {}) > 0).length;
  qs("#activityStats").innerHTML = [
    ["30-day Focus", `${(focusMinutes / 60).toFixed(1)}h`, "fa-clock"],
    ["30-day Questions", questions, "fa-circle-question"],
    ["30-day Mocks", mocks, "fa-file-lines"],
    ["Active Days", activeDays, "fa-calendar-check"]
  ].map(([label, value, icon]) => statCard(label, value, icon)).join("");
}

function renderAnalytics() {
  const metrics = calculateMetrics();
  qs("#analyticsGrid").innerHTML = [
    ["Preparation Meter", `${metrics.preparationMeter}%`, "Balanced readiness from completion, accuracy, revision, mocks, and consistency."],
    ["Predicted GATE Score", metrics.predictedScore, "Projected score from current mock baseline and preparation meter."],
    ["Predicted GATE Rank", metrics.predictedRank, "Lower is better. Estimate updates as score and consistency improve."],
    ["Study Consistency", `${metrics.consistency}%`, "Based on current streak and recent active days."],
    ["Burnout Risk", metrics.burnoutRisk, "Estimated from daily hours, streak, and recent focus density."],
    ["Recommended Daily Hours", `${metrics.recommendedHours}h`, "Hours needed to close the target score gap before exam day."]
  ].map(([label, value, text]) => `
    <article class="analytics-card">
      <p>${escapeHtml(label)}</p>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(text)}</p>
    </article>
  `).join("");
  qs("#recommendedHours").textContent = `${metrics.recommendedHours} hours per day`;
  qs("#recommendedBar").style.width = `${Math.min(100, (metrics.recommendedHours / 10) * 100)}%`;
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const note = {
    id: form.noteId.value || `note-${Date.now()}`,
    title: sanitize(form.title.value),
    type: sanitize(form.type.value),
    content: sanitize(form.content.value),
    updatedAt: new Date().toISOString()
  };
  if (!note.title || !note.content) return;

  const notes = state.currentUser.data.notes;
  const existing = notes.findIndex((item) => item.id === note.id);
  if (existing >= 0) notes[existing] = note;
  else notes.unshift(note);
  saveCurrentUser();
  form.reset();
  renderNotes();
}

function handleNoteAction(event) {
  const edit = event.target.closest("[data-edit-note]");
  const remove = event.target.closest("[data-delete-note]");
  const notes = state.currentUser.data.notes;
  if (edit) {
    const note = notes.find((item) => item.id === edit.dataset.editNote);
    if (!note) return;
    const form = qs("#noteForm");
    form.noteId.value = note.id;
    form.title.value = note.title;
    form.type.value = note.type;
    form.content.value = note.content;
  }
  if (remove) {
    state.currentUser.data.notes = notes.filter((item) => item.id !== remove.dataset.deleteNote);
    saveCurrentUser();
    renderNotes();
  }
}

function renderNotes() {
  const notes = state.currentUser.data.notes;
  qs("#notesList").innerHTML = notes.map((note) => `
    <article class="note-card">
      <div class="note-actions">
        <span class="badge">${escapeHtml(note.type)}</span>
        <button class="icon-btn" type="button" data-edit-note="${note.id}" aria-label="Edit note"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn" type="button" data-delete-note="${note.id}" aria-label="Delete note"><i class="fa-solid fa-trash"></i></button>
      </div>
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content)}</p>
    </article>
  `).join("") || `<article class="note-card"><h3>No notes saved yet</h3><p>Add formulas, concepts, and revision notes from the form above.</p></article>`;
}

function handleQuickPrompt(event) {
  const button = event.target.closest("[data-question]");
  if (!button) return;
  sendMentorMessage(button.dataset.question);
}

function handleMentorSubmit(event) {
  event.preventDefault();
  const input = event.currentTarget.message;
  const message = sanitize(input.value);
  if (!message) return;
  sendMentorMessage(message);
  input.value = "";
}

function sendMentorMessage(message) {
  state.currentUser.data.mentor.push({ role: "user", text: message });
  state.currentUser.data.mentor.push({ role: "assistant", text: mentorReply(message) });
  saveCurrentUser();
  renderMentor();
}

function mentorReply(message) {
  const text = message.toLowerCase();
  const metrics = calculateMetrics();
  const weakest = getLowestSubjects(3).map((subject) => subject.name);
  const plan = generateStudyPlan();
  if (text.includes("today") || text.includes("study")) {
    return `Today: ${plan.daily.map((task) => `${task.time} ${task.subject} (${task.topic})`).join("; ")}. Keep the final block for revision and error-log cleanup.`;
  }
  if (text.includes("mock") || text.includes("analysis")) {
    const stats = mockStats(getSortedMocks());
    return `Mock analysis: average score ${stats.averageScore}, highest ${stats.highestScore}, lowest ${stats.lowestScore}, average accuracy ${stats.averageAccuracy}%. Your next review should target ${weakest.join(", ")}.`;
  }
  if (text.includes("revision")) {
    return `Revision plan: finish Revision 1 for ${weakest[0]}, Revision 2 for ${weakest[1]}, and a 30-minute formula drill for ${weakest[2]}. Close each session with 20 PYQs.`;
  }
  if (text.includes("weak")) {
    return `Your weakest subjects currently look like ${weakest.join(", ")} based on chapter completion and profile priority. Start with the lowest completion subject first.`;
  }
  if (text.includes("predict") || text.includes("score") || text.includes("rank")) {
    return `Prediction: score ${metrics.predictedScore}, rank around ${metrics.predictedRank}, preparation meter ${metrics.preparationMeter}%. Raise accuracy and mock count to move the prediction faster.`;
  }
  if (text.includes("900")) {
    return "900+ strategy: finish 95% chapters, keep accuracy above 85%, take 2 full mocks weekly, revise every formula sheet three times, and turn every mock mistake into a same-day correction drill.";
  }
  return `Focus on ${weakest[0]} now. Recommended daily hours: ${metrics.recommendedHours}. Preparation meter is ${metrics.preparationMeter}%, so the fastest gain is weak-topic PYQs plus revision heatmap completion.`;
}

function renderMentor() {
  const messages = state.currentUser.data.mentor;
  const html = messages.map((item) => `
    <div class="chat-bubble ${item.role}">${escapeHtml(item.text)}</div>
  `).join("");
  qs("#mentorChat").innerHTML = html;
  qs("#mentorChat").scrollTop = qs("#mentorChat").scrollHeight;
  syncMentorExpanded();
}

function syncMentorExpanded() {
  const target = qs("#mentorExpanded");
  if (!target) return;
  target.innerHTML = `
    <div class="quick-prompts">${qs("#quickPrompts").innerHTML}</div>
    <div class="chat-window">${qs("#mentorChat").innerHTML}</div>
    <form class="mentor-input" id="mentorExpandedForm">
      <input type="text" name="message" aria-label="Message AI mentor" required>
      <button class="icon-btn primary-icon" type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
    </form>
  `;
  qsa("[data-question]", target).forEach((button) => button.addEventListener("click", () => sendMentorMessage(button.dataset.question)));
  qs("#mentorExpandedForm", target).addEventListener("submit", (event) => {
    event.preventDefault();
    const message = sanitize(event.currentTarget.message.value);
    if (message) sendMentorMessage(message);
  });
}

function renderReportPreview() {
  qs("#reportPreview").textContent = buildReportText(qs("#reportType").value);
}

function exportPdfReport() {
  const type = qs("#reportType").value;
  const text = buildReportText(type);
  if (!window.jspdf?.jsPDF) {
    alert("PDF engine is still loading. Please try again in a moment.");
    return;
  }
  const doc = new window.jspdf.jsPDF();
  const lines = doc.splitTextToSize(text, 180);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("GATE Prep Tracker AI", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(lines, 14, 30);
  doc.save(`gate-prep-${type}-report.pdf`);
}

function buildReportText(type) {
  const profile = state.currentUser.profile;
  const metrics = calculateMetrics();
  const plan = generateStudyPlan();
  const weak = detectWeakTopics().slice(0, 5);
  const lines = [
    `${reportTitle(type)}`,
    `Student: ${profile.fullName}`,
    `Branch: ${profile.branch}`,
    `Date: ${new Date().toLocaleString()}`,
    `Preparation Meter: ${metrics.preparationMeter}%`,
    `Predicted Score: ${metrics.predictedScore}`,
    `Predicted Rank: ${metrics.predictedRank}`,
    ""
  ];

  if (type === "daily") {
    lines.push("Today's Tasks:");
    plan.daily.forEach((task) => lines.push(`- ${task.time}: ${task.subject} - ${task.topic} (${task.type})`));
  }
  if (type === "weekly") {
    lines.push("Weekly Planner:");
    plan.weekly.forEach((item) => lines.push(`- ${item.day}: ${item.focus}`));
  }
  if (type === "monthly") {
    lines.push("Monthly Planner:");
    plan.monthly.forEach((item) => lines.push(`- ${item.week}: ${item.theme}. ${item.work}`));
  }
  if (type === "mock") {
    const stats = mockStats(getSortedMocks());
    lines.push(`Average Score: ${stats.averageScore}`);
    lines.push(`Highest Score: ${stats.highestScore}`);
    lines.push(`Lowest Score: ${stats.lowestScore}`);
    lines.push(`Overall Accuracy: ${stats.averageAccuracy}%`);
    lines.push("Weak Topics:");
    weak.forEach((item) => lines.push(`- ${item.subject}: ${item.topic} (${item.priority})`));
  }
  if (type === "revision") {
    lines.push("Revision Progress:");
    SUBJECTS.forEach((subject) => {
      const count = state.currentUser.data.revisions[subject.name].filter(Boolean).length;
      lines.push(`- ${subject.name}: ${count}/3 revisions complete`);
    });
  }
  return lines.join("\n");
}

function reportTitle(type) {
  return {
    daily: "Daily Report",
    weekly: "Weekly Report",
    monthly: "Monthly Report",
    mock: "Mock Test Report",
    revision: "Revision Report"
  }[type] || "Preparation Report";
}

function calculateMetrics() {
  const data = state.currentUser.data;
  const profile = state.currentUser.profile;
  const totalChapters = SUBJECTS.reduce((total, subject) => total + subject.chapters.length, 0);
  const completedChapters = SUBJECTS.reduce((total, subject) => total + data.subjectProgress[subject.name].filter(Boolean).length, 0);
  const studyCompletion = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0;
  const totalRevisions = SUBJECTS.length * 3;
  const completedRevisions = SUBJECTS.reduce((total, subject) => total + data.revisions[subject.name].filter(Boolean).length, 0);
  const revisionProgress = Math.round((completedRevisions / totalRevisions) * 100);
  const pyqAttempted = sum(data.pyq, "attempted");
  const pyqCorrect = sum(data.pyq, "correct");
  const pyqAccuracy = pyqAttempted ? Math.round((pyqCorrect / pyqAttempted) * 100) : 0;
  const mocks = getSortedMocks();
  const mockAverageAccuracy = mockStats(mocks).averageAccuracy;
  const overallAccuracy = Math.round((pyqAccuracy + mockAverageAccuracy) / (pyqAccuracy && mockAverageAccuracy ? 2 : 1)) || 0;
  const focusSeconds = data.timer.focusSeconds || 0;
  const hoursStudied = focusSeconds / 3600;
  const streak = currentStreak();
  const consistency = Math.min(100, Math.round((streak / 30) * 70 + activeDays(30) * 1));
  const mockProgress = Math.min(100, Math.round((mocks.length / 20) * 100));
  const preparationMeter = clamp(Math.round(studyCompletion * 0.35 + overallAccuracy * 0.2 + revisionProgress * 0.15 + mockProgress * 0.15 + consistency * 0.15), 0, 100);
  const examDate = getGateDateForProfile(profile);
  const daysLeft = Math.max(0, Math.ceil((examDate - new Date()) / 86400000));
  const targetScore = profile.targetScore || 750;
  const baselineMarks = mocks.length ? mocks[mocks.length - 1].score : profile.currentMockScore || 35;
  const baselineScore = targetScore > 100 ? baselineMarks * 10 : baselineMarks;
  const trendBonus = mocks.length >= 2 ? Math.max(-30, Math.min(50, (mocks[mocks.length - 1].score - mocks[0].score) * 3)) : 0;
  const predictedScore = clamp(Math.round(baselineScore + (targetScore - baselineScore) * (preparationMeter / 100) + trendBonus), 0, targetScore > 100 ? 1000 : 100);
  const predictedRank = Math.max(1, Math.round(130000 * Math.exp(-(targetScore > 100 ? predictedScore : predictedScore * 10) / 155)));
  const targetGap = Math.max(0, targetScore - predictedScore);
  const recommendedHours = clamp((profile.dailyHours + targetGap / Math.max(25, daysLeft || 25)).toFixed(1), 1, 12);
  const burnoutRisk = profile.dailyHours >= 8 || hoursStudied / Math.max(1, activeDays(7)) > 6 ? "High" : profile.dailyHours >= 5 || streak > 18 ? "Moderate" : "Low";

  return {
    questionsSolved: pyqAttempted,
    overallAccuracy,
    hoursStudied,
    mockCount: mocks.length,
    streak,
    daysLeft,
    revisionProgress,
    studyCompletion,
    preparationMeter,
    predictedScore,
    predictedRank,
    consistency,
    burnoutRisk,
    recommendedHours
  };
}

function renderScoreCharts(mocks) {
  const labels = mocks.length ? mocks.map((mock) => mock.name) : ["Baseline"];
  const scores = mocks.length ? mocks.map((mock) => mock.score) : [state.currentUser.profile.currentMockScore || 0];
  const accuracies = mocks.length ? mocks.map((mock) => mock.accuracy) : [0];
  createLineChart("scoreTrendChart", labels, [{ label: "Score", data: scores, borderColor: "#36d1b7", backgroundColor: "rgba(54, 209, 183, 0.2)" }]);
  createLineChart("accuracyTrendChart", labels, [{ label: "Accuracy", data: accuracies, borderColor: "#ffb84d", backgroundColor: "rgba(255, 184, 77, 0.22)" }]);
}

function renderDashboardTrendChart() {
  const mocks = getSortedMocks();
  const labels = mocks.length ? mocks.map((mock) => mock.name) : ["Baseline"];
  const scoreData = mocks.length ? mocks.map((mock) => mock.score) : [state.currentUser.profile.currentMockScore || 0];
  const accuracyData = mocks.length ? mocks.map((mock) => mock.accuracy) : [0];
  createLineChart("dashboardTrendChart", labels, [
    { label: "Score", data: scoreData, borderColor: "#36d1b7", backgroundColor: "rgba(54, 209, 183, 0.18)" },
    { label: "Accuracy", data: accuracyData, borderColor: "#ffb84d", backgroundColor: "rgba(255, 184, 77, 0.18)" }
  ]);
}

function createLineChart(id, labels, datasets) {
  if (!window.Chart) return;
  if (state.charts[id]) state.charts[id].destroy();
  const ctx = qs(`#${id}`);
  if (!ctx) return;
  state.charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: datasets.map((dataset) => ({
        ...dataset,
        tension: 0.38,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: getComputedStyle(document.body).getPropertyValue("--muted") } }
      },
      scales: {
        x: { ticks: { color: getComputedStyle(document.body).getPropertyValue("--muted") }, grid: { color: "rgba(255,255,255,0.08)" } },
        y: { beginAtZero: true, ticks: { color: getComputedStyle(document.body).getPropertyValue("--muted") }, grid: { color: "rgba(255,255,255,0.08)" } }
      }
    }
  });
}

function destroyCharts() {
  Object.values(state.charts).forEach((chart) => chart.destroy());
  state.charts = {};
}

function statCard(label, value, icon) {
  return `
    <article class="stat-card">
      <i class="fa-solid ${icon}"></i>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `;
}

function hydrateSelects() {
  const options = SUBJECTS.map((subject) => `<option value="${escapeHtml(subject.name)}">${escapeHtml(subject.name)}</option>`).join("");
  qs("#chapterSubjectSelect").innerHTML = options;
  const pyqSelect = qs("#pyqForm select[name='subject']");
  if (pyqSelect) pyqSelect.innerHTML = options;
  const mockDate = qs("#mockForm input[name='date']");
  if (mockDate && !mockDate.value) mockDate.value = todayKey();
}

function renderSubjectCheckboxes() {
  qsa(".subject-checkboxes").forEach((container) => {
    const group = container.dataset.group;
    container.innerHTML = SUBJECTS.map((subject) => `
      <label><input type="checkbox" name="${group}" value="${escapeHtml(subject.name)}"> <span>${escapeHtml(subject.name)}</span></label>
    `).join("");
  });
}

function getCheckedSubjects(group) {
  return qsa(`input[name="${group}"]:checked`).map((input) => sanitize(input.value));
}

function getSortedMocks() {
  return [...state.currentUser.data.mocks].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function mockStats(mocks) {
  if (!mocks.length) {
    return {
      averageScore: state.currentUser.profile?.currentMockScore || 0,
      highestScore: state.currentUser.profile?.currentMockScore || 0,
      lowestScore: state.currentUser.profile?.currentMockScore || 0,
      averageAccuracy: 0
    };
  }
  const scores = mocks.map((mock) => mock.score);
  const accuracies = mocks.map((mock) => mock.accuracy);
  return {
    averageScore: round(sumNumbers(scores) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averageAccuracy: round(sumNumbers(accuracies) / accuracies.length)
  };
}

function getLowestSubjects(limit = 3) {
  return SUBJECTS.map((subject) => ({
    ...subject,
    percent: getSubjectPercent(subject.name)
  })).sort((a, b) => a.percent - b.percent).slice(0, limit);
}

function getSubjectPercent(subjectName) {
  const subject = SUBJECTS.find((entry) => entry.name === subjectName);
  if (!subject) return 0;
  const progress = state.currentUser.data.subjectProgress[subjectName] || [];
  return Math.round((progress.filter(Boolean).length / subject.chapters.length) * 100);
}

function pickTopic(subjectName, offset = 0) {
  const subject = SUBJECTS.find((entry) => entry.name === subjectName) || SUBJECTS[0];
  const progress = state.currentUser.data.subjectProgress[subject.name] || [];
  const pendingIndex = progress.findIndex((done) => !done);
  const index = pendingIndex >= 0 ? pendingIndex : offset % subject.chapters.length;
  return subject.chapters[index];
}

function addActivity(dateKey, patch) {
  const activity = state.currentUser.data.activity;
  activity[dateKey] = activity[dateKey] || { focusMinutes: 0, questions: 0, mocks: 0 };
  activity[dateKey].focusMinutes += patch.focusMinutes || 0;
  activity[dateKey].questions += patch.questions || 0;
  activity[dateKey].mocks += patch.mocks || 0;
}

function currentStreak() {
  const activity = state.currentUser.data.activity;
  let streak = 0;
  for (const day of getRecentDays(365).reverse()) {
    if (activityLevel(activity[day] || {}) > 0) streak += 1;
    else if (day !== todayKey()) break;
  }
  return streak;
}

function activeDays(count) {
  const activity = state.currentUser.data.activity;
  return getRecentDays(count).filter((day) => activityLevel(activity[day] || {}) > 0).length;
}

function activityLevel(day = {}) {
  const score = (day.focusMinutes || 0) / 30 + (day.questions || 0) / 25 + (day.mocks || 0) * 2;
  if (score >= 5) return 4;
  if (score >= 3) return 3;
  if (score >= 1) return 2;
  if (score > 0) return 1;
  return 0;
}

function activityText(day = {}) {
  if (!day) return "No activity";
  return `${day.focusMinutes || 0} focus minutes, ${day.questions || 0} questions, ${day.mocks || 0} mocks`;
}

function getRecentDays(count) {
  const days = [];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  for (let i = count - 1; i >= 0; i -= 1) {
    const day = new Date(date);
    day.setDate(date.getDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

function updateCountdown() {
  const target = getNextGateDate();
  const diff = Math.max(0, target - new Date());
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  qs("#countDays").textContent = String(days).padStart(3, "0");
  qs("#countHours").textContent = String(hours).padStart(2, "0");
  qs("#countMinutes").textContent = String(minutes).padStart(2, "0");
  qs("#countSeconds").textContent = String(remainingSeconds).padStart(2, "0");
}

function getNextGateDate() {
  const now = new Date();
  let date = inferGateExamDate(now.getFullYear());
  if (date < now) date = inferGateExamDate(now.getFullYear() + 1);
  return date;
}

function getGateDateForProfile(profile) {
  return inferGateExamDate(profile?.targetYear || getNextGateDate().getFullYear());
}

function inferGateExamDate(year) {
  const date = new Date(year, 1, 1, 9, 0, 0, 0);
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1);
  return date;
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(STORAGE.theme, theme);
  qsa(".theme-toggle i").forEach((icon) => {
    icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  });
  if (state.currentUser?.profile) {
    renderDashboardTrendChart();
    renderScoreCharts(getSortedMocks());
  }
}

function toggleTheme() {
  applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
}

function clearAuthErrors(prefix) {
  qsa(`[data-error-for^="${prefix}-"]`).forEach((node) => {
    node.textContent = "";
  });
  setMessage("#authMessage", "");
}

function setFieldError(name, message) {
  const node = qs(`[data-error-for="${name}"]`);
  if (node) node.textContent = message;
  return false;
}

function setMessage(selector, message, success = false) {
  const node = qs(selector);
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("success", success);
}

function sanitize(value) {
  return String(value || "").replace(/[<>]/g, "").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^\+?[0-9]{10,15}$/.test(value.replace(/\s+/g, ""));
}

function isStrongPassword(value) {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

async function hashPassword(value) {
  if (window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return btoa(unescape(encodeURIComponent(value)));
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function sum(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function sumNumbers(items) {
  return items.reduce((total, item) => total + Number(item || 0), 0);
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatHour(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatSeconds(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
