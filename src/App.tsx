import { useEffect, useState } from "react";
import KarenBikeFittingServices from "./KarenBikeFitting/KarenBikeFittingServices";
import LocalBusinessDemoGenerator from "./WebsiteGenerator/LocalBusinessDemoGenerator";
import CURATE from "./CURATE/CURATE";
import LuxuryPetBoarding from "./LuxuryPetBoarding/LuxuryPetBoarding";
import LilyDupuis from "./LilyDupuis/LilyDupuis";
import UserManagment from "./UserManagment/userManagment";
import ApplyAI from "./ApplyAI/ApplyAI";
import BacariDinnerStudyGuide from "./BacariDinner/BacariDinnerStudyGuide";
import BacariShiftTrader from "./BacariShiftTrader/BacariShiftTrader";
import CreatureQuest from "./CreatureQuest/CreatureQuest";
import SignalAI from "./SignalAI/SignalAI";

type Page =
  | "home"
  | "karen"
  | "lily"
  | "curate"
  | "petBoarding"
  | "demoGenerator"
  | "applyAI"
  | "bacariDinner"
  | "bacariShiftTrader"
  | "creatureQuest"
  | "userManagement"
  | "signalAI"
  | "resume";

const pageSlugs: Record<Page, string> = {
  home: "",
  karen: "advantagebikefitting",
  lily: "lilydupuis",
  curate: "curate",
  petBoarding: "petboarding",
  demoGenerator: "demogenerator",
  applyAI: "applyai",
  bacariDinner: "bacari-dinner",
  bacariShiftTrader: "bacari-shift-trader",
  creatureQuest: "creature-quest",
  userManagement: "usermanagement",
  signalAI: "signal-ai",
  resume: "resume",
};

const slugPages: Record<string, Page> = {
  advantagebikefitting: "karen",
  karen: "karen",
  karenbikefitting: "karen",
  lilydupuis: "lily",
  lily: "lily",
  curate: "curate",
  petboarding: "petBoarding",
  "pet-boarding": "petBoarding",
  maisonpaw: "petBoarding",
  "maison-paw": "petBoarding",
  demogenerator: "demoGenerator",
  "demo-generator": "demoGenerator",
  applyai: "applyAI",
  "apply-ai": "applyAI",
  bacari: "bacariDinner",
  bacaridinner: "bacariDinner",
  "bacari-dinner": "bacariDinner",
  "bacari-study-guide": "bacariDinner",
  bacarishifttrader: "bacariShiftTrader",
  "bacari-shift-trader": "bacariShiftTrader",
  "shift-trader": "bacariShiftTrader",
  creaturequest: "creatureQuest",
  "creature-quest": "creatureQuest",
  critterquest: "creatureQuest",
  "critter-quest": "creatureQuest",
  usermanagement: "userManagement",
  "user-management": "userManagement",
  signalai: "signalAI",
  "signal-ai": "signalAI",
  "stock-screener": "signalAI",
  resume: "resume",
};

function getPageFromPath(pathname: string): Page {
  const slug = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

  return slugPages[slug] ?? "home";
}

