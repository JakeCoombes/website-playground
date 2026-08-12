import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type BookingForm = {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  petName: string;
  petBreed: string;
  petAge: string;
  petWeight: string;
  petTemperament: string;
  petType: string;
  extraPets: ExtraPet[];
  serviceType: "Overnight Boarding" | "Daily Check-in";
  services: string[];
  startDate: string;
  endDate: string;
  vaccinationFile: string;
  careNotes: string;
  emergencyName: string;
  emergencyPhone: string;
  paymentMethod: string;
};

type ExtraPet = {
  id: number;
  name: string;
  animalType: "Dog" | "Cat";
  breed: string;
  age: string;
  weight: string;
};

type BookingStatus =
  | "Pending Deposit"
  | "Deposit Received"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

type PetProfile = {
  name: string;
  breed: string;
  age: string;
  weight: string;
  temperament: string;
  medicalNeeds: string;
  vaccinationStatus: string;
  feedingSchedule: string;
  favoriteNotes: string;
  image: string;
};

const services = [
  {
    name: "Overnight Boarding",
    price: "From $75/night",
    detail: "Your pet stays with us in a calm, supervised home environment.",
    icon: "01",
  },
  {
    name: "Daily Check-in",
    price: "From $35/visit",
    detail: "Your pet stays at home and we visit for food, water, potty breaks, and care.",
    icon: "02",
  },
];

const serviceRates = {
  "Overnight Boarding": {
    Dog: 95,
    Cat: 75,
  },
  "Daily Check-in": {
    Dog: 45,
    Cat: 35,
  },
};

const trustPoints = [
  "Daily photo/video updates",
  "Safe supervised play",
  "Clean luxury environment",
  "Experienced caretakers",
  "Emergency-ready staff",
  "Personalized care plans",
];

const bookingSteps = [
  "Owner",
  "Pet",
  "Services",
  "Dates",
  "Documents",
  "Care",
  "Emergency",
  "Review",
  "Confirm",
];

const paymentMethods = ["Zelle", "Venmo", "Cash App", "Apple Pay", "Other"];

const bookingStatuses: BookingStatus[] = [
  "Pending Deposit",
  "Deposit Received",
  "Confirmed",
  "Completed",
  "Cancelled",
];

const testimonials = [
  {
    quote:
      "The daily updates made our trip feel effortless. Maple looked relaxed, happy, and completely cared for.",
    name: "Sofia R.",
    pet: "Maple",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "It feels more like a boutique hotel than a kennel. The team knew Winston's quirks by day one.",
    name: "Evan M.",
    pet: "Winston",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "Our senior cat needed medication and quiet care. Everything was logged, calm, and beautifully handled.",
    name: "Priya K.",
    pet: "Miso",
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
  },
];

const petProfiles: PetProfile[] = [
  {
    name: "Maple",
    breed: "Golden Retriever",
    age: "4 years",
    weight: "62 lb",
    temperament: "Gentle, playful, social",
    medicalNeeds: "Joint supplement with dinner",
    vaccinationStatus: "Current through Oct 2026",
    feedingSchedule: "2 cups AM, 2 cups PM",
    favoriteNotes: "Loves tennis balls and quiet bedtime music",
    image:
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Miso",
    breed: "British Shorthair",
    age: "7 years",
    weight: "11 lb",
    temperament: "Calm, private, affectionate",
    medicalNeeds: "Oral medication at 8 PM",
    vaccinationStatus: "Verified",
    feedingSchedule: "Wet food AM, dry food PM",
    favoriteNotes: "Prefers window perches and fleece blankets",
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
  },
];

const galleryImages = [
  "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
];

const faqs = [
  {
    question: "What vaccinations are required?",
    answer:
      "Dogs need current rabies, DHPP, and Bordetella records. Cats need rabies and FVRCP. You can upload documents during booking.",
  },
  {
    question: "Will I receive updates while my pet boards?",
    answer:
      "Yes. Every stay includes daily photos, short notes, and wellness check-ins through the client dashboard.",
  },
  {
    question: "Can you care for senior pets or medication needs?",
    answer:
      "Yes. We create individualized care plans, log medication, and flag any changes in appetite, energy, or behavior.",
  },
  {
    question: "Do you offer a meet and greet before booking?",
    answer:
      "Yes. Meet and greets help us understand routines, temperament, play style, and any special handling needs.",
  },
];

