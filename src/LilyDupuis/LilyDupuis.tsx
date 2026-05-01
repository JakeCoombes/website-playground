import { useEffect, useRef, useState } from "react";

export default function LilyDupuis() {
  const cream = "#F3EEE6";
  const ink = "#2F2D28";
  const olive = "#5C614F";
  const oliveSoft = "#7D8467";

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const isFrench = language === "fr";

  const imageStrip = [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  ];

  const reviews = isFrench
    ? [
        {
          quote:
            "Le Clos Marie-Louise nous a paru intime, raffine et fluide. Le lieu a donne a notre diner de direction le ton exact que nous recherchions : confidentiel, elegant et memorable.",
          name: "Claire M.",
          event: "Diner de direction",
        },
        {
          quote:
            "La propriete avait un caractere remarquable. Chaque detail semblait soigneusement pense, ce qui en a fait le cadre parfait pour notre shooting de marque et notre reception client.",
          name: "James R.",
          event: "Partenariat de marque",
        },
        {
          quote:
            "Lily a rendu toute l'organisation simple et attentionnee. Le jardin etait magnifique, et notre equipe parle encore de cette soiree.",
          name: "Amelia T.",
          event: "Reception d'entreprise",
        },
      ]
    : [
        {
          quote:
            "Le Clos Marie-Louise felt private, polished, and effortless. It gave our leadership dinner the exact tone we wanted: intimate, elevated, and memorable.",
          name: "Claire M.",
          event: "Executive Dinner",
        },
        {
          quote:
            "The property had so much character. Every corner felt intentional, which made it perfect for our brand shoot and client reception.",
          name: "James R.",
          event: "Brand Partnership",
        },
        {
          quote:
            "Lily made the entire process simple and thoughtful. The garden setting was beautiful, and our team is still talking about the evening.",
          name: "Amelia T.",
          event: "Corporate Gathering",
        },
      ];

  const eventTypes = [
    {
      title: isFrench ? "Evenements d'entreprise" : "Corporate Events",
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: isFrench ? "Diners prives" : "Private Dinners",
      image:
        "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: isFrench ? "Photo et film" : "Photo & Film",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const faqs = isFrench
    ? [
        {
          q: "Peut-on louer le domaine pour un diner prive ?",
          a: "Oui. Le domaine est ideal pour les diners prives intimes et les receptions soigneusement imaginees.",
        },
        {
          q: "Combien d'invites le domaine peut-il accueillir ?",
          a: "Environ 20 invites en interieur et 40 a 75 en exterieur selon la configuration.",
        },
        {
          q: "Le jardin est-il disponible pour des evenements en exterieur ?",
          a: "Oui. Le jardin est l'un des atouts principaux du lieu et convient parfaitement aux receptions et experiences en plein air.",
        },
        {
          q: "Les marques peuvent-elles utiliser le domaine pour des shootings ou des partenariats ?",
          a: "Absolument. Le domaine est ideal pour les shootings photo, les tournages et les collaborations de marque.",
        },
      ]
    : [
        {
          q: "Can we rent the estate for a private dinner?",
          a: "Yes. The estate is ideal for intimate private dinners and curated gatherings.",
        },
        {
          q: "How many guests can the property accommodate?",
          a: "Approximately 20 guests indoors and 40 to 75 outdoors depending on the setup.",
        },
        {
          q: "Is the garden available for outdoor events?",
          a: "Yes. The garden is a key feature and perfect for outdoor gatherings and experiences.",
        },
        {
          q: "Can brands use the estate for shoots or partnerships?",
          a: "Absolutely. The estate is ideal for photo shoots, filming, and brand collaborations.",
        },
      ];

  const formFields = isFrench
    ? [
        "Prenom et nom",
        "Adresse e-mail",
        "Telephone",
        "Qui etes-vous ?",
        "Nom de l'entreprise",
        "Ville / Pays",
        "Type d'evenement",
        "Nombre d'invites estime",
        "Date souhaitee",
      ]
    : [
        "First and last name",
        "Email address",
        "Phone",
        "Who are you?",
        "Company name",
        "City / Country",
        "Event type",
        "Estimated guest count",
        "Preferred date",
      ];

  const [activeReview, setActiveReview] = useState(0);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const reviewInterval = setInterval(() => {
      setActiveReview((current) => (current + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(reviewInterval);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const interval = setInterval(() => {
      const halfwayPoint = carousel.scrollWidth / 2;

      if (carousel.scrollLeft >= halfwayPoint) {
        carousel.scrollLeft = 0;
      } else {
        carousel.scrollBy({ left: 400, behavior: "smooth" });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: cream,
        color: ink,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <button
        type="button"
        onClick={() => setLanguage(isFrench ? "en" : "fr")}
        className="fixed bottom-6 right-6 z-50 border px-5 py-3 text-xs uppercase tracking-[0.18em] shadow-lg transition hover:opacity-90"
        style={{
          backgroundColor: ink,
          borderColor: cream,
          color: cream,
        }}
        aria-label={
          isFrench
            ? "Switch language to English"
            : "Passer la langue en francais"
        }
      >
        {isFrench ? "English" : "Francais"}
      </button>

      {/* HOME / FIRST SCREEN */}
      <section
        id="home"
        className="relative h-screen min-h-[560px] w-full overflow-hidden bg-center bg-cover md:bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-[#29282F]" />

        <header className="absolute top-0 left-0 z-30 w-full text-white">
          <div className="relative flex items-center justify-center px-5 py-6 text-xs uppercase tracking-[0.22em] md:justify-between md:px-8 md:py-7">
            <nav className="hidden gap-8 md:flex">
              <a href="#events">{isFrench ? "Evenements" : "Events"}</a>
              <a href="#gallery">
                {isFrench ? "Shooting photo" : "Photo Shoots"}
              </a>
              <a href="#contact">{isFrench ? "Demande" : "Inquire"}</a>
            </nav>

            <a
              href="#home"
              className="text-center md:absolute md:left-1/2 md:top-5 md:-translate-x-1/2"
            >
              <p className="text-base leading-none tracking-[0.18em] md:text-lg">
                LE CLOS
              </p>
              <p className="text-base leading-none tracking-[0.18em] md:text-lg">
                MARIE-LOUISE
              </p>
            </a>

            <nav className="hidden gap-8 md:flex">
              <a href="#about">{isFrench ? "Le domaine" : "The Estate"}</a>
              <a href="#faq">FAQ</a>
              <a href="#contact" className="border border-white px-4 py-2">
                {isFrench ? "Reserver" : "Reserve"}
              </a>
            </nav>
          </div>
        </header>

        <div className="relative z-10 flex h-full items-center justify-center px-7 pb-10 pt-24 text-center">
          <div className="max-w-sm md:max-w-none">
            <h1 className="mx-auto max-w-4xl text-3xl font-normal leading-tight text-white md:text-6xl">
              {isFrench
                ? "Un domaine raffine pour receptions intimes, evenements et moments creatifs"
                : "A refined estate for intimate gatherings, events and creative moments"}
            </h1>

            <p className="mx-auto mt-12 max-w-xs text-xs leading-6 text-white md:mt-44 md:max-w-xl">
              {isFrench
                ? "Le Clos Marie-Louise ouvre ses portes aux moments qui comptent : se reunir, creer, recevoir et celebrer."
                : "Le Clos Marie-Louise opens its doors for moments that matter: gathering, creating, hosting, and celebrating."}
            </p>
          </div>
        </div>
      </section>

      {/* TRUST / IDEAL FOR */}
      <section className="border-b border-black/20 px-6 py-8 md:py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-sm md:text-left">
            {isFrench ? "Ideal pour" : "Ideal for"}
          </p>

          <div className="grid grid-cols-2 items-center gap-x-6 gap-y-4 text-center text-[10px] uppercase tracking-[0.16em] text-black/55 sm:flex sm:flex-wrap sm:justify-center md:justify-end md:gap-10 md:text-sm md:tracking-[0.18em]">
            <span>{isFrench ? "Equipes d'entreprise" : "Corporate teams"}</span>
            <span>{isFrench ? "Diners prives" : "Private dinners"}</span>
            <span>{isFrench ? "Partenaires de marque" : "Brand partners"}</span>
            <span>{isFrench ? "Photo et film" : "Photo & film"}</span>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section id="about" className="px-6 py-16 text-center md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center border border-black/20 text-3xl md:h-28 md:w-28 md:text-4xl">
            L
          </div>

          <p className="text-xl leading-8 md:text-3xl md:leading-[1.3]">
            {isFrench
              ? "Je crois au luxe discret : celui qui ne se dit pas, mais qui se reconnait instantanement. Le Clos Marie-Louise offre un cadre familier, elegant et chaleureux, pense pour accueillir des evenements avec un raffinement tout en retenue."
              : "I believe in understated luxury: the kind that goes unspoken, yet is instantly recognizable. Le Clos Marie-Louise offers a familiar, elegant, and warm setting designed to host events with quiet refinement."}
          </p>

          <p className="mt-8 text-sm italic text-black/55">Lily Dupuis</p>
        </div>
      </section>

      {/* HORIZONTAL IMAGE STRIP DESKTOP*/}
      <section id="gallery" className="hidden md:block pb-20">
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto px-3 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {[...imageStrip, ...imageStrip].map((image, index) => (
            <div
              key={image}
              className="h-[420px] md:h-[520px]"
              style={{
                flex: "0 0 calc((100% - 60px) / 6)",
                minWidth: "calc((100% - 60px) / 6)",
              }}
            >
              <img
                src={image}
                alt={
                  isFrench
                    ? `Interieur du Clos Marie-Louise ${index + 1}`
                    : `Le Clos Marie-Louise interior ${index + 1}`
                }
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* HORIZONTAL IMAGE STRIP MOBILE*/}
      <section id="gallery" className="block md:hidden pb-20">
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto px-3 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {[...imageStrip, ...imageStrip].map((image, index) => (
            <div
              key={image}
              className="h-[420px] md:h-[520px]"
              style={{
                flex: "0 0 calc((100% - 20px) / 3)",
                minWidth: "calc((100% - 20px) / 3)",
              }}
            >
              <img
                src={image}
                alt={
                  isFrench
                    ? `Interieur du Clos Marie-Louise ${index + 1}`
                    : `Le Clos Marie-Louise interior ${index + 1}`
                }
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ORGANIZE AN EVENT */}
      <section id="events" className="px-6 pb-16 text-center md:pb-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-xs uppercase tracking-[0.25em] text-black/45">
            {isFrench ? "Organiser un evenement" : "Organize an event"}
          </p>

          <h2 className="text-2xl leading-tight md:text-5xl">
            {isFrench
              ? "Nous accueillons vos evenements prives et professionnels au Clos Marie-Louise"
              : "We host your private and business events at Le Clos Marie-Louise"}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-black/60 md:mt-6 md:text-base">
            {isFrench
              ? "Pense pour les rassemblements intimes et elegants, le domaine offre des interieurs raffines et des espaces exterieurs verdoyants pour les equipes, partenaires, createurs et hotes qui recherchent un lieu plus personnel qu'une adresse traditionnelle."
              : "Designed for smaller, elevated gatherings, the estate offers refined interiors and lush outdoor spaces for teams, partners, creators, and hosts looking for something more personal than a traditional venue."}
          </p>
        </div>
      </section>

      {/* EVENT TYPES */}
      <section className="px-6 pb-16 md:pb-28">
        <div className="mx-auto grid max-w-10xl gap-8 md:grid-cols-3">
          {eventTypes.map((item) => (
            <div key={item.title} className="text-center space-y-4">
              <div className="group h-72 w-full overflow-hidden md:h-[450px]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-200"
                />
              </div>

              <p className="text-lg">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARALLAX CALL TO ACTION STRIP */}
      <section
        className="relative flex min-h-[420px] items-center justify-center bg-center bg-cover px-4 py-14 md:h-[500px] md:bg-fixed md:px-6 md:py-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        <div
          className="relative z-10 w-full max-w-7xl px-6 py-10 text-center shadow-xl sm:px-12 md:m-28 md:py-14 md:px-20"
          style={{ backgroundColor: cream, color: ink }}
        >
          <h2 className="text-2xl md:text-4xl">
            {isFrench
              ? "Creez votre moment au Clos Marie-Louise"
              : "Create your moment at Le Clos Marie-Louise"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/60">
            {isFrench
              ? "Commencez par nous parler de votre projet. Nous vous enverrons ensuite les disponibilites, les details du domaine et les prochaines etapes."
              : "Start by telling us about your project. We will then send you availability, property details, and next steps."}
          </p>

          <a
            href="#contact"
            className="mt-7 inline-block px-5 py-3 text-[10px] uppercase tracking-[0.16em] md:px-7 md:text-xs md:tracking-[0.18em]"
            style={{ backgroundColor: olive, color: cream }}
          >
            {isFrench ? "Verifier les disponibilites" : "Check Availability"}
          </a>
        </div>
      </section>

      {/* ESTATE DETAILS */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-black/45">
              {isFrench
                ? "Domaine et espaces de jardin"
                : "Estate and garden spaces"}
            </p>

            <h2 className="text-2xl leading-tight md:text-5xl">
              {isFrench
                ? "Un interieur elegant, un jardin luxuriant et l'espace pour recevoir en toute simplicite."
                : "An elegant interior, a lush garden, and room to host with ease."}
            </h2>

            <p className="mt-6 text-sm leading-7 text-black/60 md:text-base">
              {isFrench
                ? "A l'interieur, le domaine porte un charme ancien inspire des chateaux. A l'exterieur, le jardin compose un decor naturel pour receptions intimes, shootings, ateliers et evenements partenaires."
                : "Inside, the estate carries an old-world, chateau-inspired charm. Outside, the garden setting creates a natural backdrop for intimate gatherings, shoots, workshops, and partner events."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3 md:mt-8">
              <span
                className="px-5 py-2 text-xs uppercase tracking-[0.18em]"
                style={{ backgroundColor: olive, color: cream }}
              >
                {isFrench ? "Interieur 20" : "Indoor 20"}
              </span>

              <span className="border border-black/20 px-5 py-2 text-xs uppercase tracking-[0.18em]">
                {isFrench ? "Exterieur 40-75" : "Outdoor 40-75"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80"
              className="h-56 w-full object-cover md:h-80"
              alt={isFrench ? "Piece interieure" : "Interior room"}
            />

            <img
              src="https://images.unsplash.com/photo-1558521958-0a228e77e984?auto=format&fit=crop&w=900&q=80"
              className="mt-8 h-56 w-full object-cover md:mt-10 md:h-80"
              alt={isFrench ? "Cadre de jardin" : "Garden setting"}
            />
          </div>
        </div>
      </section>

      {/* SECOND PARALLAX CALL TO ACTION STRIP */}
      <section
        className="relative flex min-h-[440px] items-center justify-center bg-center bg-cover px-4 py-14 md:h-[500px] md:bg-fixed md:px-6 md:py-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />

        <div
          className="relative z-10 w-full max-w-7xl px-6 py-10 text-center shadow-xl sm:px-12 md:m-28 md:py-14 md:px-20"
          style={{ backgroundColor: cream, color: ink }}
        >
          <p className="mb-5 text-xs uppercase tracking-[0.25em] text-black/45">
            {isFrench ? "Vos retours" : "Your Feedback"}
          </p>

          <h2 className="mx-auto max-w-4xl text-xl leading-tight md:text-4xl">
            "{reviews[activeReview].quote}"
          </h2>

          <div className="mt-6">
            <p className="text-sm font-semibold">
              {reviews[activeReview].name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-black/45">
              {reviews[activeReview].event}
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveReview(index)}
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    activeReview === index ? olive : "rgba(47,45,40,0.25)",
                }}
                aria-label={
                  isFrench
                    ? `Afficher l'avis ${index + 1}`
                    : `Show review ${index + 1}`
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* NOTE FROM LILY */}
      <section
        className="px-6 py-16 md:py-24"
        style={{ backgroundColor: "#E8E0D4" }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-black/45">
              {isFrench ? "Directrice generale" : "General Manager"}
            </p>

            <h2 className="text-3xl leading-tight md:text-5xl">
              {isFrench ? "Gere par Lily Dupuis" : "Managed by Lily Dupuis"}
            </h2>
          </div>

          <p className="text-base leading-8 text-black/60 md:text-lg">
            {isFrench
              ? "Chaque demande est traitee avec soin afin d'aider nos partenaires a comprendre le domaine, les disponibilites, les possibilites d'agencement et le meilleur usage du lieu pour leur evenement."
              : "Each inquiry is handled with care, helping partners understand the property, availability, layout options, and best use of the estate for their event."}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-8xl grid-cols-1 items-center gap-10 lg:grid-cols-3 lg:gap-16">
          {/* LEFT IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80"
            alt={isFrench ? "Detail de cuisine" : "Kitchen detail"}
            className="h-72 w-full object-cover lg:h-[520px] lg:pb-20"
          />

          {/* CENTER TEXT */}
          <div>
            <h2 className="mb-8 text-center text-2xl leading-tight md:mb-12 md:text-4xl">
              {isFrench ? "Questions frequentes" : "Frequently Asked Questions"}
            </h2>

            <div className="divide-y divide-black border-y border-black">
              {faqs.map((item, index) => (
                <div key={item.q}>
                  {/* QUESTION */}
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between py-4 text-left text-sm cursor-pointer md:py-5"
                  >
                    <span>{item.q}</span>
                  </button>

                  {/* ANSWER */}
                  {openFaq === index && (
                    <p className="pb-5  pl-6 pr-6 text-sm text-black/60">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
            alt={isFrench ? "Salon de jardin" : "Garden lounge"}
            className="h-72 w-full object-cover lg:h-[520px] lg:pt-20"
          />
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="px-6 py-16 md:py-24"
        style={{ backgroundColor: oliveSoft, color: cream }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/60">
              {isFrench ? "Demande" : "Inquiry"}
            </p>

            <h2 className="text-2xl leading-tight md:text-5xl">
              {isFrench
                ? "Parlez-nous de votre evenement ou partenariat."
                : "Tell us about your event or partnership."}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
              {isFrench
                ? "Envoyez-nous quelques details et Lily reviendra vers vous avec les disponibilites, les informations sur le domaine et les prochaines etapes."
                : "Submit a few details and Lily will follow up with availability, property information, and next steps."}
            </p>
          </div>

          <form className="mx-auto mt-10 max-w-2xl md:mt-12">
            <div className="grid gap-4">
              {formFields.map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/90 focus:border-white/60"
                  style={{ color: cream, caretColor: cream }}
                />
              ))}

              <textarea
                placeholder={
                  isFrench
                    ? "Parlez-nous un peu de votre projet"
                    : "Tell us a little about your project"
                }
                rows={4}
                className="w-full border border-white/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-white/90 focus:border-white/60"
                style={{ color: cream, caretColor: cream }}
              />

              <button
                type="button"
                className="mt-6 w-full border border-white/40 px-8 py-3 text-xs uppercase tracking-[0.18em] hover:bg-white/10 sm:w-fit"
              >
                {isFrench ? "Suivant" : "Next"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 px-6 py-10 pb-24 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center border border-black/20 text-2xl">
              L
            </div>

            <p className="max-w-md text-sm leading-6 text-black/60">
              {isFrench
                ? "Le Clos Marie-Louise est un domaine prive dedie aux reunions d'entreprise, diners intimes, productions creatives et partenariats sur mesure."
                : "Le Clos Marie-Louise is a private estate for corporate gatherings, intimate dinners, creative productions, and curated partnerships."}
            </p>
          </div>

          <a
            href="#contact"
            className="w-fit px-5 py-2 text-xs uppercase tracking-[0.18em]"
            style={{ backgroundColor: olive, color: cream }}
          >
            {isFrench ? "Reserver votre evenement" : "Book your event"}
          </a>
        </div>
      </footer>
    </div>
  );
}
