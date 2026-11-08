"use client";

import { useEffect, useState } from "react";

export type UserType = "seller" | "student" | "freelancer";
export type WouldTry = "yes" | "maybe" | "no";

export interface Interview {
  id: string;
  date: string;
  personName: string;
  type: UserType;
  painPoints: string[];
  wouldTry: WouldTry;
  referralName: string;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = "hela_hop_interviews_v1";

const SCRIPT_QUESTIONS = [
  {
    num: 1,
    title: "Current payment methods",
    question: "How do you get paid by customers today?",
    context:
      "Walk me through the last time. (Till, Paybill, send-money to personal number, cash, bank transfer?)",
  },
  {
    num: 2,
    title: "Failure modes & frustrations",
    question: "What goes wrong?",
    context:
      "Wrong numbers, unpaid customers, fake M-PESA SMS screenshots, delays in delivery while waiting for confirmation?",
  },
  {
    num: 3,
    title: "Tracking & reconciliation",
    question: "How do you keep track of who paid?",
    context:
      "Show me if you can: notebook, WhatsApp chats, memory, Excel sheet, SMS search?",
  },
  {
    num: 4,
    title: "Monthly recurring bills",
    question: "Which bills do you pay monthly and how?",
    context:
      "Rent, Wi-Fi, electricity token, stock/suppliers, school fees. Ever paid the wrong Paybill or been late?",
  },
  {
    num: 5,
    title: "Existing workarounds",
    question: "What have you tried to fix this?",
    context:
      "What did it cost in money or time? (Bought a Till, hired an assistant, bought an app, gave up?)",
  },
  {
    num: 6,
    title: "Willingness to pay",
    question: "What would a fix be worth per month?",
    context:
      "Anchor against actual losses or time spent. Would you pay KES 250/mo, KES 500/mo, or free only?",
  },
  {
    num: 7,
    title: "Permission to follow up",
    question: "Can I show you an idea and come back for you to try it?",
    context:
      "Show wireframes/sketches now. If they lean in, ask: 'Who is one other seller/freelancer facing this?'",
  },
];

const INITIAL_SAMPLE_INTERVIEWS: Interview[] = [
  {
    id: "sample-1",
    date: new Date().toISOString().split("T")[0],
    personName: "Wanjiku (Instagram Boutique)",
    type: "seller",
    painPoints: [
      "Customers send forged M-PESA screenshots on WhatsApp",
      "Spends 45 mins every evening matching MPESA SMS to orders",
      "Lost KES 3,200 last month to a buyer who reversed payment",
    ],
    wouldTry: "yes",
    referralName: "Kevin - shoe seller at Imenti House (0712 *** 890)",
    notes:
      "Very excited about payment links with buyer reference. Willing to pay KES 300/mo if it stops fake SMS.",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "sample-2",
    date: new Date().toISOString().split("T")[0],
    personName: "Brian (Campus Freelancer)",
    type: "freelancer",
    painPoints: [
      "Clients take 2 weeks to pay after invoice sent",
      "Hates sending personal phone number to strangers",
      "No clean way to show itemized quote without Microsoft Word",
    ],
    wouldTry: "maybe",
    referralName: "Amina (Graphic designer, classmate)",
    notes: "Would use if free tier covers 5 invoices per month.",
    createdAt: Date.now() - 43200000,
  },
];

export default function UserInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [personName, setPersonName] = useState("");
  const [type, setType] = useState<UserType>("seller");
  const [painPoint1, setPainPoint1] = useState("");
  const [painPoint2, setPainPoint2] = useState("");
  const [painPoint3, setPainPoint3] = useState("");
  const [wouldTry, setWouldTry] = useState<WouldTry>("yes");
  const [referralName, setReferralName] = useState("");
  const [notes, setNotes] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "script" | "history">("form");

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setInterviews(parsed);
          setIsLoaded(true);
          return;
        }
      }
      // If nothing stored, seed with realistic samples
      setInterviews(INITIAL_SAMPLE_INTERVIEWS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_INTERVIEWS));
    } catch {
      setInterviews(INITIAL_SAMPLE_INTERVIEWS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  const saveInterviews = (updated: Interview[]) => {
    setInterviews(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    const cleanedPains = [painPoint1, painPoint2, painPoint3]
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const newInterview: Interview = {
      id: "interview-" + Date.now(),
      date: date || new Date().toISOString().split("T")[0],
      personName: personName.trim(),
      type,
      painPoints: cleanedPains.length > 0 ? cleanedPains : ["No specific pain recorded"],
      wouldTry,
      referralName: referralName.trim(),
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };

    const updated = [newInterview, ...interviews];
    saveInterviews(updated);

    // Reset Form
    setPersonName("");
    setPainPoint1("");
    setPainPoint2("");
    setPainPoint3("");
    setReferralName("");
    setNotes("");
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3500);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this interview record?")) {
      const updated = interviews.filter((item) => item.id !== id);
      saveInterviews(updated);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset back to sample interviews? Current additions will be removed.")) {
      saveInterviews(INITIAL_SAMPLE_INTERVIEWS);
    }
  };

  const handleExportCSV = () => {
    if (interviews.length === 0) return;
    const headers = [
      "Date",
      "Person Name",
      "Type",
      "Pain Point 1",
      "Pain Point 2",
      "Pain Point 3",
      "Would Try",
      "Referral Name",
      "Notes",
    ];

    const rows = interviews.map((item) => {
      const p1 = item.painPoints[0] || "";
      const p2 = item.painPoints[1] || "";
      const p3 = item.painPoints[2] || "";
      return [
        `"${item.date}"`,
        `"${item.personName.replace(/"/g, '""')}"`,
        `"${item.type}"`,
        `"${p1.replace(/"/g, '""')}"`,
        `"${p2.replace(/"/g, '""')}"`,
        `"${p3.replace(/"/g, '""')}"`,
        `"${item.wouldTry}"`,
        `"${(item.referralName || "").replace(/"/g, '""')}"`,
        `"${(item.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hela-hop-interviews-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Summary
  const totalCount = interviews.length;
  const sellerCount = interviews.filter((i) => i.type === "seller").length;
  const studentCount = interviews.filter((i) => i.type === "student").length;
  const freelancerCount = interviews.filter((i) => i.type === "freelancer").length;

  const tryYesCount = interviews.filter((i) => i.wouldTry === "yes").length;
  const tryMaybeCount = interviews.filter((i) => i.wouldTry === "maybe").length;
  const tryNoCount = interviews.filter((i) => i.wouldTry === "no").length;

  // Pain points aggregation: calculate most frequent pains / keywords
  const allPains = interviews.flatMap((i) => i.painPoints);
  const painFrequencyMap: Record<string, number> = {};
  allPains.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) return;
    painFrequencyMap[trimmed] = (painFrequencyMap[trimmed] || 0) + 1;
  });

  const sortedPains = Object.entries(painFrequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Target for Phase 0 Gate G0 is 10 interviews
  const targetInterviews = 10;
  const progressPct = Math.min(100, Math.round((totalCount / targetInterviews) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Admin Banner */}
      <header className="border-b border-emerald-200 bg-emerald-950 text-emerald-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-xs font-black text-emerald-950">
              H
            </span>
            <span className="font-bold tracking-tight text-white">Hela Hop</span>
            <span className="rounded bg-emerald-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
              Internal Admin
            </span>
          </div>
          <div className="text-right text-xs text-emerald-300">
            Phase 0 · Discovery Tracking
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Title & Goal Progress */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              User Interview Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              7-question discovery interviews for Kenyan informal sellers, students & freelancers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleResetData}
              type="button"
              title="Reset sample data"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS SECTION */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total & Gate G0 Goal */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Interviews Logged
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                Gate G0: {targetInterviews}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs text-slate-500">/ {targetInterviews} target</span>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {totalCount >= targetInterviews
                  ? "Gate G0 interview target reached! 🎉"
                  : `${targetInterviews - totalCount} more needed for Phase 0 review`}
              </p>
            </div>
          </div>

          {/* Card 2: Count by User Type */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Breakdown by Segment
            </span>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Sellers (Shop/IG)
                </span>
                <span className="font-bold text-slate-900">{sellerCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Students / Youth
                </span>
                <span className="font-bold text-slate-900">{studentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  Freelancers / Pros
                </span>
                <span className="font-bold text-slate-900">{freelancerCount}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Validation Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Would Try Hela Hop?
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {totalCount > 0 ? Math.round(((tryYesCount + tryMaybeCount) / totalCount) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-500">receptive</span>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                Yes: {tryYesCount}
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                Maybe: {tryMaybeCount}
              </span>
              <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 font-semibold text-rose-700">
                No: {tryNoCount}
              </span>
            </div>
          </div>

          {/* Card 4: Top Pains Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Top Mentioned Pains
            </span>
            <div className="mt-2 flex flex-wrap gap-1">
              {sortedPains.length > 0 ? (
                sortedPains.slice(0, 3).map(([pain, count], idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                    title={pain}
                  >
                    <span className="max-w-[120px] truncate">{pain}</span>
                    <span className="rounded-full bg-slate-300 px-1 text-[9px] font-bold text-slate-800">
                      {count}
                    </span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No pain points logged yet</span>
              )}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {allPains.length} total pain points recorded
            </p>
          </div>
        </section>

        {/* MOBILE VIEW TABS TOGGLE */}
        <div className="mb-6 flex border-b border-slate-200 md:hidden">
          <button
            onClick={() => setActiveTab("form")}
            className={`min-h-[44px] flex-1 border-b-2 py-2 text-xs font-bold transition ${
              activeTab === "form"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
          >
            Log Interview
          </button>
          <button
            onClick={() => setActiveTab("script")}
            className={`min-h-[44px] flex-1 border-b-2 py-2 text-xs font-bold transition ${
              activeTab === "script"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
          >
            7 Questions Script
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`min-h-[44px] flex-1 border-b-2 py-2 text-xs font-bold transition ${
              activeTab === "history"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500"
            }`}
          >
            Logs ({interviews.length})
          </button>
        </div>

        {/* MAIN 2-COLUMN DESKTOP / TABBED MOBILE LAYOUT */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* LEFT COLUMN: INTERVIEW SCRIPT (5 cols on lg) */}
          <div
            className={`space-y-6 md:col-span-5 ${
              activeTab === "script" ? "block" : "hidden md:block"
            }`}
          >
            {/* Hardcoded 7-question Script */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Master Plan Interview Script
                  </h2>
                  <p className="text-xs text-slate-500">
                    Section 11.2 · 15 minutes · Listen more than you talk
                  </p>
                </div>
                <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700">
                  7 Questions
                </span>
              </div>

              {/* Rules banner */}
              <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-semibold">⚠️ Interview Rules:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-amber-800">
                  <li>Don&apos;t pitch the solution until Question 7.</li>
                  <li>Write down their exact words, not paraphrased tech terms.</li>
                  <li>Ask for 1 referral name/contact before leaving.</li>
                </ul>
              </div>

              {/* The 7 questions */}
              <div className="space-y-3.5">
                {SCRIPT_QUESTIONS.map((item) => (
                  <div
                    key={item.num}
                    className="group rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                        {item.num}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                          {item.question}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-600">
                          {item.context}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggregated Top Pain Points List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Recurring Pain Points ({sortedPains.length})
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Derived directly from user logs to inform product decisions.
              </p>

              <div className="mt-4 divide-y divide-slate-100">
                {sortedPains.length > 0 ? (
                  sortedPains.map(([pain, count], i) => (
                    <div key={i} className="flex items-center justify-between py-2 text-xs">
                      <span className="pr-3 text-slate-700">{pain}</span>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                        {count} {count === 1 ? "mention" : "mentions"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-xs text-slate-400">No pain points logged yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LOGGING FORM & RECENT ENTRIES (7 cols on lg) */}
          <div
            className={`space-y-6 md:col-span-7 ${
              activeTab === "form" || activeTab === "history" ? "block" : "hidden md:block"
            }`}
          >
            {/* LOG FORM */}
            <div
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${
                activeTab === "history" ? "hidden md:block" : "block"
              }`}
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Log An Interview</h2>
                  <p className="text-xs text-slate-500">
                    Stores directly to localStorage (no cloud setup needed yet).
                  </p>
                </div>
                {formSuccess && (
                  <span className="animate-fade-in inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                    ✓ Saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Date & Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Interview Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Person Name / Business <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mary (Shoe vendor, Nairobi)"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      required
                      className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Person Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    User Segment <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "seller", label: "Seller", hint: "IG / WhatsApp shop" },
                        { id: "student", label: "Student", hint: "Campus / young user" },
                        { id: "freelancer", label: "Freelancer", hint: "Dev / designer / tutor" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-2 text-center transition ${
                          type === t.id
                            ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xs">{t.label}</span>
                        <span className="hidden text-[10px] text-slate-400 sm:inline">
                          {t.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top 3 Pain Points */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Top 3 Pain Points (their exact words)
                  </label>
                  <p className="mb-2 text-[11px] text-slate-500">
                    What frustrates them most about getting paid or tracking money?
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="1. e.g. Fake M-PESA confirmation SMS from buyers"
                      value={painPoint1}
                      onChange={(e) => setPainPoint1(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="2. e.g. Manually checking bank / till statements after hours"
                      value={painPoint2}
                      onChange={(e) => setPainPoint2(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="3. e.g. Customers mistyping Till numbers and sending to wrong person"
                      value={painPoint3}
                      onChange={(e) => setPainPoint3(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Would they try it? */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Would they try Hela Hop? (Question 7 response){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {(
                      [
                        {
                          val: "yes",
                          label: "Yes",
                          activeBg: "border-emerald-500 bg-emerald-50 text-emerald-800",
                        },
                        {
                          val: "maybe",
                          label: "Maybe",
                          activeBg: "border-amber-500 bg-amber-50 text-amber-800",
                        },
                        {
                          val: "no",
                          label: "No",
                          activeBg: "border-rose-500 bg-rose-50 text-rose-800",
                        },
                      ] as const
                    ).map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setWouldTry(btn.val)}
                        className={`flex min-h-[44px] items-center justify-center rounded-lg border p-2 text-xs font-bold transition ${
                          wouldTry === btn.val
                            ? btn.activeBg
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Referral Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Referral Name & Contact
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Kamau (0722 *** 123) - sells jackets"
                    value={referralName}
                    onChange={(e) => setReferralName(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Extra Quotes & Follow-up Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Willing to test beta next week, requested WhatsApp invoice format..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-500 active:scale-[0.99]"
                >
                  Save Interview Log
                </button>
              </form>
            </div>

            {/* LOGGED INTERVIEWS LIST */}
            <div
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${
                activeTab === "form" ? "hidden md:block" : "block"
              }`}
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Logged Interviews ({interviews.length})
                </h3>
                <span className="text-xs text-slate-500">Stored locally in browser</span>
              </div>

              {!isLoaded ? (
                <p className="py-4 text-center text-xs text-slate-400">Loading records...</p>
              ) : interviews.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-slate-600">No interviews logged yet.</p>
                  <p className="text-xs text-slate-400">
                    Fill the form above to add your first discovery interview.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-white hover:shadow-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {item.personName}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                item.type === "seller"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.type === "student"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{item.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              item.wouldTry === "yes"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.wouldTry === "maybe"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            Would try: {item.wouldTry}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                            title="Delete entry"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Pain Points */}
                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Key Pains:
                        </span>
                        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-slate-700">
                          {item.painPoints.map((pain, pIdx) => (
                            <li key={pIdx}>{pain}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Referral & Notes */}
                      {(item.referralName || item.notes) && (
                        <div className="mt-3 border-t border-slate-200/60 pt-2 text-xs">
                          {item.referralName && (
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">Referral:</span>{" "}
                              {item.referralName}
                            </p>
                          )}
                          {item.notes && (
                            <p className="mt-1 italic text-slate-500">
                              &ldquo;{item.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
