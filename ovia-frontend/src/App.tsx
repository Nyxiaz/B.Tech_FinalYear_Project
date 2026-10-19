import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, Award, BookOpen,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  ClipboardList, Clock3, GraduationCap, Hand, House, LayoutDashboard,
  Menu, MessageCircle, Play, Plus, Search, Settings,
  ShieldCheck, Sparkles, Target, Users, Video, X, BarChart3, Bell, BookMarked,
  Lightbulb, Send, LockKeyhole, FileText, Pencil, Trash2, Eye,
  RefreshCw, Bookmark
} from "lucide-react";
import "./App.css";

type Role = "learner" | "admin";
type Page = "dashboard" | "learn" | "practice" | "quiz" | "progress" | "chatbot" | "admin" | "content" | "users";
type EntryScreen = "landing" | "auth" | "app";
type Lesson = { id: string; title: string; category: "Alphabet" | "Number" | "Everyday"; label: string; description: string; color: string; tip: string };
type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string };

const initialLessons: Lesson[] = [
  { id: "A", title: "Letter A", category: "Alphabet", label: "A", description: "Learn the handshape for the letter A.", color: "peach", tip: "Keep your thumb resting alongside the fingers." },
  { id: "B", title: "Letter B", category: "Alphabet", label: "B", description: "Practice the handshape for the letter B.", color: "sage", tip: "Keep your fingers together and your thumb folded across the palm." },
  { id: "C", title: "Letter C", category: "Alphabet", label: "C", description: "Make a curved C-shaped hand.", color: "lavender", tip: "Curve your fingers and thumb as if holding a small cup." },
  { id: "1", title: "Number 1", category: "Number", label: "1", description: "Explore how numbers are represented.", color: "blue", tip: "Keep the movement clear and steady." },
  { id: "2", title: "Number 2", category: "Number", label: "2", description: "Practice the sign for number two.", color: "yellow", tip: "Make sure each finger is clearly visible." },
  { id: "HELLO", title: "Hello", category: "Everyday", label: "Hi!", description: "A friendly everyday greeting.", color: "rose", tip: "Practice the movement slowly before increasing speed." },
];
const questions: QuizQuestion[] = [
  { question: "What is the best way to learn a new sign?", options: ["Look once and move on", "Observe the reference and practice carefully", "Guess the handshape", "Skip the instructions"], answer: 1, explanation: "Reference images and step-by-step practice help you learn a sign more carefully." },
  { question: "When practicing a handshape, what should you check?", options: ["Only your speed", "Whether your hand is hidden", "Finger position and visibility", "Nothing at all"], answer: 2, explanation: "Clear finger position and visibility make practice easier to review." },
  { question: "What can help you remember a lesson?", options: ["Regular short practice", "Never revisiting it", "Only reading the title", "Skipping feedback"], answer: 0, explanation: "Short, regular practice sessions can help reinforce learning." },
  { question: "What should you do after receiving practice feedback?", options: ["Ignore it", "Review it and try again", "Close the lesson forever", "Delete your progress"], answer: 1, explanation: "Feedback can help you identify what to practice next." },
];

const navItems: { page: Page; label: string; icon: typeof House; group: string }[] = [
  { page: "dashboard", label: "Overview", icon: House, group: "LEARN" },
  { page: "learn", label: "Learn ISL", icon: BookOpen, group: "LEARN" },
  { page: "practice", label: "Sign practice", icon: Video, group: "LEARN" },
  { page: "quiz", label: "Quizzes", icon: ClipboardList, group: "LEARN" },
  { page: "progress", label: "My progress", icon: BarChart3, group: "YOUR SPACE" },
  { page: "chatbot", label: "Ask Ovia", icon: MessageCircle, group: "YOUR SPACE" },
];

function SignIllustration({ label, color = "sage", large = false }: { label: string; color?: string; large?: boolean }) {
  return <div className={`sign-art ${color} ${large ? "sign-art-large" : ""}`} aria-label={`Illustration placeholder for ${label}`}>
    <div className="sign-art-sun" />
    <div className="sign-hand" aria-hidden="true"><Hand size={large ? 76 : 54} strokeWidth={1.25} /></div>
    <span className="sign-art-label">{label}</span>
  </div>;
}

