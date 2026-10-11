"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Language = "ar" | "en";

type Country = {
  slug: string;
  name: string;
  flag: string;
};

type Plan = {
  id: number;
  country_slug: string;
  data_gb: number;
  days: number;
  price: number;
  currency: string;
};

const countryNames: Record<string, string> = {
  morocco: "Morocco",
  spain: "Spain",
  france: "France",
  turkey: "Turkey",
  "united-states": "United States",
  "united-arab-emirates": "United Arab Emirates",
};

const countryAliases: Record<string, string> = {
  morocco: "المغرب morocco",
  spain: "إسبانيا اسبانيا spain",
  france: "فرنسا france",
  turkey: "تركيا turkey",
  "united-states": "الولايات المتحدة america united states usa",
  "united-arab-emirates": "الإمارات الامارات uae united arab emirates",
};

const translations = {
  ar: {
    nav: "استكشف الباقات",
    badge: "الإنترنت ديالك، فين ما مشيتي",
    title1: "سافر للعالم كامل،",
    title2: "وبقا ديما متاصل",
    intro: "قلب على باقات eSIM، قارن الأثمنة واختار الإنترنت المناسب لرحلتك.",
    search: "قلب على بلدك... مثال: المغرب، Spain",
    searchButton: "قلب دابا",
    features: "🌍 وجهات متعددة · 💳 مقارنة سهلة · 📱 اتصال رقمي",
    eyebrow: "اختار الوجهة",
    heading: "فين غادي تسافر؟",
    subtitle: "اكتشف الوجهات وقارن تفاصيل باقات الإنترنت.",
    countries: "بلدان",
    loading: "كنحمّلو الباقات...",
    error: "ما قدرناش نحمّلو الباقات. عاود حاول.",
    retry: "عاود المحاولة",
    demo: "باقة للمقارنة",
    duration: (days: number) => `صالحة لمدة ${days} أيام`,
    noPlan: "ما كايناش باقة مسجلة حاليا",
    data: "الإنترنت",
    price: "الثمن التوضيحي بالدولار (تقريبي)",
    details: "اكتشف الباقة ←",
    emptyTitle: "ما لقيناش هاد البلد",
    emptyText: "جرّب تكتب الاسم بالعربية أو بالإنجليزية.",
    showAll: "عرض جميع البلدان",
    promoTitle: "GlobeSIM كيبدا من هنا 🌍",
    promoText: "كنحضرو لإتاحة عروض eSIM الحقيقية. الأثمنة الحالية توضيحية فقط، والشراء والتفعيل ما زال غير متاحين.",
    compare: "قارن الباقات",
    footer: "GlobeSIM · منصة لاكتشاف باقات الإنترنت أثناء السفر",
    language: "English",
  },
  en: {
    nav: "Explore plans",
    badge: "Your internet, wherever you go",
    title1: "Travel the world,",
    title2: "stay connected",
    intro: "Find eSIM plans, compare prices, and choose the data plan for your trip.",
    search: "Search for a country... e.g. Morocco, Spain",
    searchButton: "Search",
    features: "🌍 Multiple destinations · 💳 Easy comparison · 📱 Digital connectivity",
    eyebrow: "Choose your destination",
    heading: "Where are you travelling?",
    subtitle: "Explore destinations and compare mobile data plan details.",
    countries: "countries",
    loading: "Loading plans...",
    error: "We couldn't load the plans. Please try again.",
    retry: "Try again",
    demo: "Plan overview",
    duration: (days: number) => `Valid for ${days} days`,
    noPlan: "No plan is currently listed",
    data: "Data",
    price: "Illustrative USD price (approx.)",
    details: "View plan →",
    emptyTitle: "No country found",
    emptyText: "Try searching in Arabic or English.",
    showAll: "Show all countries",
    promoTitle: "Your journey with GlobeSIM starts here 🌍",
    promoText: "We are preparing to offer real eSIM plans. Current prices are illustrative only; purchasing and activation are not yet available.",
    compare: "Compare plans",
    footer: "GlobeSIM · Discover mobile data plans for your travels",
    language: "العربية",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  useEffect(() => {
    const saved = localStorage.getItem("globesim-language");
    if (saved === "ar" || saved === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(saved);
    }
  }, []);
  const [search, setSearch] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const t = translations[language];
  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    fetch("/api/plans")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load plans");
        return response.json();
      })
      .then((data) => {
        setCountries(data.countries);
        setPlans(data.plans);
      })
      .catch(() => setError("load"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return countries;

    return countries.filter((country) => {
      const searchable = [
        country.name,
        country.slug.replace(/-/g, " "),
        countryAliases[country.slug] ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [search, countries]);

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f5f8ff] text-slate-900"
    >
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white">
              ◉
            </span>
            <span className="text-2xl font-black tracking-tight">
              Globe<span className="text-blue-600">SIM</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = language === "ar" ? "en" : "ar";
                localStorage.setItem("globesim-language", next);
                setLanguage(next);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-blue-50 hover:text-blue-700"
              aria-label="Change language"
            >
              {t.language}
            </button>
            <a
              href="#countries"
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold hover:bg-blue-50 hover:text-blue-700"
            >
              {t.nav}
            </a>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#07152f] via-[#102e68] to-[#2563eb] px-5 py-20 text-white md:py-28">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-blue-100 shadow-lg backdrop-blur-sm">
            ✈️ {t.badge}
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-7xl">
            {t.title1}
            <br />
            <span className="text-cyan-300">{t.title2}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
            {t.intro}
          </p>

          <div className="mx-auto mt-9 max-w-2xl rounded-3xl bg-white p-2 shadow-[0_25px_80px_rgba(0,0,0,0.28)] ring-1 ring-white/30 sm:flex sm:items-center sm:gap-2">
            <span className="hidden px-3 text-2xl sm:block">🔎</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className={`min-w-0 flex-1 rounded-xl px-4 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base ${
                isArabic ? "text-right" : "text-left"
              }`}
            />
            <a
              href="#countries"
              className="mt-2 block rounded-xl bg-blue-600 px-6 py-4 text-center font-bold text-white hover:bg-blue-700 sm:mt-0"
            >
              {t.searchButton}
            </a>
          </div>

          <p className="mt-4 text-sm text-blue-200">{t.features}</p>
        </div>
      </section>

      <section
        id="countries"
        className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-blue-600">{t.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">{t.heading}</h2>
            <p className="mt-3 text-slate-500">{t.subtitle}</p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {filteredCountries.length} {t.countries}
          </span>
        </div>

        {loading && (
          <p className="mt-8 text-center text-slate-500">{t.loading}</p>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-5 text-center text-red-700">
            {t.error}
            <button
              onClick={() => window.location.reload()}
              className="mx-3 font-bold underline"
            >
              {t.retry}
            </button>
          </div>
        )}

        {!loading && !error && filteredCountries.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCountries.map((country) => {
              const plan = plans.find(
                (item) => item.country_slug === country.slug
              );
              const displayName = isArabic
                ? country.name
                : countryNames[country.slug] ?? country.name;

              return (
                <article
                  key={country.slug}
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-[0_20px_45px_rgba(37,99,235,0.12)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="text-5xl"
                      role="img"
                      aria-label={displayName}
                    >
                      {country.flag}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      {t.demo}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold">
                    {displayName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {plan ? t.duration(plan.days) : t.noPlan}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
                    <div>
                      <p className="text-sm text-slate-500">{t.data}</p>
                      <p className="mt-1 text-lg font-extrabold">
                        {plan ? `${plan.data_gb} GB` : "—"}
                      </p>
                    </div>
                    <div className={isArabic ? "text-left" : "text-right"}>
                      <p className="text-sm text-slate-500">{t.price}</p>
                      <p className="mt-1 text-2xl font-black text-blue-700">
                        {plan ? `$${(plan.price / 9.8).toFixed(2)}` : "—"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/plans/${country.slug}`}
                    className="mt-6 block w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3.5 text-center font-bold text-white shadow-md shadow-blue-600/15 transition hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 hover:shadow-lg"
                  >
                    {t.details}
                  </a>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredCountries.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-4xl">🌍</p>
            <h3 className="mt-3 text-xl font-bold">{t.emptyTitle}</h3>
            <p className="mt-2 text-slate-500">{t.emptyText}</p>
            <button
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
            >
              {t.showAll}
            </button>
          </div>
        )}
      </section>

      <section className="px-5 pb-14 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100 bg-gradient-to-l from-blue-50 via-white to-cyan-50 p-7 shadow-sm md:p-10">
          <h2 className="text-2xl font-black">{t.promoTitle}</h2>
          <p className="mt-2 leading-7 text-slate-600">{t.promoText}</p>
          <a
            href="#countries"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
          >
            {t.compare}
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-500">
        © 2026 GlobeSIM · {t.footer}
      </footer>
    </main>
  );
}
