import '@fortawesome/fontawesome-free/css/all.css';
import karenRoyImage from './assets/karen-roy.jpg';
import React, { useState } from 'react';
import emailjs from 'emailjs-com';



const KarenBikeFittingServices = () => {

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "",
    time: "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const templateParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formatDate(formData.date),
      time: formData.time,
      message: formData.message,
    };

    emailjs
      .send(
        'service_ap6agtl', // Replace with your EmailJS Service ID
        'template_79nly6s', // Replace with your EmailJS Template ID
        templateParams,
        'tx9yWdkEuZiAz_ah6' // Replace with your EmailJS Public Key
      )
      .then(
        (response) => {
          console.log('Email sent successfully:', response.status, response.text);
          alert('Your request has been submitted successfully!');
          // Reset form
          setFormData({
            name: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            message: '',
          });
        },
        (error) => {
          console.error('Failed to send email:', error);
          alert('There was an error submitting your request. Please try again.');
        }
      );
  };

  const services = [
    {
      title: "Personalized Sizing",
      icon: "fa-ruler",
      description:
        "Custom measurements and adjustments tailored to your unique body proportions and riding style.",
    },
    {
      title: "Ergonomic Analysis",
      icon: "fa-chart-line",
      description:
        "Comprehensive assessment of your riding position to optimize comfort and prevent injuries.",
    },
    {
      title: "Performance Optimization",
      icon: "fa-tachometer-alt",
      description:
        "Scientific approach to maximize power transfer and aerodynamics for peak performance.",
    },
    {
      title: "Injury Prevention",
      icon: "fa-heartbeat",
      description:
        "Specialized adjustments to address existing discomfort and prevent future cycling-related injuries.",
    },
  ];

  const testimonials = [
    {
      quote:
        "I had been experiencing knee pain from riding, and Craig from CK bikes recommended I get a proper bike fitting.  Karen took the time to thoroughly go over everything with me.  After some rest, ice, and the correct bike fitting, my knee pain is completely gone!  I was so impressed with the results that I went back for another fitting with my mountain bike.  I highly recommend Fitness Advantage by Karen for anyone in need of a proper bike fitting.",
      name: "N. Hogan",
      discipline: "Moutain Biking",
      rating: 5,
    },
    {
      quote:
        "Great experience with Karen!  Top Notch!",
      name: "K. Bodyk",
      discipline: "Road Cycling",
      rating: 4,
    },
    {
      quote:
        "If you're in need of a bike fitting, see Karen!  I used to experience back pain when riding my bike, but after she made a few adjustments to my seat and handlebars, it made a world of difference.  She also recommended some exercises to help strengthen my back.  As an avid biker herself, she really knows her stuff.  Thanks Karen - I'll definitely be back again.",
      name: "R. Peffenbach",
      discipline: "Road Cycling",
      rating: 5,
    },
  ];

  const fitters = [
    {
      name: "Karen Roy",
      title: "Professional Bike Fitter & Health Fitness Specialist",
      specialization: "B.S. Health Fitness | ACE Certified Professional",
      bio: "With over 30 years of experience in the health and fitness industry, Karen holds a Bachelor of Science degree in Health Fitness and is an ACE Certified Professional. Her comprehensive approach combines cutting-edge technology with deep biomechanics expertise to deliver personalized fitting solutions for cyclists of all levels.",
      imageUrl: karenRoyImage,
    },
  ];

  return (
    <>
      <style>
        {`
        .grow:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-5px) !important;
        }
        `}
      </style>
      <div className="min-h-screen bg-white">
        <header className="bg-white shadow-sm fixed w-full z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-700">
                Advantage Bike Fitting by Karen Roy
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Services
              </a>
              <a
                href="#fitters"
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Our Fitters
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-pink-600 font-medium"
              >
                Contact
              </a>
            </nav>
            {/* Small screens */}
            <button className="md:hidden bg-pink-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-pink-700 transition duration-300 !rounded-button whitespace-nowrap cursor-pointer">
              <a href="#booking">Book a Fitting</a>
            </button>

            {/* Medium and larger screens */}
            <button className="hidden md:inline-block bg-pink-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-pink-700 transition duration-300 !rounded-button whitespace-nowrap cursor-pointer">
              <a href="#contact">Book a Fitting</a>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="pt-20 relative h-[600px] ">
          <div className="absolute inset-0 z-0">
            <img
              src="https://readdy.ai/api/search-image?query=Warm%20and%20inviting%20bike%20fitting%20studio%20with%20natural%20light%20streaming%20through%20windows%2C%20professional%20fitter%20working%20with%20cyclist%20in%20a%20comfortable%20setting%2C%20wooden%20floors%20and%20exposed%20brick%20walls%2C%20plants%20and%20cycling%20memorabilia%20adding%20personality%20to%20the%20space&width=1440&height=600&seq=4&orientation=landscape"
              alt="Professional bike fitting session"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-transparent z-10"></div>
          </div>
          <div className="container mx-auto px-4 h-full relative z-20">
            <div className="flex flex-col justify-center h-full max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Professional Bike Fitting for Peak Performance
              </h1>
              <p className="text-xl mb-8">
                Optimize your cycling experience with our data-driven approach to
                comfort, efficiency, and power.
              </p>
              <div>
                <a
                  href="#booking"
                  className="md:hidden bg-pink-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-pink-700 transition duration-300 text-lg font-medium !rounded-button whitespace-nowrap cursor-pointer mb-5"
                >
                  Schedule Your Fitting
                </a>
                <a
                  href="#contact"
                  className="hidden md:inline-block bg-pink-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-pink-700 transition duration-300 text-lg font-medium !rounded-button whitespace-nowrap cursor-pointer mb-5"
                >
                  Schedule Your Fitting
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Our Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We offer comprehensive bike fitting services tailored to your
                unique needs, whether you're a competitive racer or weekend
                warrior.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="grow bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
                >
                  <div className="p-8">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <i
                        className={`fas ${service.icon} text-pink-600 text-2xl`}
                      ></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-center">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fitters Section */}
        <section id="fitters" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Meet Karen Roy
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your dedicated professional bike fitter combining years of
                experience with cutting-edge technology to deliver exceptional
                results.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              {fitters.map((fitter, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden group"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={fitter.imageUrl}
                      alt={fitter.name}
                      className="w-full h-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-white text-sm mb-4">
                        With over 30 years of experience in the health and fitness
                        industry, Karen holds a Bachelor of Science degree in
                        Health Fitness and is an ACE Certified Professional. Her
                        comprehensive approach combines cutting-edge technology
                        with deep biomechanics expertise to deliver personalized
                        fitting solutions for cyclists of all levels.
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {fitter.name}
                    </h3>
                    <p className="text-pink-600 font-medium mb-2">
                      Professional Bike Fitter & Health Fitness Specialist
                    </p>
                    <p className="text-gray-600">
                      B.S. Health Fitness | ACE Certified Personal Trainer | IBFI
                      Certified Bike Fitter
                    </p>
                    <p className="text-gray-600 mt-2">
                      Avid cyclist riding all over New England and Beyond
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  About Advantage Bike Fitting
                </h2>
                <p className="text-gray-600 mb-6">
                  Our studio has grown to become the premier destination for cyclists seeking to optimize their performance and comfort through professional bike fitting services. We specialize in fitting mountain, road, and Peloton bikes, tailoring each session to the specific demands of the rider and their equipment.
                </p>
                <p className="text-gray-600 mb-6">
                  With 32 years as an ACE Certified Personal Trainer and 17 years
                  as Director of Fitness at an independent Living Facility, Karen
                  Roy brings her expertise as a B.S. Health Fitness graduate and
                  IBFI certified bike fitter to deliver personalized fitting
                  solutions that combine cutting-edge technology with deep
                  biomechanical knowledge.
                </p>
                <p className="text-gray-600 mb-8">
                  Our mission is simple: to help every cyclist achieve their full
                  potential through proper positioning, biomechanical efficiency,
                  and injury prevention.
                </p>
                <div className="flex flex-wrap gap-4 mb-8 justify-center">
                  <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                    <i className="fas fa-certificate text-indigo-600 mr-2"></i>
                    <span className="text-gray-700">IBFI Certified</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                    <i className="fas fa-medal text-indigo-600 mr-2"></i>
                    <span className="text-gray-700">Retül Partner</span>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                    <i className="fas fa-star text-indigo-600 mr-2"></i>
                    <span className="text-gray-700">USA Cycling Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                What Our Clients Say
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from cyclists who have experienced the difference our
                professional bike fitting makes.
              </p>
            </div>
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${activeTestimonial * 100}%)`,
                  }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <i
                              key={i}
                              className="fas fa-star text-yellow-400 text-xl mx-1"
                            ></i>
                          ))}
                        </div>
                        <p className="text-gray-700 text-lg italic mb-6 text-center">
                          "{testimonial.quote}"
                        </p>
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">
                            {testimonial.name}
                          </p>
                          <p className="text-indigo-600">
                            {testimonial.discipline}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full ${activeTestimonial === index ? "bg-indigo-600" : "bg-gray-300"} cursor-pointer`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  ></button>
                ))}
              </div>
              <button
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev > 0 ? prev - 1 : testimonials.length - 1,
                  )
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer"
                aria-label="Previous testimonial"
              >
                <i className="fas fa-chevron-left text-gray-600"></i>
              </button>
              <button
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev < testimonials.length - 1 ? prev + 1 : 0,
                  )
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer"
                aria-label="Next testimonial"
              >
                <i className="fas fa-chevron-right text-gray-600"></i>
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  Get in Touch
                </h2>
                <p className="text-gray-600 mb-8">
                  Ready to transform your cycling experience? Contact us to
                  schedule your professional bike fitting session or learn more
                  about our services.
                </p>
                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="bg-pink-100 rounded-full p-3 mr-4">
                      <i className="fas fa-map-marker-alt text-pink-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Location
                      </h3>
                      <p className="text-gray-600">
                        3 Taylor St, Littleton, MA 01460
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-indigo-100 rounded-full p-3 mr-4">
                      <i className="fas fa-phone-alt text-indigo-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                      <p className="text-gray-600">(508) 783-4491</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-indigo-100 rounded-full p-3 mr-4">
                      <i className="fas fa-envelope text-indigo-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                      <p className="text-gray-600">kpkgkroy@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-indigo-100 rounded-full p-3 mr-4">
                      <i className="fas fa-clock text-indigo-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Business Hours
                      </h3>
                      <p className="text-gray-600">Monday: 4pm - 7pm</p>
                      <p className="text-gray-600">Wednesday: 4pm - 7pm</p>
                      <p className="text-gray-600">Saturday: 10am - 4pm</p>
                      <p id="booking" className="text-gray-600">Other days: Closed</p>
                    </div>
                  </div>
                </div>
                {/* <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-300 cursor-pointer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="bg-blue-400 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-500 transition duration-300 cursor-pointer"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-700 transition duration-300 cursor-pointer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-800 transition duration-300 cursor-pointer"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div> */}
              </div>
              <div >
                <div className="bg-gray-50 rounded-xl shadow-md p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                    Book Your Fitting
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-2 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-2 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Phone Input */}
                      <div className="col-span-1">
                        <label
                          htmlFor="phone"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-2 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="Your phone number"
                          required
                        />
                      </div>

                      {/* Date Input */}
                      <div className="col-span-1">
                        <label
                          htmlFor="date"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full px-2 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                          onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            const selectedDate = new Date(input.value);
                            const day = selectedDate.getDay();
                            console.log(day);
                            if (![0, 2, 5].includes(day)) {
                              input.value = ""; // Clear invalid date
                              alert("Please select a Monday, Wednesday, or Saturday.");
                            }
                          }}
                        />
                      </div>

                      {/* Time Input */}
                      <div className="col-span-1">
                        <label
                          htmlFor="time"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Time
                        </label>
                        <select
                          id="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full px-2 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        >
                          <option value="" disabled>
                            Select a time
                          </option>
                          {(() => {
                            const selectedDate = new Date(formData.date);
                            const day = selectedDate.getDay();
                            let availableTimes: string[] = [];

                            if (day === 0 || day === 2) {
                              // Monday or Wednesday: 4pm - 7pm
                              availableTimes = ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];
                            } else if (day === 5) {
                              // Saturday: 10am - 4pm
                              availableTimes = [
                                "10:00 AM",
                                "11:00 AM",
                                "12:00 PM",
                                "1:00 PM",
                                "2:00 PM",
                                "3:00 PM",
                                "4:00 PM",
                              ];
                            }

                            return availableTimes.map((time, index) => (
                              <option key={index} value={time}>
                                {time}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-2 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        placeholder="Tell us about your cycling goals and any specific concerns"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition duration-300 !rounded-button whitespace-nowrap cursor-pointer"
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Advantage Bike Fitting by Karen Roy. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition duration-300 cursor-pointer"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition duration-300 cursor-pointer"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition duration-300 cursor-pointer"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-red-900 rounded-lg h-full p-6">
              <p className="text-xl">
                Optimize your cycling experience with our data-driven approach
                to comfort, efficiency, and power.
              </p>

              <section className="mt-4">
                <h2 className="text-2xl font-semibold mb-2">Our Services</h2>
                <ul>
                  {services.map((service) => (
                    <li key={service.id} className="mb-2">
                      {service.description}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">About Karen Roy</h2>
                <p>
                  Your dedicated professional bike fitter combining years of
                  experience with cutting-edge technology to deliver exceptional
                  results.
                </p>
                <p className="mt-2">
                  With over 30 years of experience in the health and fitness
                  industry, Karen holds a Bachelor of Science degree in Health
                  Fitness and is an ACE Certified Professional. Her
                  comprehensive approach combines cutting-edge technology with
                  deep biomechanics expertise to deliver personalized fitting
                  solutions for cyclists of all levels.
                </p>
                <p className="mt-2">
                  <strong>
                    Professional Bike Fitter & Health Fitness Specialist
                  </strong>
                </p>
                <p className="mt-1">
                  B.S. Health Fitness | ACE Certified Personal Trainer | IBFI
                  Certified Bike Fitter
                </p>
                <p className="mt-1">
                  Avid cyclist riding all over New England and Beyond
                </p>
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">Our Studio</h2>
                <p>
                  Our studio has grown to become the premier destination for
                  cyclists seeking to optimize their performance and comfort
                  through professional bike fitting services.
                </p>
                <p className="mt-2">
                  With 32 years as an ACE Certified Personal Trainer and 17
                  years as Director of Fitness at an independent Living
                  Facility, Karen Roy brings her expertise as a B.S. Health
                  Fitness graduate and IBFI certified bike fitter to deliver
                  personalized fitting solutions that combine cutting-edge
                  technology with deep biomechanical knowledge.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
                <p>
                  Our mission is simple: to help every cyclist achieve their
                  full potential through proper positioning, biomechanical
                  efficiency, and injury prevention.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">Testimonials</h2>
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="mb-4 p-4 border rounded-md"
                  >
                    <blockquote className="italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <p className="mt-2 font-semibold">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.discipline}</p>
                  </div>
                ))}
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Ready to Transform Your Cycling Experience?
                </h2>
                <p>
                  Contact us to schedule your professional bike fitting session
                  or learn more about our services.
                </p>
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Contact Information
                </h2>
                <p>3 Taylor St, Littleton, MA 01460</p>
                <p>(508) 783-4491</p>
                <p>kpkgkroy@gmail.com</p>
              </section>

              <section className="mt-6">
                <h2 className="text-2xl font-semibold mb-2">Hours</h2>
                <p>Monday: 4pm - 7pm</p>
                <p>Wednesday: 4pm - 7pm</p>
                <p>Saturday: 10am - 4pm</p>
                <p>Other days: Closed</p>
              </section>
            </div>
          </div>
        </div>
      </main> */}
      </div>
    </>
  );
};

export default KarenBikeFittingServices;
