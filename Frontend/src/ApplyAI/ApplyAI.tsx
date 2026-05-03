import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type JobStatus = "saved" | "applied" | "interview" | "rejected" | "offer";

type Job = {
  id: number;
  company: string;
  role: string;
  link: string;
  status: JobStatus;
  notes: string;
  dateApplied: string;
  followUpDate: string;
  resumeVersion: string;
  coverLetter: string;
  contacts: string[];
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};

type Contact = {
  id: number;
  name: string;
  role: string;
  company: string;
  email: string;
  linkedIn: string;
  jobId: number;
};

type ApplyAIStorage = {
  resumeFileName: string;
  resumeText: string;
  targetRole: string;
  profileSkills: string;
  experience: string;
  education: string;
  jobDescription: string;
  jobs: Job[];
  contacts: Contact[];
  resumeVersions: string[];
  coverLetters: string[];
};

const skillBank = [
  "react",
  "typescript",
  "javascript",
  "html",
  "css",
  "tailwind",
  "node",
  "api",
  "supabase",
  "postgres",
  "figma",
  "accessibility",
  "testing",
  "git",
  "vite",
  "next",
  "ui",
  "ux",
  "crm",
  "dashboard",
  "automation",
];

const initialJobs: Job[] = [
  {
    id: 1,
    company: "Northstar Labs",
    role: "Frontend Engineer",
    link: "https://example.com/frontend-engineer",
    status: "applied",
    notes: "Strong React match. Follow up with hiring manager.",
    dateApplied: "2026-05-01",
    followUpDate: "2026-05-08",
    resumeVersion: "Frontend Resume v1",
    coverLetter: "React Product Cover Letter",
    contacts: ["Maya Chen"],
    matchScore: 82,
    matchedSkills: ["react", "typescript", "css", "api"],
    missingSkills: ["testing"],
  },
  {
    id: 2,
    company: "BrightPath Studio",
    role: "Product Engineer",
    link: "https://example.com/product-engineer",
    status: "interview",
    notes: "Interview scheduled. Prepare product walkthrough.",
    dateApplied: "2026-04-28",
    followUpDate: "2026-05-04",
    resumeVersion: "Product Engineer Resume",
    coverLetter: "Startup Cover Letter",
    contacts: ["Jordan Lee"],
    matchScore: 76,
    matchedSkills: ["react", "ui", "ux", "dashboard"],
    missingSkills: ["next"],
  },
];

const initialContacts: Contact[] = [
  {
    id: 1,
    name: "Maya Chen",
    role: "Recruiter",
    company: "Northstar Labs",
    email: "maya@example.com",
    linkedIn: "linkedin.com/in/mayachen",
    jobId: 1,
  },
  {
    id: 2,
    name: "Jordan Lee",
    role: "Engineering Manager",
    company: "BrightPath Studio",
    email: "jordan@example.com",
    linkedIn: "linkedin.com/in/jordanlee",
    jobId: 2,
  },
];

const initialResumeVersions = [
  "Frontend Resume v1",
  "Product Engineer Resume",
  "Startup Resume",
];

const initialCoverLetters = [
  "React Product Cover Letter",
  "Startup Cover Letter",
  "General Engineering Cover Letter",
];

const defaultJobDescription =
  "We are hiring a Frontend Engineer with React, TypeScript, API experience, polished CSS, accessibility awareness, and strong product instincts.";
const storageKey = "applyai-mvp-state";
const defaultResumeText =
  "Frontend developer with React, TypeScript, JavaScript, HTML, CSS, Tailwind, API integration, Supabase, dashboards, Git, and product UI experience.";
const defaultTargetRole = "Frontend Engineer";
const defaultProfileSkills =
  "react, typescript, javascript, html, css, tailwind, api, supabase, dashboard, git, ui, ux";
const defaultExperience =
  "Mid-level frontend developer building React apps, dashboards, client portals, and polished responsive interfaces.";
