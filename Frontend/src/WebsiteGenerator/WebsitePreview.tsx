type WebsitePreviewProps = {
  businessName: string;
  businessType: string;
  location: string;
  offer: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  imageUrl: string | null;
  galleryImages: string[];
};

const contentByType: Record<
  string,
  {
    services: string[];
    headline: string;
    featureOne: string;
    featureTwo: string;
    featureThree: string;
  }
> = {
  Barbershop: {
    services: ["Haircuts", "Beard Trims", "Same-Day Appointments"],
    headline: "Look sharp. Book fast. Walk out confident.",
    featureOne: "Fresh fades and clean cuts",
    featureTwo: "Easy online booking",
    featureThree: "Same-day appointments",
  },
  Gym: {
    services: ["Personal Training", "Strength Coaching", "Nutrition Support"],
    headline: "Train harder, feel stronger, and stay consistent.",
    featureOne: "Custom workout plans",
    featureTwo: "Expert coaching",
    featureThree: "Progress-focused training",
  },
  "Bike Fitter": {
    services: ["Bike Fit Session", "Performance Fit", "Follow-Up"],
    headline: "Ride smoother, stronger, and pain-free.",
    featureOne: "Comfort-first fitting",
    featureTwo: "Performance adjustments",
    featureThree: "Personalized setup",
  },
  "Nail Salon": {
    services: ["Manicures", "Pedicures", "Custom Nail Art"],
    headline: "Luxury nails with a clean, polished finish.",
    featureOne: "Modern designs",
    featureTwo: "Easy appointments",
    featureThree: "Relaxed experience",
  },
  Restaurant: {
    services: ["Reservations", "Private Dining", "Seasonal Menu"],
    headline: "A memorable dining experience from first bite to last.",
    featureOne: "Seasonal menu",
    featureTwo: "Private dining",
    featureThree: "Easy reservations",
  },
  Plumber: {
    services: ["Emergency Repairs", "Drain Cleaning", "Water Heater Service"],
    headline: "Fast, reliable plumbing when you need it most.",
    featureOne: "Emergency service",
    featureTwo: "Reliable repairs",
    featureThree: "Clear communication",
  },
};

function WebsitePreview({
  businessName,
  businessType,
  location,
  offer,
  primaryColor,
  backgroundColor,
  textColor,
  imageUrl,
  galleryImages,
}: WebsitePreviewProps) {
  const content = contentByType[businessType] || {
    services: ["Premium Service", "Easy Booking", "Customer Support"],
    headline: "A better website built to bring in more customers.",
    featureOne: "Professional service",
    featureTwo: "Simple booking",
    featureThree: "Built for growth",
  };

  return (
    <section
      className="min-h-screen"
      style={{ backgroundColor, color: textColor }}
    >
      <header
        className="flex items-center justify-between px-10 py-5 border-b"
        style={{ borderColor: `${primaryColor}33` }}
      >
        <div className="text-xl font-bold">{businessName}</div>

        <nav className="hidden md:flex gap-6 text-sm opacity-80">
          <span>Home</span>
          <span>Services</span>
          <span>Gallery</span>
          <span>Reviews</span>
          <span>Contact</span>
        </nav>

        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          Book Now
        </button>
      </header>

      <div
        className="p-10 min-h-[520px] flex items-center"
        style={{
          backgroundImage: imageUrl
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${imageUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: imageUrl ? "white" : textColor,
        }}
      >
        <div className="max-w-3xl">
          <p
            className="text-sm uppercase tracking-widest font-semibold"
            style={{ color: imageUrl ? "white" : primaryColor }}
          >
            {businessType} in {location}
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-4 leading-tight">
            {businessName}
          </h1>

          <p className="text-2xl font-semibold mb-4">
            {content.headline}
          </p>

          <p className="text-xl mb-8 opacity-90">
            {offer}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              Book Now
            </button>

            <button
              className="px-6 py-3 rounded-lg font-semibold border bg-white/10"
              style={{
                color: imageUrl ? "white" : textColor,
                borderColor: primaryColor,
              }}
            >
              Call Today
            </button>
          </div>
        </div>
      </div>

      <section className="p-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[content.featureOne, content.featureTwo, content.featureThree].map(
            (feature) => (
              <div
                key={feature}
                className="p-5 rounded-xl border"
                style={{ borderColor: `${primaryColor}66` }}
              >
                <h3 className="font-bold mb-2">{feature}</h3>
                <p className="text-sm opacity-70">
                  Designed to make the customer experience simple and professional.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="p-10">
        <h2 className="text-3xl font-bold mb-6">Services</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {content.services.map((service) => (
            <div
              key={service}
              className="p-5 rounded-xl border"
              style={{ borderColor: `${primaryColor}66` }}
            >
              <h3 className="font-semibold text-lg">{service}</h3>
              <p className="text-sm opacity-70 mt-2">
                Professional, reliable, and built around the customer experience.
              </p>
            </div>
          ))}
        </div>
      </section>

      {galleryImages.length > 0 && (
  <section className="p-10">
    <div className="flex items-end justify-between mb-6">
      <div>
        <p
          className="text-sm uppercase tracking-widest font-semibold mb-2"
          style={{ color: primaryColor }}
        >
          Gallery
        </p>
        <h2 className="text-3xl font-bold">A Look Inside</h2>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {galleryImages[0] && (
        <div className="md:col-span-2 md:row-span-2 overflow-hidden rounded-2xl">
          <img
            src={galleryImages[0]}
            alt={`${businessName} gallery main`}
            className="w-full h-full min-h-[420px] object-cover hover:scale-105 transition duration-500"
          />
        </div>
      )}

      {galleryImages.slice(1, 5).map((image, index) => (
        <div key={index} className="overflow-hidden rounded-2xl">
          <img
            src={image}
            alt={`${businessName} gallery ${index + 2}`}
            className="w-full h-52 object-cover hover:scale-105 transition duration-500"
          />
        </div>
      ))}
    </div>
  </section>
)}

      <section className="p-10">
        <h2 className="text-3xl font-bold mb-6">What Customers Say</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="p-6 rounded-xl border"
            style={{ borderColor: `${primaryColor}66` }}
          >
            <p className="italic opacity-80">
              “Super easy to book and the service was amazing. Highly recommend.”
            </p>
            <p className="mt-4 font-semibold">— Alex M.</p>
          </div>

          <div
            className="p-6 rounded-xl border"
            style={{ borderColor: `${primaryColor}66` }}
          >
            <p className="italic opacity-80">
              “Professional, fast, and exactly what I was looking for.”
            </p>
            <p className="mt-4 font-semibold">— Sarah K.</p>
          </div>
        </div>
      </section>

      <section
        className="p-10 border-t"
        style={{ borderColor: `${primaryColor}33` }}
      >
        <h2 className="text-3xl font-bold mb-3">Ready to Book?</h2>

        <p className="mb-6 opacity-80">
          Visit {businessName} in {location} or contact us today to schedule.
        </p>

        <button
          className="px-6 py-3 rounded-lg text-white font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          Book Appointment
        </button>
      </section>
    </section>
  );
}

export default WebsitePreview;