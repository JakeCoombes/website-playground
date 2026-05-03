import { useState, type ChangeEvent } from "react";
import WebsitePreview from "./WebsitePreview";

const businessPresets: Record<
  string,
  {
    offer: string;
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  Barbershop: {
    offer: "Fresh fades, beard trims, and same-day appointments",
    primaryColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },
  Gym: {
    offer: "Personal training, strength coaching, and custom fitness plans",
    primaryColor: "#16a34a",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
  },
  "Bike Fitter": {
    offer: "Professional bike fitting to improve comfort, power, and performance",
    primaryColor: "#0ea5e9",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },
  "Nail Salon": {
    offer: "Luxury manicures, pedicures, and custom nail designs",
    primaryColor: "#db2777",
    backgroundColor: "#fff7fb",
    textColor: "#111827",
  },
  Restaurant: {
    offer: "Seasonal dishes, reservations, and private dining experiences",
    primaryColor: "#dc2626",
    backgroundColor: "#111827",
    textColor: "#ffffff",
  },
  Plumber: {
    offer: "Fast repairs, drain cleaning, and emergency plumbing service",
    primaryColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },
};

function LocalBusinessDemoGenerator() {
  const [businessName, setBusinessName] = useState("Elite Cuts");
  const [businessType, setBusinessType] = useState("Barbershop");
  const [location, setLocation] = useState("West Hollywood");
  const [offer, setOffer] = useState(businessPresets.Barbershop.offer);

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#111827");

  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const applyPreset = (type: string) => {
    const preset = businessPresets[type];

    setBusinessType(type);
    setOffer(preset.offer);
    setPrimaryColor(preset.primaryColor);
    setBackgroundColor(preset.backgroundColor);
    setTextColor(preset.textColor);
  };

  const handleHeroImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setHeroImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        setGalleryImages((prev) => [...prev, reader.result as string]);
      };

      reader.readAsDataURL(file);
    });
  };

  const clearImages = () => {
    setHeroImage(null);
    setGalleryImages([]);
  };

  const copyPitch = async () => {
    const pitch = `Hey, I made a quick website preview for ${businessName}. It’s designed to help bring in more customers in ${location} with a cleaner site, easier booking, and a stronger first impression. Want me to send it over?`;

    await navigator.clipboard.writeText(pitch);
    alert("Pitch copied!");
  };

  const downloadHtml = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${businessName}</title>
</head>
<body style="margin:0;font-family:Arial;background:${backgroundColor};color:${textColor};">
  <header style="padding:24px 40px;border-bottom:1px solid ${primaryColor};display:flex;justify-content:space-between;align-items:center;">
    <strong style="font-size:24px;">${businessName}</strong>
    <button style="background:${primaryColor};color:white;border:none;padding:12px 18px;border-radius:8px;">Book Now</button>
  </header>

  <section style="padding:80px 40px;">
    <p style="color:${primaryColor};text-transform:uppercase;letter-spacing:2px;">${businessType} in ${location}</p>
    <h1 style="font-size:56px;margin:16px 0;">${businessName}</h1>
    <p style="font-size:22px;max-width:700px;">${offer}</p>
    <button style="background:${primaryColor};color:white;border:none;padding:14px 22px;border-radius:8px;font-weight:bold;">Book Now</button>
  </section>
</body>
</html>
    `.trim();

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${businessName.toLowerCase().replace(/ /g, "-")}-demo.html`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
  <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-3">
        <section className="lg:col-span-1 h-screen overflow-y-auto border-r border-slate-800 bg-black p-6">
          <h1 className="text-2xl font-bold mb-2">
            Website Demo Generator
          </h1>

          <p className="text-sm text-slate-400 mb-6">
            Fill in the details and preview a local business website.
          </p>

          <div className="space-y-4">
            <input
              className="w-full p-3 rounded-xl bg-white text-black border border-slate-300"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
            />

            <select
              className="w-full p-3 rounded-xl bg-white text-black border border-slate-300"
              value={businessType}
              onChange={(e) => applyPreset(e.target.value)}
            >
              {Object.keys(businessPresets).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <input
              className="w-full p-3 rounded-xl bg-white text-black border border-slate-300"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />

            <textarea
              className="w-full p-3 rounded-xl bg-white text-black border border-slate-300 min-h-28"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="Main offer"
            />

            <label className="block">
              <span className="text-sm text-slate-300">Hero Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpload}
                className="w-full mt-2 p-3 rounded-xl bg-white text-black border border-slate-300"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Gallery Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="w-full mt-2 p-3 rounded-xl bg-white text-black border border-slate-300"
              />
            </label>

            <div className="grid gap-4 pt-2">
              <label>
                <span className="text-sm text-slate-300">Primary</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-10 mt-1"
                />
              </label>

              <label>
                <span className="text-sm text-slate-300">Background</span>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 mt-1"
                />
              </label>

              <label>
                <span className="text-sm text-slate-300">Text</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 mt-1"
                />
              </label>
            </div>

            <button
              onClick={copyPitch}
              className="w-full bg-blue-600 hover:bg-blue-500 transition p-3 rounded-xl font-semibold"
            >
              Copy Sales Pitch
            </button>

            <button
              onClick={downloadHtml}
              className="w-full bg-white text-black hover:bg-slate-200 transition p-3 rounded-xl font-semibold"
            >
              Download HTML Demo
            </button>

            <button
              onClick={clearImages}
              className="w-full border border-slate-700 hover:bg-slate-900 transition p-3 rounded-xl font-semibold"
            >
              Clear Images
            </button>
          </div>
        </section>

        <section className="lg:col-span-2 h-screen overflow-y-auto bg-black">
          <WebsitePreview
            businessName={businessName}
            businessType={businessType}
            location={location}
            offer={offer}
            primaryColor={primaryColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            imageUrl={heroImage}
            galleryImages={galleryImages}
          />
        </section>
      </div>
    </main>
  );
}

export default LocalBusinessDemoGenerator;