const defaultEducation = "Self-taught software developer";

function loadStoredState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedState = window.localStorage.getItem(storageKey);
    return storedState ? (JSON.parse(storedState) as Partial<ApplyAIStorage>) : null;
  } catch {
    return null;
  }
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function cleanList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function extractJobKeywords(description: string) {
  const lowerDescription = description.toLowerCase();
  return skillBank.filter((skill) => lowerDescription.includes(skill));
}

function getLevel(text: string) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("senior") || lowerText.includes("lead")) {
    return "senior";
  }

  if (lowerText.includes("junior") || lowerText.includes("entry")) {
    return "junior";
  }

  return "mid";
}

function calculateMatch({
  jobDescription,
  targetRole,
  profileSkills,
  profileExperience,
}: {
  jobDescription: string;
  targetRole: string;
  profileSkills: string[];
  profileExperience: string;
}) {
  const jobKeywords = extractJobKeywords(jobDescription);
  const matchedSkills = jobKeywords.filter((skill) =>
    profileSkills.includes(skill)
  );
  const missingSkills = jobKeywords.filter(
    (skill) => !profileSkills.includes(skill)
  );

  const titleTokens = targetRole
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 2);
  const titleMatches = titleTokens.filter((token) =>
    jobDescription.toLowerCase().includes(token)
  );
  const levelMatches = getLevel(jobDescription) === getLevel(profileExperience);

  const rawScore =
    matchedSkills.length * 10 + titleMatches.length * 8 + (levelMatches ? 10 : 0);
  const maxScore = Math.max(jobKeywords.length * 10 + titleTokens.length * 8 + 10, 1);
  const matchScore = Math.min(100, Math.round((rawScore / maxScore) * 100));

  return {
    jobKeywords,
    matchedSkills,
    missingSkills,
    matchScore,
    levelMatches,
    titleMatches,
  };
}

function extractResumeSection(text: string, sectionNames: string[]) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const startIndex = lines.findIndex((line) =>
    sectionNames.some((sectionName) =>
      line.toLowerCase().includes(sectionName.toLowerCase())
    )
  );

  if (startIndex === -1) {
    return "";
  }

  const nextHeadingIndex = lines.findIndex((line, index) => {
    if (index <= startIndex) {
      return false;
    }

    return /^(skills|experience|work experience|education|projects|summary|profile|certifications)\b/i.test(
      line
    );
  });

  return lines
    .slice(startIndex + 1, nextHeadingIndex === -1 ? startIndex + 5 : nextHeadingIndex)
    .join(" ");
}

function guessTargetRole(text: string) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("product engineer")) {
    return "Product Engineer";
  }

  if (lowerText.includes("frontend") || lowerText.includes("front-end")) {
    return "Frontend Engineer";
  }

  if (lowerText.includes("full stack") || lowerText.includes("full-stack")) {
    return "Full Stack Engineer";
  }

  if (lowerText.includes("designer")) {
    return "Product Designer";
  }

  return defaultTargetRole;
}

function parseResumeProfile(text: string) {
  const lowerText = text.toLowerCase();
  const detectedSkills = skillBank.filter((skill) => lowerText.includes(skill));
  const experienceSection =
    extractResumeSection(text, ["experience", "work experience", "projects"]) ||
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(" ");
  const educationSection =
    extractResumeSection(text, ["education"]) ||
    (lowerText.includes("degree") || lowerText.includes("university")
      ? "Education details found in resume text."
      : defaultEducation);

  return {
    targetRole: guessTargetRole(text),
    skills: uniqueList(detectedSkills).join(", "),
    experience: experienceSection || defaultExperience,
    education: educationSection,
  };
}

