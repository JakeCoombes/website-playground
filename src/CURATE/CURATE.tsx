export default function Curate() {
  const services = [
    { name: "Signature Cut", price: "$45" },
    { name: "Skin Fade", price: "$50" },
    { name: "Beard Trim", price: "$25" },
    { name: "Hot Towel Shave", price: "$40" },
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
            <span className="text-white">Hours:</span> Mon–Sat 9AM–7PM
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
                  {service.price}
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

          <div className="border border-black/20 p-6 shadow-2xl">
            <div className="grid gap-4">
              <input
                placeholder="Name"
                className="border border-black/20 px-4 py-4 outline-none"
              />
              <input
                placeholder="Phone / Email"
                className="border border-black/20 px-4 py-4 outline-none"
              />
              <select className="border border-black/20 px-4 py-4 outline-none">
                <option>Select Service</option>
                <option>Signature Cut</option>
                <option>Skin Fade</option>
                <option>Beard Trim</option>
                <option>Hot Towel Shave</option>
              </select>
              <select className="border border-black/20 px-4 py-4 outline-none">
                <option>Select Barber</option>
                <option>Brady Adams</option>
                <option>Marcus Lee</option>
                <option>Theo Grant</option>
              </select>
              <input
                placeholder="Preferred Date"
                className="border border-black/20 px-4 py-4 outline-none"
              />
              <button className="bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white">
                Request Booking
              </button>
            </div>
          </div>
        </div>
      </section>

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
              Mon–Sat 9AM–7PM
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
