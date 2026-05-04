import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Service = {
  name: string;
  price: number;
  duration: number;
};

type Booking = {
  id: number;
  name: string;
  contact: string;
  barber: string;
  services: string[];
  date: string;
  time: string;
  duration: number;
};

type SquareCard = {
  attach: (selector: string) => Promise<void>;
  destroy: () => Promise<boolean>;
  tokenize: () => Promise<{
    status: string;
    token?: string;
    errors?: Array<{ message?: string }>;
  }>;
};

const services: Service[] = [
  { name: "Signature Cut", price: 45, duration: 60 },
  { name: "Skin Fade", price: 50, duration: 60 },
  { name: "Beard Trim", price: 25, duration: 30 },
  { name: "Hot Towel Shave", price: 40, duration: 45 },
];

const barbers = [
  {
    name: "Brady Adams",
    role: "Founder / Master Barber",
    specialty: "Clean fades, textured cuts, modern classics",
  },
  {
    name: "Marcus Lee",
    role: "Senior Barber",
    specialty: "Beards, lineups, sharp traditional cuts",
  },
  {
    name: "Theo Grant",
    role: "Stylist",
    specialty: "Longer styles, scissor cuts, natural flow",
  },
];

const seededBookings: Booking[] = [
  {
    id: 1,
    name: "Daniel R.",
    contact: "daniel@example.com",
    barber: "Brady Adams",
    services: ["Signature Cut"],
    date: "2026-06-08",
    time: "10:00",
    duration: 45,
  },
  {
    id: 2,
    name: "Maya C.",
    contact: "maya@example.com",
    barber: "Marcus Lee",
    services: ["Skin Fade", "Beard Trim"],
    date: "2026-06-08",
    time: "13:30",
    duration: 85,
  },
];

