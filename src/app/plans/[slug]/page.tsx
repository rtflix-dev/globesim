"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  provider?: string;
  providerPlanId?: string | null;
  availabilityStatus?: string;
  lastSyncedAt?: string | null;
  isIllustrative?: boolean;
};

type ApiResponse = {
  countries: Country[];
  plans: Plan[];
};

const countryNames: Record<string, string> = {
  morocco: "Morocco",
  spain: "Spain",
  france: "France",
  turkey: "Turkey",
  "united-states": "United States",
  "united-arab-emirates": "United Arab Emirates",
};

const copy = {
  ar: {
    home: "الرئيسية",
    back: "الرجوع للوجهات",
    title: "تفاصيل باقة الإنترنت",
    subtitle: "راجع تفاصيل الباقة قبل السفر.",
    loading: "كنحمّلو معلومات الباقة...",
    notFound: "ما لقيناش هاد الوجهة أو الباقة.",
    retry: "عاود المحاولة",
    data: "حجم الإنترنت",
    validity: "مدة الصلاحية",
    days: "أيام",
    price: "الثمن التوضيحي بالدولار (تقريبي)",
    provider: "المزوّد",
    localProvider: "بيانات محلية",
    status: "حالة الباقة",
    illustrative: "للمقارنة فقط",
    available: "متاحة من طرف المزوّد",
    unavailable: "غير متاحة حالياً",
    unknown: "غير محددة",
    lastSync: "آخر تحديث",
    notSynced: "مازال ما تزامناتش",
    noticeTitle: "مهم قبل ما تسافر",
    notice:
      "هاد الباقة ومعلومات الثمن توضيحية فقط، وما كتمثلش عرضاً حقيقياً من مزوّد. الشراء والتفعيل ما زال غير متاحين حتى يتم ربط GlobeSIM بمزوّد فعلي والتحقق من العروض.",
    noPurchase: "الشراء غير متاح حالياً",
    footer: "GlobeSIM · اكتشف باقات الإنترنت أثناء السفر",
    language: "English",
    error: "وقع مشكل أثناء تحميل المعلومات. تأكد أن الموقع خدام وعاود المحاولة.",
    backHome: "الرجوع للرئيسية",
  },
  en: {
    home: "Home",
    back: "Back to destinations",
    title: "Plan details",
    subtitle: "Review the plan details before your trip.",
    loading: "Loading plan information...",
    notFound: "This destination or plan could not be found.",
    retry: "Try again",
    data: "Data allowance",
    validity: "Validity",
    days: "days",
    price: "Illustrative USD price (approx.)",
    provider: "Provider",
    localProvider: "Local data",
    status: "Plan status",
    illustrative: "For comparison only",
    available: "Reported available by provider",
    unavailable: "Currently unavailable",
    unknown: "Not specified",
    lastSync: "Last updated",
    notSynced: "Not synchronized",
    noticeTitle: "Important before you travel",
    notice:
      "This plan and price are illustrative only and do not represent a real provider offer. Purchasing and activation are unavailable until GlobeSIM is connected to a real provider and the offers are verified.",
    noPurchase: "Purchasing is currently unavailable",
    footer: "GlobeSIM · Discover mobile data plans for your travels",
    language: "العربية",
    error: "There was a problem loading the information. Make sure the website is running and try again.",
    backHome: "Back to home",
  },
};