function App() {
  const [page, setPageState] = useState<Page>(() =>
    getPageFromPath(window.location.pathname)
  );
  const [isPreviewNavVisible, setIsPreviewNavVisible] = useState(true);
  const shouldShowPreviewNav = page !== "resume";
  const shouldAutoHideNav = shouldShowPreviewNav && page !== "home";

  const setPage = (nextPage: Page) => {
    setPageState(nextPage);

    const nextSlug = pageSlugs[nextPage];
    const nextPath = nextSlug ? `/${nextSlug}` : "/";

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, "", nextPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setPageState(getPageFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setIsPreviewNavVisible(true);

    if (!shouldAutoHideNav) {
      return;
    }

    const hideNavTimer = window.setTimeout(() => {
      setIsPreviewNavVisible(false);
    }, 2200);

    return () => window.clearTimeout(hideNavTimer);
  }, [page, shouldAutoHideNav]);

  useEffect(() => {
    if (!shouldAutoHideNav) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (event.clientY <= 18) {
        setIsPreviewNavVisible(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [shouldAutoHideNav]);

  return (
    <div
      className={
        page === "resume"
          ? "min-h-screen overflow-x-hidden bg-white text-black"
          : page === "lily"
          ? "min-h-screen overflow-x-hidden"
          : "min-h-screen overflow-x-hidden bg-black text-white"
      }
    >
      {shouldAutoHideNav && (
        <button
          type="button"
          aria-label="Show project navigation"
          onFocus={() => setIsPreviewNavVisible(true)}
          onMouseEnter={() => setIsPreviewNavVisible(true)}
          className="fixed left-0 top-0 z-[2147483647] h-5 w-full bg-transparent"
        />
      )}

      {shouldShowPreviewNav && (
      <nav
        style={{
          position: shouldAutoHideNav ? "fixed" : "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2147483647,
          isolation: "isolate",
          transform:
            shouldAutoHideNav && !isPreviewNavVisible
              ? "translateY(-100%)"
              : "translateY(0)",
          transition: "transform 260ms ease",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onFocus={() => setIsPreviewNavVisible(true)}
        onMouseEnter={() => setIsPreviewNavVisible(true)}
        onMouseLeave={() => {
          if (shouldAutoHideNav) {
            setIsPreviewNavVisible(false);
          }
        }}
        className={
          page === "lily" || page === "karen"
            ? "hidden items-center justify-between gap-4 px-6 py-4 text-white shadow-lg shadow-black/20 md:flex"
            : "flex flex-wrap items-center justify-between gap-4  px-6 py-4 text-white shadow-lg shadow-black/20"
        }
      >
        <button onClick={() => setPage("home")} className="text-xl font-bold">
          Jake Builds
        </button>

        <div className="flex flex-wrap gap-3 hidden md:flex">
          <button
            onClick={() => setPage("karen")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Karen Bike Fitting
          </button>

          <button
            onClick={() => setPage("lily")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Lily Dupuis
          </button>

          <button
            onClick={() => setPage("curate")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            CURATE
          </button>

          <button
            onClick={() => setPage("petBoarding")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Pet Boarding
          </button>

          <button
            onClick={() => setPage("demoGenerator")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Demo Generator
          </button>

          <button
            onClick={() => setPage("applyAI")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            ApplyAI
          </button>

          <button
            onClick={() => setPage("bacariDinner")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Bacari Dinner
          </button>

          <button
            onClick={() => setPage("bacariShiftTrader")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Bacari Shift Trader
          </button>

          <button
            onClick={() => setPage("creatureQuest")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            Creature Quest
          </button>

          <button
            onClick={() => setPage("userManagement")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            User Management
          </button>

          <button onClick={() => setPage("signalAI")} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700">
            Signal AI
          </button>
        </div>
      </nav>
      )}

      {page === "home" && (
        <section className="px-6 py-24 text-center">
          <p className="text-sm uppercase tracking-widest text-blue-400 mb-4">
            Website Projects
          </p>

          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl mx-auto">
            Pick a project to preview.
          </h1>

          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            A simple hub for testing different website builds and demo tools.
          </p>

          <div className="mx-auto mt-10 grid w-full grid-cols-1 gap-4 sm:w-3/5 sm:grid-cols-2 xl:grid-cols-3">
            <button
              onClick={() => setPage("karen")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              View Karen Bike Fitting
            </button>

            <button
              onClick={() => setPage("lily")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              View Lily Dupuis
            </button>

            <button
              onClick={() => setPage("curate")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              View CURATE by Brady Adams
            </button>

            <button
              onClick={() => setPage("petBoarding")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              View Luxury Pet Boarding
            </button>

            <button
              onClick={() => setPage("demoGenerator")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Open Demo Generator
            </button>

            <button
              onClick={() => setPage("applyAI")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Open ApplyAI
            </button>

            <button
              onClick={() => setPage("bacariDinner")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Bacari Dinner
            </button>

            <button
              onClick={() => setPage("bacariShiftTrader")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Bacari Shift Trader
            </button>

            <button
              onClick={() => setPage("creatureQuest")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Play Creature Quest
            </button>

            <button
              onClick={() => setPage("userManagement")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Open User Management
            </button>

            <button onClick={() => setPage("signalAI")} className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500">
              Open Signal AI Stock Screener
            </button>
          </div>
        </section>
      )}

      {page === "karen" && <KarenBikeFittingServices />}
      {page === "lily" && <LilyDupuis />}
      {page === "curate" && <CURATE />}
      {page === "petBoarding" && <LuxuryPetBoarding />}
      {page === "demoGenerator" && <LocalBusinessDemoGenerator />}
      {page === "applyAI" && <ApplyAI />}
      {page === "bacariDinner" && <BacariDinnerStudyGuide />}
      {page === "bacariShiftTrader" && <BacariShiftTrader />}
      {page === "creatureQuest" && <CreatureQuest />}
      {page === "userManagement" && <UserManagment />}
      {page === "signalAI" && <SignalAI />}
      {page === "resume" && (
        <main className="h-screen bg-neutral-100">
          <object
            data="/resume/jacob-coombes-resume.pdf"
            type="application/pdf"
            className="h-full w-full"
            aria-label="Jacob Coombes resume"
          >
            <div className="flex min-h-screen items-center justify-center p-6 text-center text-black">
              <a
                href="/resume/jacob-coombes-resume.pdf"
                className="border border-black px-5 py-3 font-semibold uppercase tracking-[0.12em]"
              >
                Open Resume PDF
              </a>
            </div>
          </object>
        </main>
      )}
    </div>
  );
}

export default App;