function ApplyAI() {
  const storedState = useMemo(() => loadStoredState(), []);
  const [resumeFileName, setResumeFileName] = useState(
    storedState?.resumeFileName ?? ""
  );
  const [resumeText, setResumeText] = useState(
    storedState?.resumeText ?? defaultResumeText
  );
  const [targetRole, setTargetRole] = useState(
    storedState?.targetRole ?? defaultTargetRole
  );
  const [profileSkills, setProfileSkills] = useState(
    storedState?.profileSkills ?? defaultProfileSkills
  );
  const [experience, setExperience] = useState(
    storedState?.experience ?? defaultExperience
  );
  const [education, setEducation] = useState(
    storedState?.education ?? defaultEducation
  );
  const [jobDescription, setJobDescription] = useState(
    storedState?.jobDescription ?? defaultJobDescription
  );
  const [jobs, setJobs] = useState<Job[]>(storedState?.jobs ?? initialJobs);
  const [contacts, setContacts] = useState<Contact[]>(
    storedState?.contacts ?? initialContacts
  );
  const [resumeVersions, setResumeVersions] = useState<string[]>(
    storedState?.resumeVersions ?? initialResumeVersions
  );
  const [coverLetters, setCoverLetters] = useState<string[]>(
    storedState?.coverLetters ?? initialCoverLetters
  );
  const [newResumeVersion, setNewResumeVersion] = useState("");
  const [newCoverLetter, setNewCoverLetter] = useState("");
  const [jobForm, setJobForm] = useState({
    company: "",
    role: "",
    link: "",
    status: "saved" as JobStatus,
    notes: "",
    dateApplied: "",
    followUpDate: "",
    resumeVersion: resumeVersions[0] ?? "",
    coverLetter: coverLetters[0] ?? "",
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    company: "",
    email: "",
    linkedIn: "",
    jobId: 1,
  });

  useEffect(() => {
    const stateToStore: ApplyAIStorage = {
      resumeFileName,
      resumeText,
      targetRole,
      profileSkills,
      experience,
      education,
      jobDescription,
      jobs,
      contacts,
      resumeVersions,
      coverLetters,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(stateToStore));
  }, [
    contacts,
    coverLetters,
    education,
    experience,
    jobDescription,
    jobs,
    profileSkills,
    resumeFileName,
    resumeText,
    resumeVersions,
    targetRole,
  ]);

  const parsedSkills = useMemo(() => cleanList(profileSkills), [profileSkills]);

  const match = useMemo(
    () =>
      calculateMatch({
        jobDescription,
        targetRole,
        profileSkills: parsedSkills,
        profileExperience: experience,
      }),
    [experience, jobDescription, parsedSkills, targetRole]
  );

  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => b.matchScore - a.matchScore),
    [jobs]
  );

  const dashboard = useMemo(() => {
    const applied = jobs.filter((job) => job.status === "applied").length;
    const interviews = jobs.filter((job) => job.status === "interview").length;
    const responses = jobs.filter(
      (job) => job.status === "interview" || job.status === "offer"
    ).length;
    const responseRate = jobs.length
      ? Math.round((responses / jobs.length) * 100)
      : 0;

    return {
      applied,
      interviews,
      responseRate,
      weeklyGoal: `${Math.min(applied + interviews, 5)}/5`,
    };
  }, [jobs]);

  const handleResumeUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setResumeFileName(file.name);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => setResumeText(String(reader.result ?? ""));
      reader.readAsText(file);
      return;
    }

    setResumeText((currentText) =>
      currentText ||
      "PDF uploaded. Paste extracted resume text here, then clean up skills, experience, and education below."
    );
  };

  const handleParseResume = () => {
    const parsedProfile = parseResumeProfile(resumeText);

    setTargetRole(parsedProfile.targetRole);
    setProfileSkills(parsedProfile.skills || profileSkills);
    setExperience(parsedProfile.experience);
    setEducation(parsedProfile.education);
  };

  const handleAddJob = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!jobForm.company.trim() || !jobForm.role.trim()) {
      return;
    }

    const newJob: Job = {
      id: Date.now(),
      ...jobForm,
      contacts: [],
      matchScore: match.matchScore,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
    };

    setJobs((currentJobs) => [newJob, ...currentJobs]);
    setJobForm({
      company: "",
      role: "",
      link: "",
      status: "saved",
      notes: "",
      dateApplied: "",
      followUpDate: "",
      resumeVersion: resumeVersions[0],
      coverLetter: coverLetters[0],
    });
  };

  const handleAddContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactForm.name.trim()) {
      return;
    }

    const newContact = {
      ...contactForm,
      id: Date.now(),
    };

    setContacts((currentContacts) => [newContact, ...currentContacts]);
    setContactForm({
      name: "",
      role: "",
      company: "",
      email: "",
      linkedIn: "",
      jobId: jobs[0]?.id ?? 1,
    });
  };

  const handleAddResumeVersion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newResumeVersion.trim()) {
      return;
    }

    setResumeVersions((currentVersions) =>
      uniqueList([...currentVersions, newResumeVersion])
    );
    setNewResumeVersion("");
  };

  const handleAddCoverLetter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newCoverLetter.trim()) {
      return;
    }

    setCoverLetters((currentLetters) =>
      uniqueList([...currentLetters, newCoverLetter])
    );
    setNewCoverLetter("");
  };

  const handleUpdateJobStatus = (jobId: number, status: JobStatus) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, status } : job))
    );
  };

  const handleDeleteJob = (jobId: number) => {
    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.jobId !== jobId)
    );
  };

  return (
    <main className="min-h-screen bg-[#070313] px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              ApplyAI MVP
            </p>
            <h1 className="mt-3 text-4xl font-bold md:text-6xl">
              Job search CRM without the AI bill.
            </h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Upload or paste a resume, edit the structured profile, score jobs
              with keyword logic, organize application materials, and track
              contacts like a real CRM.
            </p>
          </div>
        </div>

        <section className="grid gap-4 py-6 md:grid-cols-4">
          <Metric label="Applied" value={dashboard.applied} />
          <Metric label="Interviews" value={dashboard.interviews} />
          <Metric label="Response rate" value={`${dashboard.responseRate}%`} />
          <Metric label="Weekly goal" value={dashboard.weeklyGoal} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <aside className="space-y-6">
            <Panel title="Resume Profile">
              <label className="block">
                <span className="text-sm text-slate-300">Upload resume</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleResumeUpload}
                  className="mt-2 block w-full rounded-lg border-4 border-blue-600 bg-black px-3 py-3 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-sm file:font-bold file:text-black"
                />
              </label>

              {resumeFileName && (
                <p className="mt-3 rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-3 text-sm text-cyan-100">
                  Uploaded: {resumeFileName}. Clean up the profile fields below.
                </p>
              )}

              <Field
                label="Resume text"
                value={resumeText}
                onChange={setResumeText}
                multiline
              />
              <button
                type="button"
                onClick={handleParseResume}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Parse Profile
              </button>
              <Field
                label="Target role"
                value={targetRole}
                onChange={setTargetRole}
              />
              <Field
                label="Skills"
                value={profileSkills}
                onChange={setProfileSkills}
                multiline
              />
              <Field
                label="Experience"
                value={experience}
                onChange={setExperience}
                multiline
              />
              <Field
                label="Education"
                value={education}
                onChange={setEducation}
              />
            </Panel>

            <Panel title="Application Kit">
              <form onSubmit={handleAddResumeVersion} className="flex gap-3">
                <input
                  value={newResumeVersion}
                  onChange={(event) => setNewResumeVersion(event.target.value)}
                  placeholder="Add resume version"
                  className="min-w-0 flex-1 rounded-lg border-4 border-blue-600 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                >
                  Add
                </button>
              </form>

              <form onSubmit={handleAddCoverLetter} className="mt-3 flex gap-3">
                <input
                  value={newCoverLetter}
                  onChange={(event) => setNewCoverLetter(event.target.value)}
                  placeholder="Add cover letter template"
                  className="min-w-0 flex-1 rounded-lg border-4 border-blue-600 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                >
                  Add
                </button>
              </form>

              <div className="space-y-3">
                {resumeVersions.map((version) => (
                  <KitItem key={version} label="Resume" value={version} />
                ))}
                {coverLetters.map((letter) => (
                  <KitItem key={letter} label="Cover letter" value={letter} />
                ))}
              </div>
            </Panel>
          </aside>

          <div className="space-y-6">
            <Panel title="Job Matching">
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <Field
                  label="Paste job description"
                  value={jobDescription}
                  onChange={setJobDescription}
                  multiline
                  tall
                />

                <div className="rounded-lg border border-white/10 bg-black/25 p-5">
                  <p className="text-sm text-slate-400">Match score</p>
                  <p className="mt-2 text-5xl font-bold text-cyan-200">
                    {match.matchScore}%
                  </p>
                  <p className="mt-4 text-sm text-slate-300">
                    Based on matched skills, title similarity, and experience
                    level.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <KeywordGroup
                  title="Matched skills"
                  keywords={match.matchedSkills}
                  tone="matched"
                />
                <KeywordGroup
                  title="Missing skills"
                  keywords={match.missingSkills}
                  tone="missing"
                />
              </div>

              {match.missingSkills.length > 0 && (
                <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-100">
                  Consider adding these skills to your resume if they are
                  genuinely part of your experience: {match.missingSkills.join(", ")}.
                </p>
              )}
            </Panel>

            <Panel title="Job Tracker">
              <form
                onSubmit={handleAddJob}
                className="grid gap-3 border-b border-white/10 pb-5 md:grid-cols-2"
              >
                <TextInput
                  label="Company"
                  value={jobForm.company}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, company: value }))
                  }
                />
                <TextInput
                  label="Role"
                  value={jobForm.role}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, role: value }))
                  }
                />
                <TextInput
                  label="Job link"
                  value={jobForm.link}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, link: value }))
                  }
                />
                <SelectInput
                  label="Status"
                  value={jobForm.status}
                  options={["saved", "applied", "interview", "rejected", "offer"]}
                  onChange={(value) =>
                    setJobForm((current) => ({
                      ...current,
                      status: value as JobStatus,
                    }))
                  }
                />
                <SelectInput
                  label="Resume version"
                  value={jobForm.resumeVersion}
                  options={resumeVersions}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, resumeVersion: value }))
                  }
                />
                <SelectInput
                  label="Cover letter"
                  value={jobForm.coverLetter}
                  options={coverLetters}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, coverLetter: value }))
                  }
                />
                <TextInput
                  label="Date applied"
                  type="date"
                  value={jobForm.dateApplied}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, dateApplied: value }))
                  }
                />
                <TextInput
                  label="Follow-up date"
                  type="date"
                  value={jobForm.followUpDate}
                  onChange={(value) =>
                    setJobForm((current) => ({ ...current, followUpDate: value }))
                  }
                />
                <div className="md:col-span-2">
                  <Field
                    label="Notes"
                    value={jobForm.notes}
                    onChange={(value) =>
                      setJobForm((current) => ({ ...current, notes: value }))
                    }
                    multiline
                  />
                </div>
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                >
                  Add Job
                </button>
              </form>

              <div className="mt-5 space-y-3">
                <p className="text-sm text-slate-400">
                  Jobs are sorted by strongest match first.
                </p>
                {sortedJobs.map((job) => (
                  <article
                    key={job.id}
                    className="rounded-lg border border-white/10 bg-[#0f172a] p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                          {job.company}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold">{job.role}</h3>
                        <p className="mt-2 text-sm text-slate-300">{job.notes}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={job.status}
                          onChange={(event) =>
                            handleUpdateJobStatus(
                              job.id,
                              event.target.value as JobStatus
                            )
                          }
                          className="rounded-full border border-white/10 bg-black px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-400"
                        >
                          {[
                            "saved",
                            "applied",
                            "interview",
                            "rejected",
                            "offer",
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <p className="text-3xl font-bold text-cyan-200">
                          {job.matchScore}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                      <p>Resume: {job.resumeVersion}</p>
                      <p>Cover letter: {job.coverLetter}</p>
                      <p>Follow-up: {job.followUpDate || "Not set"}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-cyan-300/30 px-3 py-2 text-sm text-cyan-200 transition hover:border-cyan-200 hover:text-white"
                        >
                          Open Job Link
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200 transition hover:border-red-300 hover:text-white"
                      >
                        Delete Job
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel title="Contact Tracking">
              <form
                onSubmit={handleAddContact}
                className="grid gap-3 border-b border-white/10 pb-5 md:grid-cols-2"
              >
                <TextInput
                  label="Name"
                  value={contactForm.name}
                  onChange={(value) =>
                    setContactForm((current) => ({ ...current, name: value }))
                  }
                />
                <TextInput
                  label="Role"
                  value={contactForm.role}
                  onChange={(value) =>
                    setContactForm((current) => ({ ...current, role: value }))
                  }
                />
                <TextInput
                  label="Company"
                  value={contactForm.company}
                  onChange={(value) =>
                    setContactForm((current) => ({ ...current, company: value }))
                  }
                />
                <SelectInput
                  label="Linked job"
                  value={String(contactForm.jobId)}
                  options={jobs.map((job) => String(job.id))}
                  optionLabels={jobs.reduce<Record<string, string>>((labels, job) => {
                    labels[String(job.id)] = `${job.company} - ${job.role}`;
                    return labels;
                  }, {})}
                  onChange={(value) =>
                    setContactForm((current) => ({
                      ...current,
                      jobId: Number(value),
                    }))
                  }
                />
                <TextInput
                  label="Email"
                  value={contactForm.email}
                  onChange={(value) =>
                    setContactForm((current) => ({ ...current, email: value }))
                  }
                />
                <TextInput
                  label="LinkedIn"
                  value={contactForm.linkedIn}
                  onChange={(value) =>
                    setContactForm((current) => ({ ...current, linkedIn: value }))
                  }
                />
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
                >
                  Add Contact
                </button>
              </form>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                  <article
                    key={contact.id}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="text-lg font-semibold">{contact.name}</p>
                    <p className="mt-1 text-sm text-cyan-200">
                      {contact.role} at {contact.company}
                    </p>
                    <p className="mt-3 text-sm text-slate-300">{contact.email}</p>
                    <p className="text-sm text-slate-400">{contact.linkedIn}</p>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
  tall = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  tall?: boolean;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm text-slate-300">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`mt-2 w-full resize-none rounded-lg border-4 border-blue-600 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400 ${
            tall ? "min-h-[220px]" : "min-h-[96px]"
          }`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-lg border-4 border-blue-600 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400"
        />
      )}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border-4 border-blue-600 bg-black px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  optionLabels = {},
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border-4 border-blue-600 bg-black px-4 py-3 text-sm text-white outline-none focus:border-blue-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function KeywordGroup({
  title,
  keywords,
  tone,
}: {
  title: string;
  keywords: string[];
  tone: "matched" | "missing";
}) {
  const styles =
    tone === "matched"
      ? "border-green-400/25 bg-green-400/10 text-green-100"
      : "border-red-400/25 bg-red-400/10 text-red-100";

  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-4">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {keywords.length > 0 ? (
          keywords.map((keyword) => (
            <span
              key={`${title}-${keyword}`}
              className={`rounded-full border px-3 py-1 text-xs ${styles}`}
            >
              {keyword}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">No keywords yet</span>
        )}
      </div>
    </div>
  );
}

function KitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">
        {label}
      </p>
      <p className="mt-2 text-sm text-slate-200">{value}</p>
    </div>
  );
}

export default ApplyAI;