const emptyBookingForm: BookingForm = {
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  petName: "",
  petBreed: "",
  petAge: "",
  petWeight: "",
  petTemperament: "",
  petType: "Dog",
  extraPets: [],
  serviceType: "Overnight Boarding",
  services: ["Overnight Boarding"],
  startDate: "",
  endDate: "",
  vaccinationFile: "",
  careNotes: "",
  emergencyName: "",
  emergencyPhone: "",
  paymentMethod: "Zelle",
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  if (!dateKey) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatWrittenDate(dateKey: string) {
  const date = parseDateKey(dateKey);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();

  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1);

      return {
        date,
        key: toDateKey(date),
        day: index + 1,
      };
    }),
  ];
}

function LuxuryPetBoarding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [bookingForm, setBookingForm] = useState<BookingForm>(emptyBookingForm);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingStatus, setBookingStatus] =
    useState<BookingStatus>("Pending Deposit");
  const [bookingReference, setBookingReference] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 36);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const selectedNights = useMemo(() => {
    const startDate = parseDateKey(bookingForm.startDate);
    const endDate = parseDateKey(bookingForm.endDate);

    if (!startDate || !endDate) {
      return 1;
    }

    const difference = endDate.getTime() - startDate.getTime();

    return Math.max(1, Math.round(difference / 86400000));
  }, [bookingForm.endDate, bookingForm.startDate]);

  const nightlyTotal = useMemo(() => {
    const primaryRate =
      bookingForm.petType === "Cat"
        ? serviceRates[bookingForm.serviceType].Cat
        : serviceRates[bookingForm.serviceType].Dog;
    const extraPetTotal = bookingForm.extraPets.reduce(
      (total, pet) =>
        total + serviceRates[bookingForm.serviceType][pet.animalType],
      0
    );

    return primaryRate + extraPetTotal;
  }, [bookingForm.extraPets, bookingForm.petType, bookingForm.serviceType]);

  const selectedTotal = useMemo(
    () => nightlyTotal * selectedNights,
    [nightlyTotal, selectedNights]
  );

  const requiredDeposit = useMemo(
    () => Math.max(50, Math.round(selectedTotal * 0.3)),
    [selectedTotal]
  );

  const themeClass = isDark
    ? "bg-[#171614] text-[#f7f1e8]"
    : "bg-[#f8f3ea] text-[#26221d]";

  const panelClass = isDark
    ? "border-white/10 bg-white/[0.06] shadow-black/30"
    : "border-white/70 bg-white/75 shadow-stone-300/35";

  const updateBookingField = (field: keyof BookingForm, value: string) => {
    setBookingForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePetType = (petType: string) => {
    setBookingForm((current) => {
      return {
        ...current,
        petType,
        extraPets:
          petType === "Multiple Pets"
            ? current.extraPets.length
              ? current.extraPets
              : [
                  {
                    id: Date.now(),
                    name: "",
                    animalType: "Dog",
                    breed: "",
                    age: "",
                    weight: "",
                  },
                ]
            : [],
      };
    });
  };

  const updateServiceType = (
    serviceType: BookingForm["serviceType"]
  ) => {
    setBookingForm((current) => ({
      ...current,
      serviceType,
      services: [serviceType],
    }));
  };

  const addExtraPet = () => {
    setBookingForm((current) => ({
      ...current,
      extraPets: [
        ...current.extraPets,
        {
          id: Date.now(),
          name: "",
          animalType: "Dog",
          breed: "",
          age: "",
          weight: "",
        },
      ],
    }));
  };

  const updateExtraPet = (
    petId: number,
    field: keyof Omit<ExtraPet, "id">,
    value: string
  ) => {
    setBookingForm((current) => ({
      ...current,
      extraPets: current.extraPets.map((pet) =>
        pet.id === petId ? { ...pet, [field]: value } : pet
      ),
    }));
  };

  const removeExtraPet = (petId: number) => {
    setBookingForm((current) => ({
      ...current,
      extraPets: current.extraPets.filter((pet) => pet.id !== petId),
    }));
  };

  const handleCalendarDateClick = (dateKey: string) => {
    setBookingForm((current) => {
      if (
        !current.startDate ||
        (current.startDate && current.endDate) ||
        dateKey < current.startDate
      ) {
        return {
          ...current,
          startDate: dateKey,
          endDate: "",
        };
      }

      if (dateKey === current.startDate) {
        return current;
      }

      return {
        ...current,
        endDate: dateKey,
      };
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileName = event.target.files?.[0]?.name || "";
    updateBookingField("vaccinationFile", fileName);
  };

  const handleBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeStep < bookingSteps.length - 2) {
      setActiveStep((current) => current + 1);
      return;
    }

    const submitBooking = async () => {
      setSubmitStatus("submitting");
      setSubmitMessage("");

      try {
        const response = await fetch("/api/pet-boarding-booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...bookingForm,
            subtotal: selectedTotal,
            depositAmount: requiredDeposit,
            status: "Pending Deposit",
            requestedAt: new Date().toISOString(),
          }),
        });
        const responseBody = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            responseBody.error || "Booking request could not be sent."
          );
        }

        setBookingReference(responseBody.bookingId || responseBody.reference || "");
        setBookingStatus("Pending Deposit");
        setSubmitStatus("success");
        setIsConfirmed(true);
        setActiveStep(bookingSteps.length - 1);
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(
          error instanceof Error
            ? error.message
            : "Booking request could not be sent."
        );
      }
    };

    void submitBooking();
  };

  const calendarDays = getCalendarDays(calendarMonth);
  const calendarMonthLabel = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`min-h-screen overflow-x-hidden ${themeClass}`}>
      <nav
        className={`fixed left-0 right-0 top-0 z-40 transition duration-300 ${
          isScrolled
            ? isDark
              ? "bg-[#171614]/90 shadow-lg shadow-black/20 backdrop-blur-xl"
              : "bg-[#f8f3ea]/90 shadow-lg shadow-stone-300/25 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#home" className="font-serif text-2xl tracking-wide">
            Maison Paw
          </a>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <a href="#services">Services</a>
            <a href="#booking">Booking</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDark((current) => !current)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${panelClass}`}
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <a
              href="#booking"
              className="rounded-full bg-[#2d2923] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5"
            >
              Book
            </a>
          </div>
        </div>
      </nav>

      <section id="home" className="relative min-h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=2200&q=85"
          alt="Relaxed dog resting in a premium boarding suite"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[#f8f3ea]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f3ea] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-14 pt-28">
          <div className="max-w-3xl text-white">
            <p className="mb-5 w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.24em] backdrop-blur-xl">
              Boutique pet resort
            </p>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight md:text-8xl">
              Luxury Pet Boarding You Can Trust
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
              Calm suites, trained caretakers, daily updates, secure records,
              and effortless booking for pets who deserve hotel-level care.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#booking"
  className="rounded-full bg-white px-7 py-4 text-center text-sm font-bold text-black mix-blend-screen shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-[#f7f1e8] [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]"
>
                Book a Stay
              </a>
              <a
                href="#contact"
                className="rounded-full border border-white/45 bg-white/10 px-7 py-4 text-center text-sm font-bold text-white bg-clip-text backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/20"
              >
                Schedule Meet & Greet
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 right-5 grid gap-3 md:right-10">
            {["4.98 average rating", "24/7 on-site care", "1,200+ happy stays"].map(
              (badge) => (
                <div
                  key={badge}
                  className="rounded-3xl border border-white/25 bg-white/20 px-5 py-4 text-sm font-semibold text-white shadow-xl shadow-black/20 backdrop-blur-xl"
                >
                  {badge}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <main className={isDark ? "bg-[#171614]" : "bg-[#f8f3ea]"}>
        <section id="services" className="px-5 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                  Services
                </p>
                <h2 className="mt-3 font-serif text-4xl md:text-6xl">
                  Thoughtful care for every routine.
                </h2>
              </div>
              <p className="max-w-md leading-7 opacity-65">
                Pricing previews are transparent, care plans are personal, and
                every stay begins with records, temperament, and routine review.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.name}
                  className={`rounded-[2rem] border p-6 shadow-2xl transition duration-300 hover:-translate-y-1 ${panelClass}`}
                >
                  <div className="mb-10 flex items-center justify-between">
                    <span className="rounded-full border border-current/15 px-4 py-2 text-xs font-bold">
                      {service.icon}
                    </span>
                    <span className="font-semibold">{service.price}</span>
                  </div>
                  <h3 className="font-serif text-2xl">{service.name}</h3>
                  <p className="mt-3 leading-7 opacity-65">{service.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                Why choose us
              </p>
              <h2 className="mt-3 font-serif text-4xl">
                Trust signals where pet parents look first.
              </h2>
            </div>
            <div className="grid gap-4 md:col-span-2 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className={`rounded-3xl border p-5 shadow-xl ${panelClass}`}
                >
                  <span className="mb-4 block h-2 w-10 rounded-full bg-[#9f7f57]" />
                  <p className="font-semibold">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="booking" className="px-5 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className={`rounded-[2rem] border p-6 shadow-2xl ${panelClass}`}>
              <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                Booking system
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Reserve care in a few calm steps.
              </h2>
              <div className="mt-8 grid gap-3">
                {bookingSteps.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      setActiveStep(index);
                      setIsConfirmed(index === bookingSteps.length - 1);
                    }}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      activeStep === index
                        ? "border-[#9f7f57] bg-[#9f7f57] text-white"
                        : "border-current/10 hover:border-[#9f7f57]/50"
                    }`}
                  >
                    <span className="text-sm font-semibold">{step}</span>
                    <span className="text-xs opacity-70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleBookingSubmit}
              className={`rounded-[2rem] border p-5 shadow-2xl md:p-7 ${panelClass}`}
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                    Step {activeStep + 1} of {bookingSteps.length}
                  </p>
                  <h3 className="mt-2 font-serif text-3xl">
                    {bookingSteps[activeStep]}
                  </h3>
                </div>
                <div className="rounded-2xl bg-[#2d2923] px-4 py-3 text-right text-white">
                  <p className="text-xs opacity-70">Estimate</p>
                  <p className="font-bold">${selectedTotal}</p>
                  <p className="text-xs text-white/65">
                    ${requiredDeposit} deposit
                  </p>
                </div>
              </div>

              {activeStep === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={bookingForm.ownerName}
                    onChange={(event) =>
                      updateBookingField("ownerName", event.target.value)
                    }
                    placeholder="Owner full name"
                    className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                  />
                  <input
                    type="email"
                    value={bookingForm.ownerEmail}
                    onChange={(event) =>
                      updateBookingField("ownerEmail", event.target.value)
                    }
                    placeholder="Email for confirmation"
                    className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                  />
                  <input
                    value={bookingForm.ownerPhone}
                    onChange={(event) =>
                      updateBookingField("ownerPhone", event.target.value)
                    }
                    placeholder="Mobile phone"
                    className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40 sm:col-span-2"
                  />
                </div>
              )}

              {activeStep === 1 && (
                <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Dog", "Cat", "Multiple Pets"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updatePetType(type)}
                      aria-pressed={bookingForm.petType === type}
                      className={`relative rounded-2xl border px-4 py-5 font-semibold transition duration-200 ${
                        bookingForm.petType === type
                          ? "border-[#9f7f57] bg-[#9f7f57] text-white shadow-xl shadow-[#9f7f57]/30 ring-4 ring-[#9f7f57]/20"
                          : "border-current/10 hover:border-[#9f7f57]/60 hover:bg-[#9f7f57]/10"
                      }`}
                    >
                      <span>{type}</span>
                      {bookingForm.petType === type && (
                        <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={bookingForm.petName}
                      onChange={(event) =>
                        updateBookingField("petName", event.target.value)
                      }
                      placeholder="Pet name"
                      className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                    />
                    <input
                      value={bookingForm.petBreed}
                      onChange={(event) =>
                        updateBookingField("petBreed", event.target.value)
                      }
                      placeholder="Breed"
                      className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                    />
                    <input
                      value={bookingForm.petAge}
                      onChange={(event) =>
                        updateBookingField("petAge", event.target.value)
                      }
                      placeholder="Age"
                      className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                    />
                    <input
                      value={bookingForm.petWeight}
                      onChange={(event) =>
                        updateBookingField("petWeight", event.target.value)
                      }
                      placeholder="Weight"
                      className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                    />
                    <input
                      value={bookingForm.petTemperament}
                      onChange={(event) =>
                        updateBookingField("petTemperament", event.target.value)
                      }
                      placeholder="Temperament"
                      className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40 sm:col-span-2"
                    />
                  </div>
                  {bookingForm.petType === "Multiple Pets" && (
                    <div className="grid gap-4 rounded-3xl border border-current/10 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">Additional pets</p>
                          <p className="text-sm opacity-60">
                            Add each extra overnight guest so the estimate stays
                            accurate.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addExtraPet}
                          className="w-fit rounded-full bg-[#2d2923] px-5 py-3 text-sm font-semibold text-white"
                        >
                          Add Another Pet
                        </button>
                      </div>

                      {bookingForm.extraPets.map((pet, index) => (
                        <div
                          key={pet.id}
                          className="grid gap-3 rounded-3xl border border-current/10 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">
                              Pet {index + 2}
                            </p>
                            {bookingForm.extraPets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExtraPet(pet.id)}
                                className="text-sm font-semibold text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-5">
                            <select
                              value={pet.animalType}
                              onChange={(event) =>
                                updateExtraPet(
                                  pet.id,
                                  "animalType",
                                  event.target.value
                                )
                              }
                              className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none"
                            >
                              <option>Dog</option>
                              <option>Cat</option>
                            </select>
                            <input
                              value={pet.name}
                              onChange={(event) =>
                                updateExtraPet(pet.id, "name", event.target.value)
                              }
                              placeholder="Name"
                              className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                            />
                            <input
                              value={pet.breed}
                              onChange={(event) =>
                                updateExtraPet(
                                  pet.id,
                                  "breed",
                                  event.target.value
                                )
                              }
                              placeholder="Breed"
                              className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                            />
                            <input
                              value={pet.age}
                              onChange={(event) =>
                                updateExtraPet(pet.id, "age", event.target.value)
                              }
                              placeholder="Age"
                              className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                            />
                            <input
                              value={pet.weight}
                              onChange={(event) =>
                                updateExtraPet(
                                  pet.id,
                                  "weight",
                                  event.target.value
                                )
                              }
                              placeholder="Weight"
                              className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeStep === 2 && (
                <div className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => {
                      const isSelected =
                        bookingForm.serviceType === service.name;
                      const dogRate =
                        serviceRates[
                          service.name as BookingForm["serviceType"]
                        ].Dog;
                      const catRate =
                        serviceRates[
                          service.name as BookingForm["serviceType"]
                        ].Cat;

                      return (
                        <button
                          key={service.name}
                          type="button"
                          onClick={() =>
                            updateServiceType(
                              service.name as BookingForm["serviceType"]
                            )
                          }
                          aria-pressed={isSelected}
                          className={`rounded-3xl border p-5 text-left transition duration-200 ${
                            isSelected
                              ? "border-[#9f7f57] bg-[#9f7f57] text-white shadow-xl shadow-[#9f7f57]/30 ring-4 ring-[#9f7f57]/20"
                              : "border-current/10 hover:border-[#9f7f57]/60 hover:bg-[#9f7f57]/10"
                          }`}
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span>
                              <span className="block text-xs uppercase tracking-[0.18em] opacity-65">
                                {service.icon}
                              </span>
                              <span className="mt-3 block font-serif text-3xl">
                                {service.name}
                              </span>
                            </span>
                            {isSelected && (
                              <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                                Selected
                              </span>
                            )}
                          </span>
                          <span className="mt-4 block leading-7 opacity-75">
                            {service.detail}
                          </span>
                          <span className="mt-5 block rounded-2xl bg-black/10 px-4 py-3 text-sm font-semibold">
                            Dog ${dogRate} | Cat ${catRate}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-3xl border border-current/10 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm opacity-60">Selected service</p>
                        <h4 className="font-serif text-3xl">
                          {bookingForm.serviceType}
                        </h4>
                        <p className="mt-2 leading-7 opacity-65">
                          {bookingForm.serviceType === "Overnight Boarding"
                            ? "Your pet stays with us."
                            : "Your pet stays at the owner's house and we come to them."}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#2d2923] px-5 py-4 text-right text-white">
                        <p className="text-sm text-white/70">
                          {bookingForm.serviceType === "Overnight Boarding"
                            ? "Nightly rate"
                            : "Daily visit rate"}
                        </p>
                        <p className="text-2xl font-bold">${nightlyTotal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-current/10 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] opacity-50">
                        Drop-off date
                      </p>
                      <p className="mt-2 font-semibold">
                        {formatWrittenDate(bookingForm.startDate) ||
                          "Select the first calendar date"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-current/10 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] opacity-50">
                        Pick-up date
                      </p>
                      <p className="mt-2 font-semibold">
                        {formatWrittenDate(bookingForm.endDate) ||
                          "Select the second calendar date"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-current/10 p-4 sm:p-6">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(
                            (current) =>
                              new Date(
                                current.getFullYear(),
                                current.getMonth() - 1,
                                1
                              )
                          )
                        }
                        className="rounded-full border border-current/10 px-4 py-2 font-semibold"
                      >
                        Prev
                      </button>
                      <h4 className="text-center font-serif text-2xl">
                        {calendarMonthLabel}
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(
                            (current) =>
                              new Date(
                                current.getFullYear(),
                                current.getMonth() + 1,
                                1
                              )
                          )
                        }
                        className="rounded-full border border-current/10 px-4 py-2 font-semibold"
                      >
                        Next
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold opacity-60">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <span key={day} className="py-2">
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 overflow-hidden rounded-3xl">
                      {calendarDays.map((day, index) => {
                        if (!day) {
                          return (
                            <span
                              key={`blank-${index}`}
                              className="min-h-12 sm:min-h-14"
                            />
                          );
                        }

                        const isStart = bookingForm.startDate === day.key;
                        const isEnd = bookingForm.endDate === day.key;
                        const isInRange =
                          Boolean(bookingForm.startDate) &&
                          Boolean(bookingForm.endDate) &&
                          day.key > bookingForm.startDate &&
                          day.key < bookingForm.endDate;
                        const isSelected = isStart || isEnd;
                        const rangeFillColor = isDark
                          ? "rgba(35, 91, 184, 0.42)"
                          : "rgba(15, 74, 173, 0.12)";
                        const cellBackground =
                          isInRange
                            ? rangeFillColor
                            : isStart && bookingForm.endDate
                              ? `linear-gradient(to right, transparent 0 50%, ${rangeFillColor} 50% 100%)`
                              : isEnd && bookingForm.startDate
                                ? `linear-gradient(to right, ${rangeFillColor} 0 50%, transparent 50% 100%)`
                                : "transparent";

                        return (
                          <div
                            key={day.key}
                            className="grid min-h-12 place-items-center sm:min-h-14"
                            style={{
                              background: cellBackground,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleCalendarDateClick(day.key)}
                              className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition hover:bg-[#9f7f57]/15 sm:h-12 sm:w-12 sm:text-base"
                              style={{
                                backgroundColor: isSelected
                                  ? "#0f4aad"
                                  : "transparent",
                                color: isSelected
                                  ? "#ffffff"
                                  : isInRange
                                    ? isDark
                                      ? "#ffffff"
                                      : "#0f4aad"
                                    : "inherit",
                                boxShadow: isSelected
                                  ? "0 14px 28px rgba(15, 74, 173, 0.35)"
                                  : "none",
                              }}
                            >
                              {day.day}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-sm leading-6 opacity-65">
                    First click selects the drop-off date. Second click selects
                    the pick-up date. Click a new date after both are selected
                    to start over.
                  </p>
                </div>
              )}

              {activeStep === 4 && (
                <label className="block rounded-3xl border border-dashed border-current/20 p-8 text-center">
                  <span className="block font-serif text-2xl">
                    Upload vaccination records
                  </span>
                  <span className="mt-2 block text-sm opacity-65">
                    {bookingForm.vaccinationFile ||
                      "PDF, JPG, or PNG records can be connected to Cloudinary later."}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}

              {activeStep === 5 && (
                <textarea
                  value={bookingForm.careNotes}
                  onChange={(event) =>
                    updateBookingField("careNotes", event.target.value)
                  }
                  placeholder="Feeding schedule, medication instructions, bedtime routine, allergies, favorite toys..."
                  rows={7}
                  className="w-full rounded-3xl border border-current/10 bg-transparent px-5 py-4 leading-7 outline-none placeholder:text-current/40"
                />
              )}

              {activeStep === 6 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={bookingForm.emergencyName}
                    onChange={(event) =>
                      updateBookingField("emergencyName", event.target.value)
                    }
                    placeholder="Emergency contact name"
                    className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                  />
                  <input
                    value={bookingForm.emergencyPhone}
                    onChange={(event) =>
                      updateBookingField("emergencyPhone", event.target.value)
                    }
                    placeholder="Emergency phone"
                    className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                  />
                </div>
              )}

              {activeStep === 7 && (
                <div className="grid gap-4">
                  <div className="rounded-3xl border border-current/10 p-5">
                    <p className="text-sm opacity-60">Reservation summary</p>
                    <h4 className="mt-2 font-serif text-2xl">
                      {bookingForm.petName || bookingForm.petType} stay with{" "}
                      {bookingForm.services.join(", ")}
                    </h4>
                    <p className="mt-3 text-sm leading-6 opacity-65">
                      {bookingForm.startDate || "Check-in TBD"} to{" "}
                      {bookingForm.endDate || "check-out TBD"} | Vaccines:{" "}
                      {bookingForm.vaccinationFile || "pending upload"}
                    </p>
                    <p className="mt-3 text-sm leading-6 opacity-65">
                      Owner: {bookingForm.ownerName || "Not provided"} |{" "}
                      {bookingForm.ownerEmail || "email pending"}
                    </p>
                    <div className="mt-5 grid gap-2 rounded-2xl bg-[#2d2923] p-4 text-white">
                      <div className="flex justify-between gap-4">
                        <span>Estimated stay total</span>
                        <strong>${selectedTotal}</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Required deposit</span>
                        <strong>${requiredDeposit}</strong>
                      </div>
                      <p className="text-sm text-white/65">
                        Status after submission: Pending Deposit
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-semibold">
                      Preferred manual deposit method
                    </p>
                    <div className="grid gap-3 sm:grid-cols-5">
                      {paymentMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            updateBookingField("paymentMethod", method)
                          }
                          aria-pressed={bookingForm.paymentMethod === method}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-200 ${
                            bookingForm.paymentMethod === method
                              ? "border-[#9f7f57] bg-[#9f7f57] text-white shadow-xl shadow-[#9f7f57]/30 ring-4 ring-[#9f7f57]/20"
                              : "border-current/10 hover:border-[#9f7f57]/60 hover:bg-[#9f7f57]/10"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                  {submitStatus === "error" && submitMessage && (
                    <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitMessage}
                    </p>
                  )}
                </div>
              )}

              {isConfirmed && activeStep === 8 && (
                <div className="rounded-3xl bg-[#2d2923] p-7 text-white">
                  <p className="text-xs uppercase tracking-[0.24em] opacity-60">
                    Booking confirmation
                  </p>
                  <h4 className="mt-3 font-serif text-3xl">
                    Your request is Pending Deposit.
                  </h4>
                  <p className="mt-3 leading-7 text-white/70">
                    We sent your confirmation email with booking details and
                    manual payment instructions. Your stay is held as Pending
                    Deposit until the admin confirms receipt.
                  </p>
                  <div className="mt-6 grid gap-3 rounded-2xl bg-white/10 p-4 text-sm">
                    <p>Reference: {bookingReference || "Pending reference"}</p>
                    <p>Status: {bookingStatus}</p>
                    <p>Deposit due: ${requiredDeposit}</p>
                    <p>Preferred method: {bookingForm.paymentMethod}</p>
                    <p>
                      Instructions: send the deposit with your pet name and
                      reservation dates in the memo. Accepted methods: Zelle,
                      Venmo, Cash App, Apple Pay, or another method arranged
                      with staff.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setActiveStep((current) => Math.max(current - 1, 0))
                  }
                  className="rounded-full border border-current/15 px-6 py-3 font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#2d2923] px-6 py-3 font-semibold text-white"
                  disabled={submitStatus === "submitting"}
                >
                  {submitStatus === "submitting"
                    ? "Sending..."
                    : activeStep >= 7
                      ? "Request Booking"
                      : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section id="dashboard" className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                Client dashboard
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-6xl">
                Everything pet parents need after booking.
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className={`rounded-[2rem] border p-6 shadow-2xl ${panelClass}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm opacity-60">Upcoming reservation</p>
                    <h3 className="font-serif text-3xl">Maple | Garden Suite</h3>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white">
                    Confirmed
                  </span>
                </div>
                <div className="mt-6 grid gap-2 rounded-3xl border border-current/10 p-4">
                  <p className="text-sm font-semibold">Admin booking statuses</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingStatuses.map((status) => (
                      <span
                        key={status}
                        className={`rounded-full px-3 py-2 text-xs font-semibold ${
                          status === "Pending Deposit"
                            ? "bg-[#9f7f57] text-white"
                            : "bg-current/10"
                        }`}
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["Upload pet documents", "View invoices", "Message staff"].map(
                    (action) => (
                      <button
                        key={action}
                        type="button"
                        className="rounded-2xl border border-current/10 px-4 py-4 text-left text-sm font-semibold transition hover:border-[#9f7f57]"
                      >
                        {action}
                      </button>
                    )
                  )}
                </div>
                <div className="mt-6 rounded-3xl bg-[#2d2923] p-5 text-white">
                  <p className="text-sm text-white/60">Today at 2:14 PM</p>
                  <p className="mt-2 leading-7">
                    Maple finished a supervised play session, ate lunch, and is
                    resting in her suite. Three photos added.
                  </p>
                </div>
              </div>

              <div className={`rounded-[2rem] border p-6 shadow-2xl ${panelClass}`}>
                <h3 className="font-serif text-3xl">Pet profiles</h3>
                <div className="mt-5 grid gap-4">
                  {petProfiles.map((pet) => (
                    <article
                      key={pet.name}
                      className="grid grid-cols-[84px_1fr] gap-4 rounded-3xl border border-current/10 p-3"
                    >
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                      <div>
                        <h4 className="font-serif text-2xl">{pet.name}</h4>
                        <p className="text-sm opacity-65">
                          {pet.breed} | {pet.age} | {pet.weight}
                        </p>
                        <p className="mt-2 text-xs leading-5 opacity-65">
                          {pet.temperament}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-2">
              {petProfiles.map((pet) => (
                <article
                  key={pet.name}
                  className={`overflow-hidden rounded-[2rem] border shadow-2xl ${panelClass}`}
                >
                  <img
                    src={pet.image}
                    alt={`${pet.name} profile`}
                    className="h-72 w-full object-cover"
                  />
                  <div className="grid gap-3 p-6 text-sm">
                    <h3 className="font-serif text-3xl">{pet.name}</h3>
                    <p>{pet.medicalNeeds}</p>
                    <p>Vaccination: {pet.vaccinationStatus}</p>
                    <p>Feeding: {pet.feedingSchedule}</p>
                    <p className="opacity-65">{pet.favoriteNotes}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                Testimonials
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-6xl">
                Calm owners. Happy pets.
              </h2>
              <div className="mt-6 flex gap-2">
                {testimonials.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeTestimonial === index
                        ? "w-10 bg-[#9f7f57]"
                        : "w-2.5 bg-current/25"
                    }`}
                    aria-label={`Show testimonial from ${item.name}`}
                  />
                ))}
              </div>
            </div>
            <article className={`rounded-[2rem] border p-5 shadow-2xl ${panelClass}`}>
              <img
                src={testimonials[activeTestimonial].image}
                alt={testimonials[activeTestimonial].pet}
                className="h-80 w-full rounded-[1.5rem] object-cover"
              />
              <p className="mt-6 font-serif text-3xl leading-tight">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <p className="mt-5 font-semibold">
                {testimonials[activeTestimonial].name} |{" "}
                {testimonials[activeTestimonial].pet}
              </p>
            </article>
          </div>
        </section>

        <section id="gallery" className="px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.24em] opacity-55">
              Gallery
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-6xl">
              Suites, play, walks, and quiet moments.
            </h2>
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {galleryImages.map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`Maison Paw gallery ${index + 1}`}
                  className={`mb-5 w-full break-inside-avoid rounded-[2rem] object-cover shadow-2xl ${
                    index % 3 === 0 ? "h-96" : "h-72"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                FAQ
              </p>
              <h2 className="mt-3 font-serif text-4xl md:text-6xl">
                Clear answers before the first stay.
              </h2>
            </div>
            <div className="grid gap-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className={`rounded-3xl border p-5 shadow-xl ${panelClass}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq((current) => (current === index ? null : index))
                    }
                    className="flex w-full items-center justify-between gap-4 text-left font-semibold"
                  >
                    <span>{faq.question}</span>
                    <span>{openFaq === index ? "-" : "+"}</span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${
                      openFaq === index
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <p className="overflow-hidden pt-4 leading-7 opacity-65">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="px-5 py-20 pb-28">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className={`rounded-[2rem] border p-6 shadow-2xl ${panelClass}`}>
              <p className="text-xs uppercase tracking-[0.24em] opacity-55">
                Contact
              </p>
              <h2 className="mt-3 font-serif text-4xl">
                Schedule a meet and greet.
              </h2>
              <form className="mt-6 grid gap-4">
                <input
                  placeholder="Name"
                  className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                />
                <input
                  placeholder="Email"
                  className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                />
                <textarea
                  rows={4}
                  placeholder="Tell us about your pet"
                  className="rounded-2xl border border-current/10 bg-transparent px-4 py-4 outline-none placeholder:text-current/40"
                />
                <button
                  type="button"
                  className="rounded-full bg-[#2d2923] px-6 py-4 font-semibold text-white"
                >
                  Send Request
                </button>
              </form>
            </div>
            <div className="grid gap-5">
              <div className={`rounded-[2rem] border p-6 shadow-2xl ${panelClass}`}>
                <h3 className="font-serif text-3xl">Visit Maison Paw</h3>
                <p className="mt-3 leading-7 opacity-65">
                  212 Laurel Canyon Way, Los Angeles, CA
                  <br />
                  Monday to Sunday, 7 AM to 8 PM
                  <br />
                  (323) 555-0147
                </p>
              </div>
              <div className="min-h-72 rounded-[2rem] bg-[#d8c8b3] p-6 text-[#2d2923] shadow-2xl">
                <p className="text-xs uppercase tracking-[0.24em] opacity-60">
                  Map preview
                </p>
                <div className="mt-10 grid place-items-center rounded-[1.5rem] border border-[#2d2923]/15 bg-white/35 py-16 text-center backdrop-blur">
                  <p className="font-serif text-3xl">Los Angeles</p>
                  <p className="mt-2 text-sm opacity-65">
                    Google Maps embed can be added here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <a
        href="#booking"
        className="fixed bottom-4 left-4 right-4 z-40 rounded-full bg-[#2d2923] px-6 py-4 text-center font-bold text-white shadow-2xl shadow-black/25 md:hidden"
      >
        Book a Stay
      </a>
    </div>
  );
}

export default LuxuryPetBoarding;