export default function PlanDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [language, setLanguage] = useState<Language>("ar");
  const [countries, setCountries] = useState<Country[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("globesim-language");
    if (saved === "ar" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const t = copy[language];
  const isArabic = language === "ar";

  async function loadPlans() {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/plans", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load plans");
      }

      const result: ApiResponse = await response.json();

      setCountries(Array.isArray(result.countries) ? result.countries : []);
      setPlans(Array.isArray(result.plans) ? result.plans : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlans();
  }, []);

  const country = countries.find((item) => item.slug === slug);
  const plan = plans.find((item) => item.country_slug === slug);

  const isIllustrative =
    plan?.isIllustrative === true ||
    plan?.availabilityStatus === "illustrative" ||
    plan?.provider === "local" ||
    !plan?.providerPlanId;

  const statusLabel = !plan
    ? t.unknown
    : isIllustrative
      ? t.illustrative
      : plan.availabilityStatus === "available"
        ? t.available
        : plan.availabilityStatus === "unavailable"
          ? t.unavailable
          : t.unknown;

  const providerLabel =
    !plan || plan.provider === "local" || !plan.provider
      ? t.localProvider
      : plan.provider;

  const formattedDate = plan?.lastSyncedAt
    ? new Date(plan.lastSyncedAt).toLocaleString(
        isArabic ? "ar-MA" : "en",
      )
    : t.notSynced;

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-blue-700"
          >
            GlobeSIM
          </Link>

          <button
            type="button"
            onClick={() => {
              const next = language === "ar" ? "en" : "ar";
              localStorage.setItem("globesim-language", next);
              setLanguage(next);
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
          >
            {t.language}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-blue-700">
            {t.home}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">{t.title}</span>
        </nav>

        {loading ? (
          <section
            className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
            aria-live="polite"
          >
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-slate-600">{t.loading}</p>
          </section>
        ) : error ? (
          <section
            className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"
            role="alert"
          >
            <p className="mb-5 text-red-700">{t.error}</p>
            <button
              type="button"
              onClick={() => void loadPlans()}
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              {t.retry}
            </button>
          </section>
        ) : !country || !plan ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">🌍</div>
            <h1 className="mb-3 text-xl font-bold">{t.notFound}</h1>
            <Link
              href="/"
              className="inline-block rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              {t.backHome}
            </Link>
          </section>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-6 py-8 text-white sm:px-10 sm:py-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm">
                    {t.title}
                  </span>

                  <span className="text-4xl" aria-label={country.name}>
                    {country.flag}
                  </span>
                </div>

                <h1 className="mb-3 text-3xl font-extrabold sm:text-4xl">
                  {language === "ar"
                    ? country.name
                    : countryNames[country.slug] ?? country.name}
                </h1>

                <p className="max-w-2xl leading-7 text-blue-100">
                  {t.subtitle}
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-2 text-sm text-slate-500">{t.data}</p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {plan.data_gb} GB
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-2 text-sm text-slate-500">{t.validity}</p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {plan.days}{" "}
                    <span className="text-base font-semibold">
                      {t.days}
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2 lg:col-span-1">
                  <p className="mb-2 text-sm text-slate-500">{t.price}</p>
                  <p className="text-3xl font-extrabold text-blue-700">
                    {`$${(plan.price / 9.8).toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="mx-5 mb-6 rounded-2xl border border-slate-200 p-5 sm:mx-8 sm:mb-8">
                <h2 className="mb-4 text-lg font-bold">{t.status}</h2>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="mb-1 text-sm text-slate-500">
                      {t.provider}
                    </dt>
                    <dd className="font-semibold">{providerLabel}</dd>
                  </div>

                  <div>
                    <dt className="mb-1 text-sm text-slate-500">
                      {t.status}
                    </dt>
                    <dd>
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                        {statusLabel}
                      </span>
                    </dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="mb-1 text-sm text-slate-500">
                      {t.lastSync}
                    </dt>
                    <dd className="text-sm text-slate-700">
                      {formattedDate}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {isIllustrative && (
              <section
                className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-6"
                role="note"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <h2 className="mb-2 font-bold text-amber-950">
                      {t.noticeTitle}
                    </h2>
                    <p className="leading-7 text-amber-900">{t.notice}</p>
                  </div>
                </div>
              </section>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="mb-4 text-sm text-slate-600">
                {t.noPurchase}
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                {t.back}
              </Link>
            </div>
          </>
        )}
      </div>

      <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        {t.footer}
      </footer>
    </main>
  );
}
