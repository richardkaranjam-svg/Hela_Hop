"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { escapeCsvCell } from "@/lib/csv";
import type {
  InterviewCurrentTool,
  InterviewPriceReaction,
  InterviewRecord,
  InterviewSegment,
  InterviewWouldTry,
} from "@/types/database";

import {
  createInterviewAction,
  deleteInterviewAction,
  importLegacyInterviewsAction,
} from "./actions";

/** Key used by the old localStorage-only tracker. */
const LEGACY_STORAGE_KEY = "hela_hop_interviews_v1";

// Targets from the Master Plan (Gate G0, H1, H11, H13).
const TARGETS = {
  gateG0: 10,
  sellers: 20,
  sellersPainPass: 12,
  suppliers: 10,
  suppliersPainPass: 6,
  suppliersManualPass: 4,
  foundingPass: 3,
};

const MANUAL_TOOLS: InterviewCurrentTool[] = ["notebook", "excel", "whatsapp", "memory"];

const SEGMENTS: { id: InterviewSegment; label: string; hint: string }[] = [
  { id: "seller", label: "Seller", hint: "Mama mboga, IG, stall" },
  { id: "supplier", label: "Supplier", hint: "Sells to businesses" },
  { id: "student", label: "Student", hint: "Campus / young" },
  { id: "freelancer", label: "Freelancer", hint: "Dev / designer" },
];

const TOOL_LABELS: Record<InterviewCurrentTool, string> = {
  notebook: "Notebook",
  excel: "Excel / Sheets",
  whatsapp: "WhatsApp chats",
  memory: "Memory / M-PESA SMS",
  accounting_software: "Accounting software",
  other: "Other",
  none: "Nothing",
};

const PRICE_LABELS: Record<InterviewPriceReaction, string> = {
  founding_yes: "Signed up (founding offer)",
  would_pay: "Says they would pay",
  too_expensive: "Too expensive",
  free_only: "Only if free",
  unsure: "Unsure",
};

// ---------------------------------------------------------------------------
// Scripts (Master Plan 11.2, v1.5)
// ---------------------------------------------------------------------------

type ScriptQuestion = { q: string; hint: string };

const SELLER_SCRIPT: ScriptQuestion[] = [
  {
    q: "Tell me how you get paid by customers today. Walk me through the last time.",
    hint: "Till, Paybill, Pochi, send money, cash? Let them tell the story.",
  },
  {
    q: "What goes wrong?",
    hint: "Wrong numbers, unpaid customers, fake M-PESA messages. Tick 'unprompted' only if they raise the who-paid pain before you do.",
  },
  {
    q: "How do you keep track of who paid? Show me if you can.",
    hint: "Ask to see the notebook, WhatsApp chat or SMS search. Seeing it beats any answer.",
  },
  {
    q: "Which bills do you pay every month? How?",
    hint: "Ever paid the wrong Paybill or been late?",
  },
  {
    q: "What have you tried to fix this? What did it cost?",
    hint: "Money or time. A Till, an assistant, an app, gave up?",
  },
  {
    q: "Would a weekly message like 'Brian owes you KES 1,500, here is a reminder' help, or annoy you?",
    hint: "Assistant test (H12). Ask if they would ask the app questions in Swahili or English.",
  },
  {
    q: "Can I show you a rough idea? (show the wireframes)",
    hint: "Then price: 'Pro is KES 200 a month, or KES 50 a week by M-PESA. First month free. Would you try it?' Ask for one referral, and ask who supplies them.",
  },
];