function App() {
  const [entryScreen, setEntryScreen] = useState<EntryScreen>("landing");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [page, setPage] = useState<Page>("dashboard");
  const [role, setRole] = useState<Role>("learner");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [completed, setCompleted] = useState<string[]>(["A", "B"]);
  const [saved, setSaved] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(initialLessons[0]);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceResult, setPracticeResult] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ from: "bot" | "user"; text: string; sign?: string }[]>([
    { from: "bot", text: "Hi there! I'm Ovia, your learning companion. Ask me about an ISL sign or choose a suggested question below." }
  ]);
  const [toast, setToast] = useState("");
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonCategory, setLessonCategory] = useState<Lesson["category"]>("Alphabet");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [usersActive, setUsersActive] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const progress = Math.round((completed.length / 6) * 100);
  const filteredLessons = useMemo(() => lessons.filter((lesson) => {
    const matchesFilter = filter === "All" || lesson.category === filter;
    const matchesSearch = `${lesson.title} ${lesson.category} ${lesson.description}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [lessons, filter, search]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }
  function goTo(next: Page) {
    setPage(next);
    setMobileNav(false);
    setProfileOpen(false);
  }
  function chooseLesson(lesson: Lesson) {
    setActiveLesson(lesson);
    goTo("learn");
  }
  function markComplete(id: string) {
    setCompleted((current) => current.includes(id) ? current : [...current, id]);
    notify("Lesson progress saved on this device.");
  }
  function submitChat(text = chatInput) {
    const query = text.trim();
    if (!query) return;
    const answer = query.toLowerCase().includes("hello") || query.toLowerCase().includes("hi")
      ? "A greeting is a lovely place to start. Open the Everyday lessons to explore greeting practice. Remember to follow a trusted ISL learning resource for accurate signing."
      : query.toLowerCase().includes("number")
      ? "You can explore number signs in Learn ISL. Choose a number lesson, review its reference and practice slowly. This demo answer is sample content, not an AI-generated result."
      : "Here's a good way to start: open the related lesson, review the reference image and instructions, then practice the movement slowly. Ovia's real AI answers and sign references will be connected when the backend and knowledge base are ready.";
    setChatMessages((messages) => [...messages, { from: "user", text: query }, { from: "bot", text: answer, sign: query.toLowerCase().includes("hello") ? "HELLO" : undefined }]);
    setChatInput("");
  }
  function startEdit(lesson?: Lesson) {
    setEditingId(lesson?.id ?? null);
    setLessonTitle(lesson?.title ?? "");
    setLessonCategory(lesson?.category ?? "Alphabet");
    setShowLessonModal(true);
  }
  function saveLesson() {
    const title = lessonTitle.trim();
    if (!title) { notify("Please enter a lesson title."); return; }
    if (editingId) {
      setLessons((all) => all.map((lesson) => lesson.id === editingId ? { ...lesson, title, category: lessonCategory, description: `Explore ${title.toLowerCase()} with a guided lesson.` } : lesson));
      notify("Lesson updated.");
    } else {
      const id = `L${Date.now().toString().slice(-5)}`;
      setLessons((all) => [...all, { id, title, category: lessonCategory, label: title.slice(0, 4), description: `Explore ${title.toLowerCase()} with a guided lesson.`, color: "sage", tip: "Practice slowly and revisit the reference when needed." }]);
      notify("New demo lesson added.");
    }
    setShowLessonModal(false);
  }

  const pageTitle: Record<Page, string> = {
    dashboard: "Your learning space", learn: "Learn Indian Sign Language", practice: "Sign practice",
    quiz: "Quick knowledge check", progress: "Your progress", chatbot: "Ask Ovia",
    admin: "Admin overview", content: "Learning content", users: "Learner management"
  };

  if (entryScreen === "landing") return <div className="public-site">
    <header className="public-nav"><a className="public-brand" href="#top" aria-label="Ovia home">ovia<span>.</span></a><nav aria-label="Main navigation"><a href="#about">About</a><a href="#features">What you can do</a><a href="#access">Accessibility</a></nav><button className="button-secondary nav-login" onClick={() => { setAuthMode("login"); setEntryScreen("auth"); }}>Log in <ArrowRight size={16}/></button></header>
    <main id="top"><section className="public-hero"><div className="hero-copy"><span className="public-kicker"><span className="kicker-dot"/> LEARNING WITHOUT BARRIERS</span><h1>Every sign opens up <em>a new possibility.</em></h1><p className="public-lede">Ovia is an inclusive learning portal designed to make Indian Sign Language easier to explore, practice and understand — at your own pace.</p><div className="hero-actions"><button className="button-primary hero-cta" onClick={() => { setAuthMode("register"); setEntryScreen("auth"); }}>Start learning <ArrowRight size={17}/></button><a className="hero-text-link" href="#about">Discover Ovia <ChevronDown size={16}/></a></div><div className="hero-trust"><span><CheckCircle2 size={16}/> Guided lessons</span><span><CheckCircle2 size={16}/> Practice & quizzes</span><span><CheckCircle2 size={16}/> Learner-first design</span></div></div><div className="hero-visual" aria-label="Decorative placeholder area"><div className="visual-note note-top"><span className="note-dot sage-dot"/> Learn at your own pace</div><div className="visual-paper"><div className="paper-header"><span>YOUR LEARNING SPACE</span><span className="paper-menu">•••</span></div><div className="paper-title">Small steps.<br/><strong>Meaningful progress.</strong></div><div className="paper-progress"><span><i/></span><b>68%</b></div><div className="paper-caption">Your learning journey, one sign at a time.</div><div className="paper-bottom"><div className="paper-tile tile-sage"><BookOpen size={23}/><span>Learn</span></div><div className="paper-tile tile-clay"><Hand size={23}/><span>Practice</span></div><div className="paper-tile tile-butter"><MessageCircle size={23}/><span>Ask Ovia</span></div></div></div><div className="visual-note note-bottom"><span className="note-icon"><ShieldCheck size={18}/></span><span><strong>Made to feel clear</strong><small>Simple, supportive and accessible</small></span></div></div></section>
    <section className="public-stats" aria-label="Ovia learning features"><div><strong>Learn</strong><span>Clear, guided ISL lessons</span></div><div><strong>Practice</strong><span>Build confidence through repetition</span></div><div><strong>Understand</strong><span>Ask questions and review progress</span></div></section>
    <section id="about" className="public-section about-section"><div className="section-overline">A LITTLE ABOUT OVIA</div><div className="public-section-grid"><h2>Learning should feel <em>within reach.</em></h2><div><p>Ovia stands for <strong>One Voice, Inclusive Access.</strong> It brings learning resources, sign practice, quizzes and a question-and-answer space together in one welcoming place.</p><p>Our goal is to support learners who are Deaf or hard of hearing, and anyone who wants to learn Indian Sign Language, with an interface that feels calm, clear and easy to navigate.</p></div></div></section>
    <section id="features" className="public-section features-section"><div className="section-overline">EXPLORE YOUR LEARNING SPACE</div><h2>Everything you need to <em>keep learning.</em></h2><div className="public-feature-grid"><article><div className="public-feature-icon sage"><BookOpen size={23}/></div><h3>Learn ISL</h3><p>Explore alphabet, number and everyday sign lessons with reference placeholders and step-by-step guidance.</p></article><article><div className="public-feature-icon clay"><Video size={23}/></div><h3>Practice with purpose</h3><p>Use a dedicated practice space to rehearse signs and review sample feedback.</p></article><article><div className="public-feature-icon butter"><ClipboardList size={23}/></div><h3>Check your progress</h3><p>Try short quizzes, review your results and see the learning milestones you have completed.</p></article><article><div className="public-feature-icon blue"><MessageCircle size={23}/></div><h3>Ask Ovia</h3><p>Explore a demo chatbot experience designed for ISL questions and learning support.</p></article></div></section>
    <section id="access" className="public-access"><div><span className="section-overline">YOUR SPACE IS READY</span><h2>A more thoughtful way to learn.</h2><p>Choose your role to enter the right workspace. This frontend is currently a demo; account verification and saved data will be connected when the backend is ready.</p></div><button className="button-primary hero-cta" onClick={() => { setAuthMode("register"); setEntryScreen("auth"); }}>Enter Ovia <ArrowRight size={17}/></button></section></main><footer className="public-footer"><a className="public-brand" href="#top">ovia<span>.</span></a><span>One Voice, Inclusive Access</span><span>© 2026 Ovia · Learning with care</span></footer>
  </div>;

  if (entryScreen === "auth") return <div className="auth-shell"><header className="auth-topbar"><button className="auth-back" onClick={() => setEntryScreen("landing")}><ArrowRight size={16}/> Back to Ovia</button><a className="public-brand" href="#top" onClick={(e) => { e.preventDefault(); setEntryScreen("landing"); }}>ovia<span>.</span></a><span className="auth-top-note">ONE VOICE, INCLUSIVE ACCESS</span></header><main className="auth-main"><div className="auth-intro"><span className="public-kicker"><span className="kicker-dot"/> YOUR OVIA SPACE</span><h1>{authMode === "login" ? "Welcome back." : "Your learning journey starts here."}</h1><p>{authMode === "login" ? "Sign in to continue learning, practicing and tracking your progress." : "Create a demo profile and choose the workspace that fits your role."}</p><div className="auth-points"><span><CheckCircle2 size={17}/> Learn at your own pace</span><span><CheckCircle2 size={17}/> Keep your learning space organized</span><span><CheckCircle2 size={17}/> Clear, accessible navigation</span></div></div><form className="auth-card" onSubmit={(e) => { e.preventDefault(); if (!authEmail.trim() || !authPassword.trim() || (authMode === "register" && !authName.trim())) { setAuthError("Please complete all required fields."); return; } setAuthError(""); setPage(role === "admin" ? "admin" : "dashboard"); setEntryScreen("app"); }}><div className="auth-card-heading"><span className="section-overline">{authMode === "login" ? "SIGN IN" : "CREATE YOUR PROFILE"}</span><h2>{authMode === "login" ? "Log in to Ovia" : "Register for Ovia"}</h2><p>Choose how you want to enter the portal.</p></div><div className="role-picker" role="group" aria-label="Choose account role"><button type="button" className={`role-option ${role === "learner" ? "role-selected" : ""}`} onClick={() => setRole("learner")}><span className="role-option-icon"><BookOpen size={21}/></span><span><strong>Learner</strong><small>Lessons, practice & progress</small></span>{role === "learner" && <CheckCircle2 size={18}/>}</button><button type="button" className={`role-option ${role === "admin" ? "role-selected" : ""}`} onClick={() => setRole("admin")}><span className="role-option-icon admin-icon"><Settings size={21}/></span><span><strong>Administrator</strong><small>Content & learner reports</small></span>{role === "admin" && <CheckCircle2 size={18}/>}</button></div>{authMode === "register" && <label className="auth-field"><span>Full name</span><input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Enter your name" autoComplete="name" required/></label>}<label className="auth-field"><span>Email address</span><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label><label className="auth-field"><span>Password</span><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Enter password" autoComplete={authMode === "login" ? "current-password" : "new-password"} required minLength={4}/></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<button className="button-primary auth-submit" type="submit">{authMode === "login" ? `Continue as ${role === "admin" ? "administrator" : "learner"}` : "Create demo profile"} <ArrowRight size={17}/></button><p className="auth-switch">{authMode === "login" ? "New to Ovia?" : "Already have a profile?"} <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>{authMode === "login" ? "Create an account" : "Log in instead"}</button></p><p className="auth-demo-note"><ShieldCheck size={15}/> Demo only: credentials are not sent to a server or saved.</p></form></main><footer className="auth-footer">© 2026 Ovia · One Voice, Inclusive Access</footer></div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <button className="brand" onClick={() => goTo("dashboard")} aria-label="Ovia home">
        <span className="brand-mark"><Hand size={23} strokeWidth={1.7} /></span>
        <span className="brand-word">ovia<span>.</span><small>ONE VOICE, INCLUSIVE ACCESS</small></span>
        <button className="mobile-close" onClick={(event) => { event.stopPropagation(); setMobileNav(false); }} aria-label="Close menu"><X size={19}/></button>
      </button>
      <div className="sidebar-profile">
        <div className="avatar avatar-sage">{role === "admin" ? "AD" : "DS"}</div>
        <div className="profile-copy"><strong>{role === "admin" ? "Demo Admin" : "Disha's space"}</strong><span>{role === "admin" ? "Content manager" : "Curious learner"}</span></div>
        <ChevronDown size={15} className="muted-icon"/>
      </div>
      <nav className="nav-list" aria-label="Main navigation">
        {role === "learner" ? <>
          {["LEARN", "YOUR SPACE"].map((group) => <div className="nav-group" key={group}>
            <p className="nav-label">{group}</p>
            {navItems.filter((item) => item.group === group).map((item) => {
              const Icon = item.icon;
              return <button key={item.page} className={`nav-item ${page === item.page ? "active" : ""}`} onClick={() => goTo(item.page)}>
                <Icon size={18} strokeWidth={1.8}/><span>{item.label}</span>{item.page === "chatbot" && <span className="nav-new">NEW</span>}
              </button>;
            })}
          </div>)}
        </> : <>
          <p className="nav-label">ADMIN WORKSPACE</p>
          {([{ page: "admin" as Page, label: "Overview", icon: LayoutDashboard }, { page: "content" as Page, label: "Manage content", icon: BookMarked }, { page: "users" as Page, label: "Learners & reports", icon: Users }]).map((item) => {
            const Icon = item.icon;
            return <button key={item.page} className={`nav-item ${page === item.page ? "active" : ""}`} onClick={() => goTo(item.page)}><Icon size={18}/><span>{item.label}</span></button>;
          })}
        </>}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><Lightbulb size={17}/></div><strong>A little practice goes a long way.</strong><p>Small steps make learning stick.</p><button onClick={() => goTo(role === "admin" ? "content" : "learn")}>Explore lessons <ArrowRight size={14}/></button></div>
        <button className="nav-item settings-link" onClick={() => { setProfileOpen(!profileOpen); }}><Settings size={18}/><span>Settings & profile</span></button>
        {profileOpen && <div className="role-popover"><span>Demo role</span><button onClick={() => { setRole("learner"); goTo("dashboard"); }}>Learner view</button><button onClick={() => { setRole("admin"); goTo("admin"); }}>Administrator view</button><button onClick={() => { setEntryScreen("landing"); setProfileOpen(false); }}>Sign out to Ovia</button></div>}
        <div className="sidebar-footer"><span className="status-dot"/><span>Demo mode · Local data only</span></div>
      </div>
    </aside>

    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{pageTitle[page]}</strong></div></div>
        <div className="topbar-actions">
          <label className="search-box"><Search size={16}/><input value={search} onChange={(e) => { setSearch(e.target.value); if (page !== "learn" && e.target.value) setPage("learn"); }} placeholder="Search lessons..." aria-label="Search lessons"/><kbd>⌘ K</kbd></label>
          <button className="icon-button notification-button" onClick={() => notify("You're all caught up!")} aria-label="Notifications"><Bell size={18}/><i/></button>
          <button className="top-avatar" onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile menu">{role === "admin" ? "AD" : "DS"}</button>
          {profileOpen && <div className="top-role-menu"><span>Switch demo view</span><button onClick={() => { setRole("learner"); goTo("dashboard"); }}>Learner</button><button onClick={() => { setRole("admin"); goTo("admin"); }}>Administrator</button><button onClick={() => { setEntryScreen("landing"); setProfileOpen(false); }}>Sign out</button></div>}
        </div>
      </header>

      <div className="page-content">
        {page === "dashboard" && role === "learner" && <section className="page-section">
          <div className="welcome-row"><div><p className="eyebrow">MONDAY, YOUR DAY TO LEARN</p><h1>A little progress,<br/><em>a lot of possibility.</em></h1><p className="page-subtitle">Welcome back, Disha. Ready to learn something new today?</p></div><div className="welcome-art"><div className="welcome-orbit orbit-one"/><div className="welcome-orbit orbit-two"/><div className="welcome-hand"><Hand size={86} strokeWidth={1.15}/></div><span className="floating-note note-one"><Sparkles size={14}/> Learn at your pace</span><span className="floating-note note-two"><HeartIcon/> One step at a time</span></div></div>
          <div className="hero-actions"><button className="button-primary" onClick={() => goTo("learn")}>Continue learning <ArrowRight size={16}/></button><button className="button-secondary" onClick={() => goTo("practice")}><Video size={16}/> Practice a sign</button></div>
          <div className="stats-grid">
            <StatCard icon={<BookOpen size={19}/>} label="Lessons explored" value={`${completed.length} / ${lessons.length}`} detail="Keep your momentum" tone="sage"/>
            <StatCard icon={<Target size={19}/>} label="Quiz average" value={quizScore ? `${Math.round((quizScore / questions.length) * 100)}%` : "—"} detail={quizScore ? "From your demo attempt" : "Try your first quiz"} tone="clay"/>
            <StatCard icon={<Activity size={19}/>} label="Learning streak" value="2 days" detail="You're building a habit" tone="butter"/>
            <StatCard icon={<Award size={19}/>} label="Practice sessions" value={practiceResult ? "1" : "0"} detail="Every try counts" tone="blue"/>
          </div>
          <div className="content-grid dashboard-grid">
            <div className="panel lesson-panel"><div className="panel-heading"><div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>Continue learning</h2></div><button className="text-link" onClick={() => goTo("learn")}>All lessons <ArrowRight size={15}/></button></div>
              <div className="continue-card"><SignIllustration label={activeLesson.label} color={activeLesson.color} /><div className="continue-copy"><span className="pill pill-sage">{activeLesson.category}</span><h3>{activeLesson.title}</h3><p>{activeLesson.description}</p><div className="mini-progress"><span><i style={{width: completed.includes(activeLesson.id) ? "100%" : "35%"}}/></span><small>{completed.includes(activeLesson.id) ? "Completed" : "In progress"}</small></div><button className="button-primary button-small" onClick={() => goTo("learn")}>Open lesson <ArrowRight size={14}/></button></div></div>
            </div>
            <div className="panel weekly-panel"><div className="panel-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h2>Learning progress</h2></div><button className="icon-button subtle" onClick={() => goTo("progress")} aria-label="View progress"><ArrowUpRight size={17}/></button></div><div className="progress-ring-wrap"><ProgressRing progress={progress}/><div><strong>{progress}%</strong><span>lesson path explored</span></div></div><div className="progress-list"><div><span className="progress-dot sage-dot"/>Lessons completed <strong>{completed.length}</strong></div><div><span className="progress-dot clay-dot"/>Quizzes attempted <strong>{quizScore ? 1 : 0}</strong></div><div><span className="progress-dot blue-dot"/>Practice sessions <strong>{practiceResult ? 1 : 0}</strong></div></div><button className="button-secondary full-width" onClick={() => goTo("progress")}>See my progress <ArrowRight size={15}/></button></div>
          </div>
          <div className="section-heading"><div><p className="eyebrow">MADE FOR YOUR NEXT STEP</p><h2>Explore and practice</h2></div><button className="text-link" onClick={() => goTo("learn")}>Browse library <ArrowRight size={15}/></button></div>
          <div className="feature-grid"><FeatureCard icon={<Hand size={20}/>} tone="sage" title="Learn a new sign" text="Clear references, helpful tips and a pace that feels right." action="Explore lessons" onClick={() => goTo("learn")}/><FeatureCard icon={<Video size={20}/>} tone="clay" title="Practice with confidence" text="Try a sign in the practice space and review demo feedback." action="Start practicing" onClick={() => goTo("practice")}/><FeatureCard icon={<MessageCircle size={20}/>} tone="butter" title="Ask Ovia" text="Get sample guidance and find the right lesson to explore." action="Ask a question" onClick={() => goTo("chatbot")}/></div>
        </section>}

        {page === "learn" && <section className="page-section">
          <div className="page-heading-row"><div><p className="eyebrow">THE ISL LIBRARY</p><h1>Learn at your own pace.</h1><p className="page-subtitle">Explore signs, revisit references and build your confidence one lesson at a time.</p></div><div className="heading-decoration"><BookOpen size={35}/></div></div>
          <div className="filter-row">{["All", "Alphabet", "Number", "Everyday"].map((item) => <button key={item} className={`filter-chip ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}<span className="result-count">{filteredLessons.length} lessons</span></div>
          {activeLesson && <div className="lesson-detail panel"><div className="lesson-detail-art"><SignIllustration label={activeLesson.label} color={activeLesson.color} large/></div><div className="lesson-detail-copy"><span className="pill pill-sage">{activeLesson.category} · Guided lesson</span><h2>{activeLesson.title}</h2><p>{activeLesson.description}</p><div className="instruction-box"><Lightbulb size={18}/><div><strong>Practice tip</strong><p>{activeLesson.tip}</p></div></div><div className="lesson-detail-actions"><button className="button-primary" onClick={() => markComplete(activeLesson.id)}>{completed.includes(activeLesson.id) ? <Check size={16}/> : <CheckCircle2 size={16}/>} {completed.includes(activeLesson.id) ? "Completed" : "Mark as complete"}</button><button className={`button-secondary ${saved.includes(activeLesson.id) ? "saved" : ""}`} onClick={() => setSaved((all) => all.includes(activeLesson.id) ? all.filter((id) => id !== activeLesson.id) : [...all, activeLesson.id])}><Bookmark size={16}/>{saved.includes(activeLesson.id) ? "Saved" : "Save lesson"}</button></div><p className="demo-note"><ShieldCheck size={14}/> Illustrative learning content. Verify signs with trusted ISL resources.</p></div></div>}
          <div className="section-heading compact-heading"><div><h2>Lesson library</h2><p>Choose a lesson to view its reference and instructions.</p></div></div>
          <div className="lesson-grid">{filteredLessons.map((lesson) => <button className={`lesson-card ${activeLesson.id === lesson.id ? "lesson-card-active" : ""}`} key={lesson.id} onClick={() => setActiveLesson(lesson)}><div className="lesson-card-top"><SignIllustration label={lesson.label} color={lesson.color}/><button className="save-mini" onClick={(e) => { e.stopPropagation(); setSaved((all) => all.includes(lesson.id) ? all.filter((id) => id !== lesson.id) : [...all, lesson.id]); }} aria-label="Save lesson"><Bookmark size={16} fill={saved.includes(lesson.id) ? "currentColor" : "none"}/></button></div><div className="lesson-card-copy"><span className="pill">{lesson.category}</span><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="lesson-card-footer">{completed.includes(lesson.id) ? <span className="completed-label"><CheckCircle2 size={14}/> Completed</span> : <span className="muted-small">5 min · Beginner</span>}<span className="round-arrow"><ArrowUpRight size={16}/></span></div></div></button>)}</div>
          {filteredLessons.length === 0 && <EmptyState title="No lessons found" text="Try another search or choose a different category." action="Clear filters" onClick={() => { setFilter("All"); setSearch(""); }}/>}
        </section>}

        {page === "practice" && <section className="page-section">
          <div className="page-heading-row"><div><p className="eyebrow">PRACTICE SPACE</p><h1>Practice makes progress.</h1><p className="page-subtitle">Get comfortable with a sign, then review your demo feedback.</p></div><div className="heading-decoration clay"><Video size={34}/></div></div>
          <div className="practice-layout"><div className="panel camera-panel"><div className="camera-topline"><span className="camera-status"><i/> {practiceStarted ? "Practice session active" : "Practice space ready"}</span><span className="pill">Demo mode</span></div><div className="camera-stage">{practiceStarted ? <><div className="camera-grid"/><div className="camera-placeholder-person"><div className="person-head"/><div className="person-body"/><Hand size={42} className="person-hand"/></div><div className="camera-corner corner-a"/><div className="camera-corner corner-b"/><div className="camera-corner corner-c"/><div className="camera-corner corner-d"/><span className="camera-stage-label"><span className="status-dot"/> Demo camera preview</span></> : <div className="camera-empty"><div className="camera-empty-icon"><Video size={31}/></div><h3>Your practice space</h3><p>In the full version, your webcam feed and sign recognition model will appear here.</p><span className="pill pill-clay"><LockKeyhole size={12}/> Camera integration not connected</span></div>}</div><div className="camera-controls"><button className="button-primary" onClick={() => { setPracticeStarted(!practiceStarted); setPracticeResult(false); }}>{practiceStarted ? <X size={16}/> : <Play size={16}/>} {practiceStarted ? "End session" : "Start practice"}</button><button className="button-secondary" onClick={() => { setPracticeStarted(false); setPracticeResult(false); notify("Practice space reset."); }}><RefreshCw size={15}/> Reset</button></div><p className="demo-note"><ShieldCheck size={14}/> This screen does not access your camera or perform real sign recognition.</p></div>
            <div className="practice-side"><div className="panel"><p className="eyebrow">TODAY'S PRACTICE</p><h2>Choose a sign</h2><p className="panel-subtitle">Select a reference to practice with.</p><div className="practice-sign-list">{lessons.slice(0, 4).map((lesson) => <button className={`practice-sign-option ${activeLesson.id === lesson.id ? "selected" : ""}`} key={lesson.id} onClick={() => setActiveLesson(lesson)}><SignIllustration label={lesson.label} color={lesson.color}/><span><strong>{lesson.title}</strong><small>{lesson.category}</small></span>{activeLesson.id === lesson.id && <CheckCircle2 size={17}/>}</button>)}</div><div className="practice-reference"><strong>Remember</strong><p>{activeLesson.tip}</p></div><button className="button-primary full-width" disabled={!practiceStarted} onClick={() => { setPracticeResult(true); setPracticeStarted(false); setCompleted((all) => all.includes(activeLesson.id) ? all : [...all, activeLesson.id]); notify("Demo feedback generated."); }}>Finish demo practice <ArrowRight size={15}/></button></div>
              {practiceResult && <div className="panel result-panel"><div className="result-heading"><CheckCircle2 size={20}/><strong>Practice summary</strong></div><div className="practice-score"><strong>86%</strong><span>Sample accuracy score</span></div><p>Nice effort! Review the reference once more, then try again.</p><span className="demo-note">Simulated result — no ML model was used.</span></div>}
            </div></div>
        </section>}

        {page === "quiz" && <section className="page-section quiz-page">
          <div className="page-heading-row"><div><p className="eyebrow">QUICK KNOWLEDGE CHECK</p><h1>A moment to reflect.</h1><p className="page-subtitle">A short demo quiz to reinforce good learning habits.</p></div><div className="heading-decoration butter"><ClipboardList size={35}/></div></div>
          {!quizStarted ? <div className="quiz-intro panel"><div className="quiz-intro-art"><div className="quiz-circle"><ClipboardList size={44}/></div><span className="quiz-star star-a">✳</span><span className="quiz-star star-b">✦</span></div><div className="quiz-intro-copy"><span className="pill pill-clay">BEGINNER · 4 QUESTIONS</span><h2>Ready for a little check-in?</h2><p>This sample quiz covers learning and practice basics. Take your time — it's about progress, not perfection.</p><div className="quiz-meta"><span><Clock3 size={16}/> About 2 minutes</span><span><Award size={16}/> Instant feedback</span></div><button className="button-primary" onClick={() => { setQuizStarted(true); setQuizIndex(0); setSelectedAnswer(null); setQuizScore(0); setQuizFinished(false); }}>Start quiz <ArrowRight size={16}/></button></div></div>
          : quizFinished ? <div className="panel quiz-result"><div className="quiz-result-icon"><Award size={38}/></div><p className="eyebrow">QUIZ COMPLETE</p><h2>You showed up. That counts.</h2><div className="final-score">{quizScore}<span> / {questions.length}</span></div><p>You answered {quizScore} out of {questions.length} questions correctly.</p><div className="result-message">{quizScore >= 3 ? "Lovely work! Keep revisiting lessons to strengthen what you know." : "Every attempt is a starting point. Review the lessons and give it another go."}</div><div className="quiz-result-actions"><button className="button-primary" onClick={() => { setQuizStarted(false); setQuizFinished(false); }}>Try again <RefreshCw size={15}/></button><button className="button-secondary" onClick={() => goTo("progress")}>View progress <ArrowRight size={15}/></button></div></div>
          : <div className="panel quiz-question-panel"><div className="quiz-progress-row"><span>QUESTION {quizIndex + 1} OF {questions.length}</span><span>{Math.round(((quizIndex + 1) / questions.length) * 100)}% complete</span></div><div className="quiz-progress-track"><i style={{width: `${((quizIndex + 1) / questions.length) * 100}%`}}/></div><h2>{questions[quizIndex].question}</h2><div className="answer-list">{questions[quizIndex].options.map((option, index) => <button key={option} className={`answer-option ${selectedAnswer === index ? "answer-selected" : ""} ${selectedAnswer !== null && index === questions[quizIndex].answer ? "answer-correct" : ""}`} disabled={selectedAnswer !== null} onClick={() => { setSelectedAnswer(index); if (index === questions[quizIndex].answer) setQuizScore((score) => score + 1); }}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{selectedAnswer !== null && index === questions[quizIndex].answer && <CheckCircle2 size={18}/>}</button>)}</div>{selectedAnswer !== null && <div className="answer-feedback"><Lightbulb size={17}/><p><strong>{selectedAnswer === questions[quizIndex].answer ? "That's right!" : "Good try!"}</strong> {questions[quizIndex].explanation}</p></div>}<div className="quiz-footer"><button className="button-secondary" onClick={() => { setQuizStarted(false); setSelectedAnswer(null); }}>Exit quiz</button><button className="button-primary" disabled={selectedAnswer === null} onClick={() => { if (quizIndex === questions.length - 1) { setQuizFinished(true); } else { setQuizIndex((i) => i + 1); setSelectedAnswer(null); } }}>{quizIndex === questions.length - 1 ? "See results" : "Next question"} <ArrowRight size={15}/></button></div></div>}
        </section>}

        {page === "progress" && <section className="page-section"><div className="page-heading-row"><div><p className="eyebrow">YOUR LEARNING JOURNEY</p><h1>Look how far you've come.</h1><p className="page-subtitle">A snapshot of your activity in this demo. Your progress is stored for this session.</p></div><div className="heading-decoration"><BarChart3 size={35}/></div></div><div className="stats-grid"><StatCard icon={<BookOpen size={19}/>} label="Lessons completed" value={`${completed.length}`} detail={`Out of ${lessons.length} demo lessons`} tone="sage"/><StatCard icon={<Award size={19}/>} label="Last quiz score" value={quizScore ? `${quizScore}/${questions.length}` : "Not yet"} detail="Knowledge check" tone="clay"/><StatCard icon={<Video size={19}/>} label="Practice sessions" value={practiceResult ? "1" : "0"} detail="Demo practice only" tone="butter"/><StatCard icon={<Target size={19}/>} label="Learning path" value={`${progress}%`} detail="Lessons explored" tone="blue"/></div><div className="content-grid progress-content-grid"><div className="panel"><div className="panel-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>Learning checklist</h2></div><span className="pill pill-sage">{completed.length} complete</span></div><div className="activity-list">{lessons.map((lesson) => <div className="activity-item" key={lesson.id}><SignIllustration label={lesson.label} color={lesson.color}/><div className="activity-copy"><strong>{lesson.title}</strong><span>{lesson.category} · Beginner</span></div>{completed.includes(lesson.id) ? <span className="completed-label"><CheckCircle2 size={15}/> Done</span> : <button className="text-link" onClick={() => chooseLesson(lesson)}>Start <ArrowRight size={14}/></button>}</div>)}</div></div><div className="panel improvement-panel"><p className="eyebrow">A GENTLE REMINDER</p><div className="improvement-icon"><Sparkles size={23}/></div><h2>Keep it small and steady.</h2><p>Short practice sessions can make learning feel more manageable. Revisit a sign you already know, then explore something new.</p><div className="improvement-tip"><CheckCircle2 size={17}/><span>Try one lesson, one practice, or one quiz today.</span></div><button className="button-primary full-width" onClick={() => goTo("learn")}>Continue learning <ArrowRight size={15}/></button></div></div></section>}

        {page === "chatbot" && <section className="page-section chatbot-page"><div className="page-heading-row"><div><p className="eyebrow">YOUR LEARNING COMPANION</p><h1>Curiosity looks good on you.</h1><p className="page-subtitle">Ask a question, find a lesson, or explore an idea.</p></div><div className="heading-decoration clay"><MessageCircle size={34}/></div></div><div className="chat-layout"><div className="panel chat-panel"><div className="chat-header"><div className="chat-bot-avatar"><Sparkles size={21}/></div><div><h2>Ask Ovia</h2><p><span className="status-dot"/> Demo assistant · Sample responses</p></div><button className="icon-button subtle" onClick={() => setChatMessages([{from:"bot",text:"Fresh start! What would you like to learn about today?"}])} aria-label="Clear chat"><RefreshCw size={16}/></button></div><div className="chat-messages">{chatMessages.map((message, i) => <div className={`chat-message ${message.from === "user" ? "chat-message-user" : ""}`} key={`${i}-${message.text.slice(0, 12)}`}>{message.from === "bot" && <div className="chat-message-avatar"><Sparkles size={14}/></div>}<div className="chat-bubble">{message.text}{message.sign && <div className="chat-reference"><SignIllustration label={message.sign} color="peach"/><span><strong>Related lesson</strong><small>Explore the Everyday category</small><button onClick={() => { const found = lessons.find((l) => l.id === message.sign); if (found) chooseLesson(found); else goTo("learn"); }}>Open lesson <ArrowRight size={13}/></button></span></div>}</div></div>)}</div><div className="suggested-prompts"><span>TRY ASKING</span>{["How do I start learning ISL?", "Help me practice a sign", "Where can I find number signs?"].map((prompt) => <button key={prompt} onClick={() => submitChat(prompt)}>{prompt} <ArrowUpRight size={13}/></button>)}</div><form className="chat-input-row" onSubmit={(e) => { e.preventDefault(); submitChat(); }}><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question about learning..." aria-label="Ask Ovia a question"/><button className="send-button" type="submit" disabled={!chatInput.trim()} aria-label="Send message"><Send size={17}/></button></form><p className="demo-note chat-demo-note"><ShieldCheck size={14}/> Demo assistant: responses are predefined. RAG and trusted knowledge-base retrieval are not connected.</p></div><div className="chat-aside"><div className="panel"><div className="aside-icon"><BookOpen size={20}/></div><h3>Learn alongside your questions</h3><p>For the most useful practice, pair a question with a lesson reference and instructions.</p><button className="button-secondary full-width" onClick={() => goTo("learn")}>Browse ISL lessons <ArrowRight size={15}/></button></div><div className="chat-safety-note"><ShieldCheck size={18}/><p><strong>Learning with care</strong><br/>Sample content is for interface demonstration. Use trusted ISL resources to verify signs and instructions.</p></div></div></div></section>}

        {page === "admin" && <section className="page-section"><div className="page-heading-row"><div><p className="eyebrow">OVIA ADMINISTRATION</p><h1>Good work starts here.</h1><p className="page-subtitle">A simple space to maintain learning content and review demo activity.</p></div><div className="heading-decoration"><ShieldCheck size={35}/></div></div><div className="admin-welcome panel"><div><span className="pill pill-sage">ADMIN WORKSPACE</span><h2>Keep learning resources thoughtful and up to date.</h2><p>Manage the lesson library, review learner progress, and keep your demo content organized.</p><button className="button-primary" onClick={() => goTo("content")}>Manage content <ArrowRight size={15}/></button></div><div className="admin-illustration"><div className="admin-circle"><GraduationCap size={44}/></div><span className="admin-float admin-float-one"><CheckCircle2 size={17}/> Content</span><span className="admin-float admin-float-two"><BarChart3 size={17}/> Progress</span></div></div><div className="stats-grid"><StatCard icon={<BookOpen size={19}/>} label="Learning resources" value={`${lessons.length}`} detail="Demo lesson items" tone="sage"/><StatCard icon={<Users size={19}/>} label="Demo learners" value="24" detail="Illustrative count" tone="clay"/><StatCard icon={<ClipboardList size={19}/>} label="Quiz templates" value="4" detail="Sample questions" tone="butter"/><StatCard icon={<Activity size={19}/>} label="Content status" value="Active" detail="Local demo mode" tone="blue"/></div><div className="admin-shortcuts"><button className="panel admin-shortcut" onClick={() => goTo("content")}><div className="shortcut-icon sage"><BookMarked size={21}/></div><span><strong>Manage learning content</strong><small>Add, edit or remove demo lessons.</small></span><ArrowRight size={18}/></button><button className="panel admin-shortcut" onClick={() => goTo("users")}><div className="shortcut-icon clay"><Users size={21}/></div><span><strong>Learners & reports</strong><small>Review progress and demo account status.</small></span><ArrowRight size={18}/></button></div><p className="demo-note"><ShieldCheck size={14}/> Admin actions affect only this frontend's local demo state. No real accounts or server data are modified.</p></section>}

        {page === "content" && <section className="page-section"><div className="page-heading-row"><div><p className="eyebrow">CONTENT STUDIO</p><h1>Make room for learning.</h1><p className="page-subtitle">Manage the sample lesson catalogue. Changes stay in this browser session.</p></div><button className="button-primary" onClick={() => startEdit()}><Plus size={16}/> Add lesson</button></div><div className="panel content-table-panel"><div className="table-toolbar"><div><h2>Lesson library</h2><p>{lessons.length} learning resources</p></div><label className="table-search"><Search size={15}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search content..."/></label></div><div className="table-scroll"><table><thead><tr><th>LESSON</th><th>CATEGORY</th><th>STATUS</th><th className="table-actions-heading">ACTIONS</th></tr></thead><tbody>{filteredLessons.map((lesson) => <tr key={lesson.id}><td><div className="table-lesson"><SignIllustration label={lesson.label} color={lesson.color}/><span><strong>{lesson.title}</strong><small>{lesson.description}</small></span></div></td><td><span className="pill">{lesson.category}</span></td><td><span className="table-status"><i/> Published</span></td><td><div className="table-actions"><button onClick={() => { setActiveLesson(lesson); goTo("learn"); }} aria-label={`View ${lesson.title}`}><Eye size={16}/></button><button onClick={() => startEdit(lesson)} aria-label={`Edit ${lesson.title}`}><Pencil size={16}/></button><button onClick={() => { setLessons((all) => all.filter((item) => item.id !== lesson.id)); setCompleted((all) => all.filter((id) => id !== lesson.id)); notify("Demo lesson removed."); }} aria-label={`Delete ${lesson.title}`}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>{filteredLessons.length === 0 && <EmptyState title="No matching content" text="Try changing your search." action="Clear search" onClick={() => setSearch("")}/>}</div></section>}

        {page === "users" && <section className="page-section"><div className="page-heading-row"><div><p className="eyebrow">LEARNER INSIGHTS</p><h1>Progress, with perspective.</h1><p className="page-subtitle">Review illustrative learner activity and demo account controls.</p></div><div className="heading-decoration"><Users size={35}/></div></div><div className="stats-grid"><StatCard icon={<Users size={19}/>} label="Learner accounts" value="24" detail="Illustrative sample data" tone="sage"/><StatCard icon={<Activity size={19}/>} label="Active this week" value="18" detail="Illustrative sample data" tone="clay"/><StatCard icon={<Award size={19}/>} label="Average quiz score" value="78%" detail="Illustrative sample data" tone="butter"/><StatCard icon={<BookOpen size={19}/>} label="Lessons completed" value="142" detail="Illustrative sample data" tone="blue"/></div><div className="panel content-table-panel"><div className="table-toolbar"><div><h2>Demo learner overview</h2><p>Sample rows — not real users</p></div><button className="button-secondary" onClick={() => notify("Demo report prepared in the interface only.")}><FileText size={15}/> Generate report</button></div><div className="table-scroll"><table><thead><tr><th>LEARNER</th><th>LESSONS</th><th>QUIZ SCORE</th><th>ACCOUNT</th><th>ACTION</th></tr></thead><tbody>{[{name:"Aarav Mehta",email:"aarav.demo@example.test",lessons:8,score:"82%"},{name:"Mira Shah",email:"mira.demo@example.test",lessons:12,score:"91%"},{name:"Sam Patel",email:"sam.demo@example.test",lessons:5,score:"68%"},{name:"Your demo profile",email:"disha.demo@example.test",lessons:completed.length,score:quizScore ? `${Math.round(quizScore / questions.length * 100)}%` : "—"}].map((user, i) => <tr key={user.email}><td><div className="table-lesson"><div className="avatar avatar-sage">{user.name.split(" ").map((n) => n[0]).join("").slice(0,2)}</div><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{user.lessons}</td><td><strong>{user.score}</strong></td><td><span className={`account-status ${i === 2 && !usersActive ? "inactive" : ""}`}>{i === 2 && !usersActive ? "Inactive" : "Active"}</span></td><td><button className="table-action-text" onClick={() => { setUsersActive(!usersActive); notify(usersActive ? "Demo account marked inactive." : "Demo account marked active."); }}>{i === 2 ? (usersActive ? "Deactivate" : "Activate") : "View"}</button></td></tr>)}</tbody></table></div></div><p className="demo-note"><ShieldCheck size={14}/> These are fictional examples for UI demonstration; no real user records are stored.</p></section>}
      </div>
      <footer className="app-footer"><span>© 2026 Ovia · One Voice, Inclusive Access</span><span><span className="footer-dot"/> Made for more accessible learning</span></footer>
    </main>

    {showLessonModal && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowLessonModal(false); }}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="lesson-modal-title"><div className="modal-heading"><div><p className="eyebrow">CONTENT STUDIO</p><h2 id="lesson-modal-title">{editingId ? "Edit lesson" : "Add a lesson"}</h2></div><button className="icon-button" onClick={() => setShowLessonModal(false)} aria-label="Close"><X size={19}/></button></div><label className="form-field"><span>Lesson title</span><input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="e.g. Letter D" autoFocus/></label><label className="form-field"><span>Category</span><select value={lessonCategory} onChange={(e) => setLessonCategory(e.target.value as Lesson["category"])}><option>Alphabet</option><option>Number</option><option>Everyday</option></select></label><p className="modal-help">This creates or updates a sample lesson in the current demo session. Connect the backend later to persist content.</p><div className="modal-actions"><button className="button-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button><button className="button-primary" onClick={saveLesson}>{editingId ? "Save changes" : "Add lesson"} <ArrowRight size={15}/></button></div></div></div>}
    {toast && <div className="toast-message"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function HeartIcon() { return <Award size={14}/>; }

function StatCard({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><div className="stat-detail"><span>{detail}</span><ArrowUpRight size={14}/></div></div>;
}
function FeatureCard({ icon, tone, title, text, action, onClick }: { icon: React.ReactNode; tone: string; title: string; text: string; action: string; onClick: () => void }) {
  return <div className="feature-card"><div className={`feature-icon ${tone}`}>{icon}</div><h3>{title}</h3><p>{text}</p><button className="text-link" onClick={onClick}>{action} <ArrowRight size={14}/></button></div>;
}
function ProgressRing({ progress }: { progress: number }) {
  return <div className="progress-ring" style={{ background: `conic-gradient(#6d8264 ${progress * 3.6}deg, #e9e9df 0deg)` }}><div className="progress-ring-inner"><BookOpen size={23}/></div></div>;
}
function EmptyState({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) {
  return <div className="empty-state"><div><CircleHelp size={25}/></div><h3>{title}</h3><p>{text}</p><button className="button-secondary" onClick={onClick}>{action}</button></div>;
}

export default App;
