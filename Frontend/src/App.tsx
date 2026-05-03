import { useEffect, useState } from "react";
import KarenBikeFittingServices from "./KarenBikeFitting/KarenBikeFittingServices";
import LocalBusinessDemoGenerator from "./WebsiteGenerator/LocalBusinessDemoGenerator";
import CURATE from "./CURATE/CURATE";
import LilyDupuis from "./LilyDupuis/LilyDupuis";
import UserManagment from "./UserManagment/userManagment";
import ApplyAI from "./ApplyAI/ApplyAI";

type Page =
  | "home"
  | "karen"
  | "lily"
  | "curate"
  | "demoGenerator"
  | "applyAI"
  | "userManagement";

const pageSlugs: Record<Page, string> = {
  home: "",
  karen: "advantagebikefitting",
  lily: "lilydupuis",
  curate: "curate",
  demoGenerator: "demogenerator",
  applyAI: "applyai",
  userManagement: "usermanagement",
};

const slugPages: Record<string, Page> = {
  advantagebikefitting: "karen",
  karen: "karen",
  karenbikefitting: "karen",
  lilydupuis: "lily",
  lily: "lily",
  curate: "curate",
  demogenerator: "demoGenerator",
  "demo-generator": "demoGenerator",
  applyai: "applyAI",
  "apply-ai": "applyAI",
  usermanagement: "userManagement",
  "user-management": "userManagement",
};

function getPageFromPath(pathname: string): Page {
  const slug = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

  return slugPages[slug] ?? "home";
}

function App() {
  const [page, setPageState] = useState<Page>(() =>
    getPageFromPath(window.location.pathname)
  );

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

  return (
    <div
      className={
        page === "lily"
          ? "min-h-screen overflow-x-hidden"
          : "min-h-screen overflow-x-hidden bg-black text-white"
      }
    >
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2147483647,
          isolation: "isolate",
        }}
        className={
          page === "lily" || page === "karen"
            ? "hidden items-center justify-between gap-4 border-b border-slate-800 bg-black px-6 py-4 text-white md:flex"
            : "flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-black px-6 py-4 text-white"
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
            onClick={() => setPage("userManagement")}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            User Management
          </button>
        </div>
      </nav>

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

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
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
              onClick={() => setPage("userManagement")}
              className="px-6 py-4 rounded-2xl bg-blue-600 font-semibold hover:bg-blue-500"
            >
              Open User Management
            </button>
          </div>
        </section>
      )}

      {page === "karen" && <KarenBikeFittingServices />}
      {page === "lily" && <LilyDupuis />}
      {page === "curate" && <CURATE />}
      {page === "demoGenerator" && <LocalBusinessDemoGenerator />}
      {page === "applyAI" && <ApplyAI />}
      {page === "userManagement" && <UserManagment />}
    </div>
  );
}

export default App;