const storageKey = "curate-bookings";
const squareScriptId = "square-web-payments-sdk";

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => {
        card: () => Promise<SquareCard>;
      };
    };
  }
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTime(time: string) {
  return new Date(`2026-01-01T${time}:00`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function timesOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number
) {
  return startA < startB + durationB && startA + durationA > startB;
}

export default function Curate() {
  const squareCardRef = useRef<SquareCard | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(seededBookings);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    contact: "",
    barber: "",
    serviceSelections: [""],
    date: "",
    time: "",
  });
  const [bookingMessage, setBookingMessage] = useState("");
  const [openServicePicker, setOpenServicePicker] = useState<number | null>(
    null
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSquareLoading, setIsSquareLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const storedBookings = window.localStorage.getItem(storageKey);

    if (storedBookings) {
      setBookings([...seededBookings, ...JSON.parse(storedBookings)]);
    }
  }, []);

  useEffect(() => {
    if (!isCheckoutOpen) {
      return;
    }

    const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
    const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;
    const squareEnvironment =
      import.meta.env.VITE_SQUARE_ENVIRONMENT === "production"
        ? "production"
        : "sandbox";
    const scriptUrl =
      squareEnvironment === "production"
        ? "https://web.squarecdn.com/v1/square.js"
        : "https://sandbox.web.squarecdn.com/v1/square.js";
    let isMounted = true;

    const loadSquareScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.Square) {
          resolve();
          return;
        }

        const existingScript = document.getElementById(squareScriptId);

        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
          existingScript.addEventListener("error", () => reject(), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.id = squareScriptId;
        script.src = scriptUrl;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });

    const initializeSquareCard = async () => {
      try {
        setIsSquareLoading(true);
        setCheckoutError("");

        const missingPublicCredentials = [
          !applicationId ? "VITE_SQUARE_APPLICATION_ID" : "",
          !locationId ? "VITE_SQUARE_LOCATION_ID" : "",
        ].filter(Boolean);

        if (missingPublicCredentials.length) {
          throw new Error(
            `Square checkout is missing: ${missingPublicCredentials.join(", ")}`
          );
        }

        await loadSquareScript();

        if (!window.Square || !isMounted) {
          return;
        }

        const payments = window.Square.payments(applicationId, locationId);
        const card = await payments.card();
        await card.attach("#square-card-container");

        if (isMounted) {
          squareCardRef.current = card;
        } else {
          await card.destroy();
        }
      } catch (error) {
        console.error(error);
        setCheckoutError(
          error instanceof Error
            ? error.message
            : "Square checkout could not load. Check the Square environment variables."
        );
      } finally {
        if (isMounted) {
          setIsSquareLoading(false);
        }
      }
    };

    initializeSquareCard();

    return () => {
      isMounted = false;
      squareCardRef.current?.destroy().catch(console.error);
      squareCardRef.current = null;
    };
  }, [isCheckoutOpen]);

  const selectedServices = useMemo(
    () =>
      bookingForm.serviceSelections
        .map((serviceName) =>
          services.find((service) => service.name === serviceName)
        )
        .filter((service): service is Service => Boolean(service)),
    [bookingForm.serviceSelections]
  );

  const totalDuration = selectedServices.reduce(
    (total, service) => total + service.duration,
    0
  );

  const totalPrice = selectedServices.reduce(
    (total, service) => total + service.price,
    0
  );

  const availableTimes = useMemo(() => {
    if (!bookingForm.date || !bookingForm.barber || !totalDuration) {
      return [];
    }

    const dayStart = 10 * 60;
    const dayEnd = 19 * 60;
    const slotStep = 30;
    const sameDayBookings = bookings.filter(
      (booking) =>
        booking.date === bookingForm.date &&
        booking.barber === bookingForm.barber
    );
    const slots: string[] = [];

    for (
      let slotStart = dayStart;
      slotStart + totalDuration <= dayEnd;
      slotStart += slotStep
    ) {
      const hasConflict = sameDayBookings.some((booking) =>
        timesOverlap(
          slotStart,
          totalDuration,
          timeToMinutes(booking.time),
          booking.duration
        )
      );

      if (!hasConflict) {
        slots.push(minutesToTime(slotStart));
      }
    }

    return slots;
  }, [bookingForm.barber, bookingForm.date, bookings, totalDuration]);

  const updateServiceSelection = (index: number, serviceName: string) => {
    if (
      serviceName &&
      bookingForm.serviceSelections.some(
        (selectedServiceName, selectedIndex) =>
          selectedIndex !== index && selectedServiceName === serviceName
      )
    ) {
      setBookingMessage("That service is already selected.");
      setOpenServicePicker(null);
      return;
    }

    setBookingForm((currentForm) => {
      const nextSelections = [...currentForm.serviceSelections];
      nextSelections[index] = serviceName;

      return {
        ...currentForm,
        serviceSelections: nextSelections,
        time: "",
      };
    });
    setOpenServicePicker(null);
    setBookingMessage("");
  };

  const addServiceSelection = () => {
    setBookingForm((currentForm) => ({
      ...currentForm,
      serviceSelections: [...currentForm.serviceSelections, ""],
      time: "",
    }));
  };

  const removeServiceSelection = (index: number) => {
    setBookingForm((currentForm) => ({
      ...currentForm,
      serviceSelections: currentForm.serviceSelections.filter(
        (_, serviceIndex) => serviceIndex !== index
      ),
      time: "",
    }));
  };

  const handleBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !bookingForm.name ||
      !bookingForm.contact ||
      !bookingForm.barber ||
      !bookingForm.date ||
      !bookingForm.time ||
      selectedServices.length === 0
    ) {
      setBookingMessage("Please complete every booking detail.");
      return;
    }

    if (new Set(bookingForm.serviceSelections.filter(Boolean)).size !== selectedServices.length) {
      setBookingMessage("Remove duplicate services before booking.");
      return;
    }

    if (!availableTimes.includes(bookingForm.time)) {
      setBookingMessage("That time is no longer available. Choose another slot.");
      return;
    }

    setBookingMessage("");
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!squareCardRef.current) {
      setCheckoutError("Square checkout is still loading.");
      return;
    }

    if (!availableTimes.includes(bookingForm.time)) {
      setIsCheckoutOpen(false);
      setBookingMessage("That time is no longer available. Choose another slot.");
      return;
    }

    setCheckoutError("");
    setIsSquareLoading(true);

    try {
      const tokenResult = await squareCardRef.current.tokenize();

      if (tokenResult.status !== "OK" || !tokenResult.token) {
        setCheckoutError(
          tokenResult.errors?.[0]?.message ||
            "Card details could not be verified."
        );
        setIsSquareLoading(false);
        return;
      }

      const paymentResponse = await fetch("/api/square-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          amount: totalPrice,
          booking: {
            name: bookingForm.name,
            contact: bookingForm.contact,
            barber: bookingForm.barber,
            services: selectedServices.map((service) => service.name),
            date: bookingForm.date,
            time: bookingForm.time,
            duration: totalDuration,
          },
        }),
      });

      if (!paymentResponse.ok) {
        const responseBody = await paymentResponse.json().catch(() => ({}));
        setCheckoutError(
          responseBody.error ||
            "Payment could not be completed. Please try again."
        );
        setIsSquareLoading(false);
        return;
      }
    } catch (error) {
      console.error(error);
      setCheckoutError("Payment could not be completed. Please try again.");
      setIsSquareLoading(false);
      return;
    }

    const nextBooking: Booking = {
      id: Date.now(),
      name: bookingForm.name,
      contact: bookingForm.contact,
      barber: bookingForm.barber,
      services: selectedServices.map((service) => service.name),
      date: bookingForm.date,
      time: bookingForm.time,
      duration: totalDuration,
    };
    const storedBookings = JSON.parse(
      window.localStorage.getItem(storageKey) || "[]"
    ) as Booking[];
    const nextStoredBookings = [...storedBookings, nextBooking];

    window.localStorage.setItem(storageKey, JSON.stringify(nextStoredBookings));
    setBookings([...seededBookings, ...nextStoredBookings]);
    setBookingForm({
      name: "",
      contact: "",
      barber: "",
      serviceSelections: [""],
      date: "",
      time: "",
    });
    setBookingMessage(
      `Booked for ${formatTime(nextBooking.time)} on ${nextBooking.date}.`
    );
    setIsSquareLoading(false);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden px-6">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 scale-110"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2000&q=80')",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Solid Tint */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Glow Effects */}
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-white/10 blur-[130px]" />

        {/* Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-[#0b0b0b]" />

        <header className="relative z-10 flex items-center justify-between py-6">
          <div>
            <p className="text-3xl font-black tracking-tight">CURATE</p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
              By Brady Adams
            </p>
          </div>

          <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] text-white/70 md:flex">
            <a href="#services">Services</a>
            <a href="#team">Barbers</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>

          <a
            href="#booking"
            className="border border-white px-5 py-3 text-xs uppercase tracking-[0.18em] hover:bg-white hover:text-black"
          >
            Book Now
          </a>
        </header>

        <div className="relative z-10 flex min-h-[80vh] items-center">
          <div className="max-w-5xl">
            <h1 className="text-6xl font-black uppercase leading-none md:text-9xl">
              Sharp Cuts.
              <br />
              Clean Culture.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-white/70">
              A modern barbershop built for precision cuts, clean fades, beard
              work, and an elevated grooming experience.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#booking"
                className="bg-white px-8 py-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-black hover:bg-white/80"
              >
                Book Appointment
              </a>

              <a
                href="#services"
                className="border border-white/40 px-8 py-4 text-center text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      <section className="border-y border-white/10 bg-black px-6 py-5">
        <div className="mx-auto grid max-w-7xl gap-6 text-sm text-white/70 md:grid-cols-3">
          <p>
            <span className="text-white">Location:</span> 124 Melrose Ave, Los
            Angeles, CA
          </p>
          <p>
            <span className="text-white">Hours:</span> Daily 10AM-7PM
          </p>
          <p>
            <span className="text-white">Phone:</span> (323) 555-0198
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative overflow-hidden px-6 py-24">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-white/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40">
            Services & Pricing
          </p>

          <h2 className="mb-12 text-4xl font-bold md:text-6xl">
            Straightforward cuts. Clear pricing.
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.name}
                className="group flex items-center justify-between border border-white/10 bg-black p-6 transition duration-300 hover:-translate-y-1 hover:bg-yellow-500 hover:text-black"
              >
                <p className="text-xl transition group-hover:text-black">
                  {service.name}
                </p>
                <p className="text-xl text-white/60 transition group-hover:text-black">
                  ${service.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARALLAX IMAGE BREAK */}
      <section className="relative h-[65vh] overflow-hidden">
        <div
          className="absolute inset-[-10%] bg-cover bg-center bg-fixed grayscale"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          <h2 className="max-w-5xl text-5xl font-black uppercase leading-none md:text-8xl pb-4">
            Precision in every detail.
          </h2>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="bg-white px-6 py-24 text-black">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-black/50">
              Online Booking
            </p>

            <h2 className="text-4xl font-black uppercase md:text-6xl">
              Book your chair in seconds.
            </h2>

            <p className="mt-6 max-w-xl text-black/60">
              Choose your barber, service, and preferred time. No calls. No
              waiting. Just clean scheduling.
            </p>
          </div>

          <form
            onSubmit={handleBookingSubmit}
            className="border border-black/20 p-6 shadow-2xl"
          >
            <div className="grid gap-4">
              <input
                placeholder="Name"
                value={bookingForm.name}
                onChange={(event) =>
                  setBookingForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
                className="border border-black/20 px-4 py-4 outline-none"
              />
              <input
                placeholder="Phone / Email"
                value={bookingForm.contact}
                onChange={(event) =>
                  setBookingForm((currentForm) => ({
                    ...currentForm,
                    contact: event.target.value,
                  }))
                }
                className="border border-black/20 px-4 py-4 outline-none"
              />

              <div className="grid gap-3">
                {bookingForm.serviceSelections.map((serviceName, index) => (
                  <div
                    key={`service-${index}`}
                    className="grid gap-2 sm:grid-cols-[1fr_auto]"
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenServicePicker((currentOpenPicker) =>
                            currentOpenPicker === index ? null : index
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 border border-black/20 bg-white px-4 py-4 text-left outline-none"
                      >
                        <span className={serviceName ? "text-black" : "text-black/50"}>
                          {serviceName || "Select Service"}
                        </span>
                        <span className="flex items-center gap-5">
                          <span className="text-sm font-bold text-black/50">
                        {serviceName
                          ? `$${services.find((service) => service.name === serviceName)?.price}`
                          : ""}
                          </span>
                          <span className="text-black/40">v</span>
                        </span>
                      </button>

                      {openServicePicker === index && (
                        <div className="absolute left-0 right-0 top-full z-30 border border-t-0 border-black/20 bg-white shadow-xl">
                          {services
                            .filter(
                              (service) =>
                                service.name === serviceName ||
                                !bookingForm.serviceSelections.includes(
                                  service.name
                                )
                            )
                            .map((service) => (
                              <button
                                key={service.name}
                                type="button"
                                onClick={() =>
                                  updateServiceSelection(index, service.name)
                                }
                                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-black hover:text-white"
                              >
                                <span>{service.name}</span>
                                <span className="font-bold">
                                  ${service.price}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {bookingForm.serviceSelections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeServiceSelection(index)}
                        className="border border-black/20 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black/60 hover:bg-black hover:text-white"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                {selectedServices.length > 0 && (
                  <button
                    type="button"
                    onClick={addServiceSelection}
                    className="w-fit border border-black px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] hover:bg-black hover:text-white"
                  >
                    Add Another Service
                  </button>
                )}
              </div>

              <select
                value={bookingForm.barber}
                onChange={(event) =>
                  setBookingForm((currentForm) => ({
                    ...currentForm,
                    barber: event.target.value,
                    time: "",
                  }))
                }
                className="border border-black/20 px-4 py-4 outline-none"
              >
                <option>Select Barber</option>
                {barbers.map((barber) => (
                  <option key={barber.name}>{barber.name}</option>
                ))}
              </select>

              <input
                type="date"
                min={getTodayDate()}
                value={bookingForm.date}
                onChange={(event) =>
                  setBookingForm((currentForm) => ({
                    ...currentForm,
                    date: event.target.value,
                    time: "",
                  }))
                }
                className="border border-black/20 px-4 py-4 outline-none"
              />

              <select
                value={bookingForm.time}
                onChange={(event) =>
                  setBookingForm((currentForm) => ({
                    ...currentForm,
                    time: event.target.value,
                  }))
                }
                disabled={!availableTimes.length}
                className="border border-black/20 px-4 py-4 outline-none disabled:bg-black/5 disabled:text-black/40"
              >
                <option value="">
                  {bookingForm.date && bookingForm.barber && totalDuration
                    ? "Select Time"
                    : "Select service, barber, and date first"}
                </option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {formatTime(time)}
                  </option>
                ))}
              </select>

              {selectedServices.length > 0 && (
                <div className="border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70">
                  <div className="flex justify-between gap-4">
                    <span>Total</span>
                    <span className="font-bold text-black">${totalPrice}</span>
                  </div>
                  <div className="mt-2 flex justify-between gap-4">
                    <span>Estimated duration</span>
                    <span className="font-bold text-black">
                      {totalDuration} min
                    </span>
                  </div>
                </div>
              )}

              {bookingMessage && (
                <p className="border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/70">
                  {bookingMessage}
                </p>
              )}

              <button
                type="submit"
                className="bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white"
              >
                Request Booking
              </button>
            </div>
          </form>
        </div>
      </section>

      {isCheckoutOpen && (
        <div
          className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 px-5 text-black"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <form
            onSubmit={handleCheckoutSubmit}
            className="grid max-h-[90vh] w-full max-w-2xl gap-6 overflow-y-auto bg-white p-6 shadow-2xl md:p-8 rounded-lg border border-black/20"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/45">
                  Checkout
                </p>
                <h3 className="mt-2 text-3xl font-black uppercase">
                  Secure your chair.
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="border border-black/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black/60 hover:bg-black hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="border border-black/10 bg-black/[0.03] p-4 text-sm text-black/70">
              <div className="flex justify-between gap-4">
                <span>{selectedServices.map((service) => service.name).join(", ")}</span>
                <span className="font-bold text-black">${totalPrice}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span>
                  {bookingForm.barber} · {bookingForm.date} ·{" "}
                  {bookingForm.time ? formatTime(bookingForm.time) : ""}
                </span>
                <span className="font-bold text-black">{totalDuration} min</span>
              </div>
            </div>

            <div className="grid gap-3">
              <div
                id="square-card-container"
                className="min-h-14 border border-black/20 px-4 py-4"
              />

              {isSquareLoading && (
                <p className="text-sm text-black/50">Loading secure checkout...</p>
              )}

              {checkoutError && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {checkoutError}
                </p>
              )}
            </div>

            <p className="text-xs leading-5 text-black/50">
              Card details are entered in Square's secure payment field and are
              never stored by this site.
            </p>

            <button
              type="submit"
              disabled={isSquareLoading}
              className="bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSquareLoading
                ? "Processing..."
                : `Pay $${totalPrice} & Confirm Booking`}
            </button>
          </form>
        </div>
      )}

      {/* TEAM */}
      <section id="team" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-white/40">
            The Team
          </p>

          <h2 className="mb-12 text-4xl font-bold md:text-6xl">
            Barbers with style, precision, and personality.
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {barbers.map((barber) => (
              <div
                key={barber.name}
                className="group overflow-hidden rounded-2xl border border-white/10"
              >
                <div className="relative h-80 w-full overflow-hidden">
                  {/* Image */}
                  <img
                    src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80"
                    alt={barber.name}
                    className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Tint */}
                  <div className="pointer-events-none absolute inset-0 z-10 bg-black bg-opacity-0 transition duration-500 group-hover:bg-opacity-60" />

                  {/* Overlay Content */}
                  <div className="absolute inset-0 z-20 flex translate-y-6 flex-col justify-end p-6 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <h3 className="text-2xl font-bold">{barber.name}</h3>

                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/70">
                      {barber.role}
                    </p>

                    <p className="mt-3 text-sm text-white/80">
                      {barber.specialty}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-4xl font-bold md:text-6xl">
            Cuts, details, atmosphere.
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=80",
            ].map((img) => (
              <div key={img} className="h-80 overflow-hidden">
                <img
                  src={img}
                  className="h-full w-full object-cover grayscale transition duration-700 hover:scale-110 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="relative bg-[#111] px-6 py-32">
        <div className="sticky top-24 mx-auto max-w-5xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40">
            Reviews
          </p>

          <h2 className="text-3xl leading-tight md:text-5xl">
            “Best cut I’ve had in LA. Clean shop, easy booking, and Brady nailed
            exactly what I wanted.”
          </h2>

          <p className="mt-6 text-white/50">— Daniel R.</p>
        </div>
      </section>

      {/* CONTACT */}
      <footer id="contact" className="px-6 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-4xl font-black">CURATE</p>
            <p className="mt-3 text-white/50">
              124 Melrose Ave, Los Angeles, CA
              <br />
              Daily 10AM-7PM
              <br />
              (323) 555-0198
            </p>
          </div>

          <a
            href="#booking"
            className="w-fit bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black"
          >
            Book Now
          </a>
        </div>
      </footer>
    </div>
  );
}