const SUPPLIER_SCRIPT: ScriptQuestion[] = [
  {
    q: "Tell me about your business. What do you sell, who buys, and how many orders a month?",
    hint: "Note orders per month and the kind of customers (shops, hotels, schools, contractors).",
  },
  {
    q: "How many of your customers buy on credit? On what terms?",
    hint: "7, 30, 60 days? Do they have credit limits?",
  },
  {
    q: "Walk me through the last time a customer paid late. What did you do?",
    hint: "Tick 'unprompted' if they describe the debt-chasing pain before you mention it (H11).",
  },
  {
    q: "How do you know who owes you, and how much, right now? Show me.",
    hint: "Notebook, Excel, WhatsApp, accounting software, memory?",
  },
  {
    q: "How do you send invoices and statements? How many customers ask for an eTIMS invoice?",
    hint: "How do they issue eTIMS today (eTIMS Lite, USSD, accountant, software)?",
  },
  {
    q: "What have you tried to fix this? What does it cost you?",
    hint: "Software subscriptions, a clerk, an accountant, lost money from bad debts.",
  },
  {
    q: "If an assistant told you every morning who to chase and drafted the message, would you use it? Who else would need to log in?",
    hint: "Show the wireframes now. Note staff roles (accountant, sales).",
  },
  {
    q: "I'm taking 20 founding businesses at KES 999 a month, fixed for a year (normal price KES 1,500). Can I put you down?",
    hint: "Record the real reaction, not politeness. Then ask for one referral to another supplier.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Tab = "form" | "script" | "history";

const today = () => new Date().toISOString().split("T")[0];

const inputClass =
  "mt-1 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
const labelClass = "block text-xs font-semibold text-slate-700";

function TriState({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const options: { v: boolean | null; text: string }[] = [
    { v: true, text: "Yes" },
    { v: false, text: "No" },
    { v: null, text: "Not asked" },
  ];
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.text}
            type="button"
            onClick={() => onChange(o.v)}
            className={`min-h-[44px] rounded-lg border text-xs transition ${
              value === o.v
                ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-900"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  target,
  note,
}: {
  label: string;
  value: number;
  target: number;
  note: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, target)) * 100));
  const passed = value >= target;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`font-bold ${passed ? "text-emerald-700" : "text-slate-900"}`}>
          {value} / {target}
          {passed ? " ✓" : ""}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-amber-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{note}</p>
    </div>
  );
}

export default function InterviewsClient({
  initialInterviews,
}: {
  initialInterviews: InterviewRecord[];
}) {
  const [interviews, setInterviews] = useState<InterviewRecord[]>(initialInterviews);
  const [activeTab, setActiveTab] = useState<Tab>("form");
  const [scriptSegment, setScriptSegment] = useState<"seller" | "supplier">("seller");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Old localStorage interviews waiting to be moved into the database.
  const [legacy, setLegacy] = useState<unknown[] | null>(null);

  // Form state
  const [date, setDate] = useState(today);
  const [personName, setPersonName] = useState("");
  const [segment, setSegment] = useState<InterviewSegment>("seller");
  const [businessType, setBusinessType] = useState("");
  const [painUnprompted, setPainUnprompted] = useState(false);
  const [pains, setPains] = useState(["", "", ""]);
  const [exactQuote, setExactQuote] = useState("");
  const [currentTool, setCurrentTool] = useState<InterviewCurrentTool | null>(null);
  const [monthlyOrders, setMonthlyOrders] = useState("");
  const [creditCustomers, setCreditCustomers] = useState<boolean | null>(null);
  const [askedForEtims, setAskedForEtims] = useState<boolean | null>(null);
  const [priceReaction, setPriceReaction] = useState<InterviewPriceReaction | null>(null);
  const [wouldTry, setWouldTry] = useState<InterviewWouldTry>("yes");
  const [referral, setReferral] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) return;
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      // Skip the two fake sample records the old tracker seeded.
      const real = parsed.filter(
        (r) =>
          typeof r === "object" &&
          r !== null &&
          !String((r as { id?: unknown }).id ?? "").startsWith("sample-")
      );
      if (real.length > 0) setLegacy(real);
      else localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Unreadable old data: leave it alone.
    }
  }, []);

  const flash = (kind: "ok" | "error", text: string) => {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const resetForm = () => {
    setPersonName("");
    setBusinessType("");
    setPainUnprompted(false);
    setPains(["", "", ""]);
    setExactQuote("");
    setCurrentTool(null);
    setMonthlyOrders("");
    setCreditCustomers(null);
    setAskedForEtims(null);
    setPriceReaction(null);
    setWouldTry("yes");
    setReferral("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;
    const isSupplier = segment === "supplier";
    const orders = monthlyOrders.trim() === "" ? null : Number(monthlyOrders);

    startTransition(async () => {
      const res = await createInterviewAction({
        interview_date: date || today(),
        person_name: personName,
        segment,
        business_type: businessType,
        pain_unprompted: painUnprompted,
        pain_points: pains,
        exact_quote: exactQuote,
        current_tool: currentTool,
        monthly_orders: orders !== null && Number.isFinite(orders) ? Math.round(orders) : null,
        credit_customers: isSupplier ? creditCustomers : null,
        asked_for_etims: isSupplier ? askedForEtims : null,
        price_reaction: priceReaction,
        would_try: wouldTry,
        referral,
        notes,
      });
      if (!res.ok) {
        flash("error", res.error);
        return;
      }
      setInterviews((list) => [res.data, ...list]);
      resetForm();
      flash("ok", "Saved.");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this interview record?")) return;
    startTransition(async () => {
      const res = await deleteInterviewAction(id);
      if (!res.ok) {
        flash("error", res.error);
        return;
      }
      setInterviews((list) => list.filter((i) => i.id !== id));
    });
  };

  const handleImportLegacy = () => {
    if (!legacy) return;
    startTransition(async () => {
      const res = await importLegacyInterviewsAction(legacy);
      if (!res.ok) {
        flash("error", res.error);
        return;
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLegacy(null);
      setInterviews((list) =>
        [...res.data, ...list].sort((a, b) =>
          b.interview_date.localeCompare(a.interview_date)
        )
      );
      flash("ok", `Moved ${res.data.length} interview(s) into the database.`);
    });
  };

  const handleExportCSV = () => {
    if (interviews.length === 0) return;
    const headers = [
      "Date",
      "Person",
      "Segment",
      "Business type",
      "Pain unprompted",
      "Pain 1",
      "Pain 2",
      "Pain 3",
      "Exact quote",
      "Current tool",
      "Orders per month",
      "Credit customers",
      "Asked for eTIMS",
      "Price reaction",
      "Would try",
      "Referral",
      "Notes",
    ];
    const yesNo = (v: boolean | null) => (v === null ? "" : v ? "yes" : "no");
    const rows = interviews.map((i) =>
      [
        i.interview_date,
        i.person_name,
        i.segment,
        i.business_type,
        yesNo(i.pain_unprompted),
        i.pain_points[0],
        i.pain_points[1],
        i.pain_points[2],
        i.exact_quote,
        i.current_tool,
        i.monthly_orders,
        yesNo(i.credit_customers),
        yesNo(i.asked_for_etims),
        i.price_reaction,
        i.would_try,
        i.referral,
        i.notes,
      ]
        .map((v) => escapeCsvCell(v))
        .join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hela-hop-interviews-${today()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------------------
  // Summary numbers
  // -------------------------------------------------------------------------
  const stats = useMemo(() => {
    const sellers = interviews.filter((i) => i.segment === "seller");
    const suppliers = interviews.filter((i) => i.segment === "supplier");
    const painCounts: Record<string, number> = {};
    for (const p of interviews.flatMap((i) => i.pain_points)) {
      const key = p.trim();
      if (key) painCounts[key] = (painCounts[key] ?? 0) + 1;
    }
    return {
      total: interviews.length,
      bySegment: Object.fromEntries(
        SEGMENTS.map((s) => [s.id, interviews.filter((i) => i.segment === s.id).length])
      ) as Record<InterviewSegment, number>,
      sellersPain: sellers.filter((i) => i.pain_unprompted).length,
      sellersPaying: sellers.filter(
        (i) => i.price_reaction === "founding_yes" || i.price_reaction === "would_pay"
      ).length,
      suppliersPain: suppliers.filter((i) => i.pain_unprompted).length,
      suppliersManual: suppliers.filter(
        (i) => i.current_tool !== null && MANUAL_TOOLS.includes(i.current_tool)
      ).length,
      suppliersFounding: suppliers.filter((i) => i.price_reaction === "founding_yes").length,
      suppliersEtims: suppliers.filter((i) => i.asked_for_etims).length,
      wouldTryYes: interviews.filter((i) => i.would_try === "yes").length,
      wouldTryMaybe: interviews.filter((i) => i.would_try === "maybe").length,
      topPains: Object.entries(painCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    };
  }, [interviews]);

  const script = scriptSegment === "seller" ? SELLER_SCRIPT : SUPPLIER_SCRIPT;
  const tabButton = (id: Tab, text: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`min-h-[44px] flex-1 border-b-2 py-2 text-xs font-bold transition ${
        activeTab === id ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
          <div className="text-right text-xs text-emerald-300">Discovery interviews</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              User Interview Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Everyday sellers (Free / Pro) and suppliers selling to businesses (Business plan).
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            type="button"
            disabled={interviews.length === 0}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        {message && (
          <div
            role="status"
            className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
              message.kind === "ok" ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
            }`}
          >
            {message.text}
          </div>
        )}

        {legacy && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong>{legacy.length}</strong> interview(s) are saved only on this browser from
              the old tracker. Move them into the database so they are not lost.
            </p>
            <button
              type="button"
              onClick={handleImportLegacy}
              disabled={isPending}
              className="min-h-[44px] shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              Move them now
            </button>
          </div>
        )}

        {/* SUMMARY */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Interviews logged
            </span>
            <div className="mt-2 text-3xl font-black">{stats.total}</div>
            <div className="mt-3 space-y-3">
              <Meter
                label="Gate G0"
                value={stats.total}
                target={TARGETS.gateG0}
                note="At least 10 logged interviews"
              />
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Students {stats.bySegment.student} · Freelancers {stats.bySegment.freelancer}
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Everyday sellers (H1)
            </span>
            <Meter
              label="Interviewed"
              value={stats.bySegment.seller}
              target={TARGETS.sellers}
              note="Target 20 sellers"
            />
            <Meter
              label="Pain raised unprompted"
              value={stats.sellersPain}
              target={TARGETS.sellersPainPass}
              note="H1 passes at 12 of 20"
            />
            <p className="text-[11px] text-slate-500">
              Would pay for Pro: <strong>{stats.sellersPaying}</strong>
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Suppliers (H11)
            </span>
            <Meter
              label="Interviewed"
              value={stats.bySegment.supplier}
              target={TARGETS.suppliers}
              note="Target 10 suppliers"
            />
            <Meter
              label="Debt pain unprompted"
              value={stats.suppliersPain}
              target={TARGETS.suppliersPainPass}
              note="H11 passes at 6 of 10"
            />
            <Meter
              label="Track debts by hand"
              value={stats.suppliersManual}
              target={TARGETS.suppliersManualPass}
              note="Notebook, Excel, WhatsApp or memory; pass at 4"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Business plan (H13)
            </span>
            <Meter
              label="Founding sign-ups"
              value={stats.suppliersFounding}
              target={TARGETS.foundingPass}
              note="H13 passes at 3 businesses"
            />
            <p className="text-[11px] text-slate-500">
              Asked for eTIMS: <strong>{stats.suppliersEtims}</strong> of{" "}
              {stats.bySegment.supplier} suppliers
            </p>
            <p className="text-[11px] text-slate-500">
              Would try (all): <strong>{stats.wouldTryYes}</strong> yes ·{" "}
              <strong>{stats.wouldTryMaybe}</strong> maybe
            </p>
          </div>
        </section>

        {/* MOBILE TABS */}
        <div className="mb-6 flex border-b border-slate-200 md:hidden">
          {tabButton("form", "Log interview")}
          {tabButton("script", "Script")}
          {tabButton("history", `Logs (${interviews.length})`)}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* LEFT: SCRIPT */}
          <div
            className={`space-y-6 md:col-span-5 ${activeTab === "script" ? "block" : "hidden md:block"}`}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 grid grid-cols-2 gap-2">
                {(["seller", "supplier"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScriptSegment(s)}
                    className={`min-h-[44px] rounded-lg border text-xs font-bold ${
                      scriptSegment === s
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {s === "seller" ? "Everyday seller script" : "Supplier (B2B) script"}
                  </button>
                ))}
              </div>

              <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
                <p className="font-semibold">Opening line</p>
                <p className="mt-1">
                  &ldquo;Habari! Naitwa [jina]. Ninajenga app ya kusaidia wafanyabiashara kujua
                  nani amelipa na nani bado anadaiwa. Sikuuzii chochote leo, nataka tu kujifunza
                  kutoka kwako. Una dakika kumi?&rdquo;
                </p>
                <p className="mt-1 text-emerald-800">
                  (&ldquo;I&apos;m building an app that helps businesses know who has paid and
                  who still owes. I&apos;m not selling anything today, I just want to learn from
                  you. Do you have 10 minutes?&rdquo;)
                </p>
              </div>

              <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-semibold">Rules</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li>No pitching until the wireframes question.</li>
                  <li>Ask about the last real time, not &ldquo;usually&rdquo;.</li>
                  <li>Write down their exact words.</li>
                  <li>Ask for one referral before leaving. Log it the same day.</li>
                </ul>
              </div>

              <ol className="space-y-3">
                {script.map((item, idx) => (
                  <li
                    key={item.q}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">{item.q}</p>
                        <p className="text-xs leading-relaxed text-slate-600">{item.hint}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Recurring pain points
              </h3>
              <div className="mt-3 divide-y divide-slate-100">
                {stats.topPains.length > 0 ? (
                  stats.topPains.map(([pain, count]) => (
                    <div key={pain} className="flex items-center justify-between py-2 text-xs">
                      <span className="pr-3 text-slate-700">{pain}</span>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-xs text-slate-400">No pain points logged yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: FORM + HISTORY */}
          <div
            className={`space-y-6 md:col-span-7 ${
              activeTab === "script" ? "hidden md:block" : "block"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className={`space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${
                activeTab === "history" ? "hidden md:block" : "block"
              }`}
            >
              <h2 className="border-b border-slate-100 pb-3 text-lg font-bold">Log an interview</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Date <span className="text-rose-500">*</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  First name <span className="text-rose-500">*</span>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Mary"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </label>
              </div>

              <div>
                <span className={labelClass}>
                  Segment <span className="text-rose-500">*</span>
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SEGMENTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSegment(s.id)}
                      className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border p-2 text-center transition ${
                        segment === s.id
                          ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-900"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs">{s.label}</span>
                      <span className="text-[10px] text-slate-400">{s.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className={labelClass}>
                Business type
                <input
                  type="text"
                  maxLength={120}
                  placeholder={
                    segment === "supplier"
                      ? "e.g. Hardware supplier to contractors"
                      : "e.g. Vegetable stall, Gikomba"
                  }
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="flex min-h-[44px] items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm">
                <input
                  type="checkbox"
                  checked={painUnprompted}
                  onChange={(e) => setPainUnprompted(e.target.checked)}
                  className="h-5 w-5 accent-emerald-600"
                />
                <span>
                  Raised the &ldquo;who paid / who owes me&rdquo; pain <strong>before</strong> I
                  mentioned it
                </span>
              </label>

              <div>
                <span className={labelClass}>Top 3 pain points (their words)</span>
                <div className="space-y-2">
                  {pains.map((p, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={300}
                      placeholder={`${idx + 1}.`}
                      value={p}
                      onChange={(e) =>
                        setPains((list) => list.map((x, i) => (i === idx ? e.target.value : x)))
                      }
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>

              <label className={labelClass}>
                Best exact quote
                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Word for word, in their language"
                  value={exactQuote}
                  onChange={(e) => setExactQuote(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                How they track who paid / who owes today
                <select
                  value={currentTool ?? ""}
                  onChange={(e) =>
                    setCurrentTool((e.target.value || null) as InterviewCurrentTool | null)
                  }
                  className={inputClass}
                >
                  <option value="">Not asked</option>
                  {(Object.keys(TOOL_LABELS) as InterviewCurrentTool[]).map((t) => (
                    <option key={t} value={t}>
                      {TOOL_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>

              {segment === "supplier" && (
                <div className="space-y-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-800">
                    Supplier questions
                  </p>
                  <label className={labelClass}>
                    Orders per month (about)
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={1000000}
                      value={monthlyOrders}
                      onChange={(e) => setMonthlyOrders(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <TriState
                    label="Sells to customers on credit?"
                    value={creditCustomers}
                    onChange={setCreditCustomers}
                  />
                  <TriState
                    label="Customers ask for eTIMS invoices?"
                    value={askedForEtims}
                    onChange={setAskedForEtims}
                  />
                </div>
              )}

              <label className={labelClass}>
                Price reaction{" "}
                <span className="font-normal text-slate-500">
                  {segment === "supplier"
                    ? "(Business KES 1,500/month; founding KES 999 for a year)"
                    : "(Pro KES 200/month or KES 50/week)"}
                </span>
                <select
                  value={priceReaction ?? ""}
                  onChange={(e) =>
                    setPriceReaction((e.target.value || null) as InterviewPriceReaction | null)
                  }
                  className={inputClass}
                >
                  <option value="">Not asked</option>
                  {(Object.keys(PRICE_LABELS) as InterviewPriceReaction[]).map((p) => (
                    <option key={p} value={p}>
                      {PRICE_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className={labelClass}>Would they try Hela Hop?</span>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(["yes", "maybe", "no"] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWouldTry(w)}
                      className={`min-h-[44px] rounded-lg border text-xs capitalize ${
                        wouldTry === w
                          ? "border-emerald-600 bg-emerald-50 font-bold text-emerald-900"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <label className={labelClass}>
                Referral (name and where to find them)
                <input
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Kevin, shoe seller at Imenti House"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Notes
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                />
              </label>

              <button
                type="submit"
                disabled={isPending || !personName.trim()}
                className="min-h-[44px] w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save interview"}
              </button>
            </form>

            {/* HISTORY */}
            <div
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${
                activeTab === "form" ? "hidden md:block" : "block"
              }`}
            >
              <h2 className="mb-3 text-lg font-bold">Logged interviews ({interviews.length})</h2>
              {interviews.length === 0 ? (
                <p className="text-sm text-slate-500">No interviews yet. Go talk to someone!</p>
              ) : (
                <ul className="space-y-3">
                  {interviews.map((i) => (
                    <li key={i.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">
                            {i.person_name}
                            {i.business_type ? (
                              <span className="font-normal text-slate-500"> · {i.business_type}</span>
                            ) : null}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {i.interview_date} · {i.segment}
                            {i.monthly_orders !== null ? ` · ${i.monthly_orders} orders/month` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(i.id)}
                          disabled={isPending}
                          className="min-h-[44px] min-w-[44px] rounded-lg text-xs text-rose-600 hover:bg-rose-50"
                          aria-label={`Delete interview with ${i.person_name}`}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                        {i.pain_unprompted && (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                            Pain unprompted
                          </span>
                        )}
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-slate-700">
                          Would try: {i.would_try}
                        </span>
                        {i.current_tool && (
                          <span className="rounded bg-slate-200 px-2 py-0.5 text-slate-700">
                            {TOOL_LABELS[i.current_tool]}
                          </span>
                        )}
                        {i.price_reaction && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">
                            {PRICE_LABELS[i.price_reaction]}
                          </span>
                        )}
                        {i.credit_customers && (
                          <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-800">
                            Sells on credit
                          </span>
                        )}
                        {i.asked_for_etims && (
                          <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-800">
                            eTIMS asked
                          </span>
                        )}
                      </div>
                      {i.pain_points.length > 0 && (
                        <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
                          {i.pain_points.map((p) => (
                            <li key={p}>{p}</li>
                          ))}
                        </ul>
                      )}
                      {i.exact_quote && (
                        <p className="mt-2 border-l-2 border-emerald-400 pl-2 text-xs italic text-slate-700">
                          &ldquo;{i.exact_quote}&rdquo;
                        </p>
                      )}
                      {i.referral && (
                        <p className="mt-1 text-[11px] text-slate-500">Referral: {i.referral}</p>
                      )}
                      {i.notes && <p className="mt-1 text-xs text-slate-600">{i.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
