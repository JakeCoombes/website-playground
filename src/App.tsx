import KarenBikeFittingServices from './KarenBikeFittingServices';

function App() {
  return <KarenBikeFittingServices />;
}

export default App;














































// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <div>
// //         <a href="https://vite.dev" target="_blank">
// //           <img src={viteLogo} className="logo" alt="Vite logo" />
// //         </a>
// //         <a href="https://react.dev" target="_blank">
// //           <img src={reactLogo} className="logo react" alt="React logo" />
// //         </a>
// //       </div>
// //       <h1>Vite + React</h1>
// //       <div className="card">
// //         <button onClick={() => setCount((count) => count + 1)}>
// //           count is {count}
// //         </button>
// //         <p>
// //           Edit <code>src/App.tsx</code> and save to test HMR
// //         </p>
// //       </div>
// //       <p className="read-the-docs">
// //         Click on the Vite and React logos to learn more
// //       </p>
// //     </>
// //   )
// // }

// // export default App

// import React from 'react';

// const KarenBikeFittingServices = () => {
//   // Sample data for services and testimonials (replace with real data)
//   const services = [
//     { id: 1, description: "Comprehensive bike fitting services tailored to your unique needs." },
//     // Add more services as needed
//   ];

//   const testimonials = [
//     {
//       id: 1,
//       quote: "The bike fitting made a huge difference in my comfort and power!",
//       name: "John Doe",
//       discipline: "Road Cyclist"
//     },
//     // Add more testimonials as needed
//   ];

//   return (
//     <div className="font-sans antialiased bg-gray-100 text-gray-900">
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//           <h1 className="text-2xl font-bold text-purple-700">
//             Advantage Bike Fitting by Karen Roy
//           </h1>
//         </div>
//       </header>
//       <main>
//         <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//           {/* Content area */}
//           <div className="px-4 py-6 sm:px-0">
//             <div className="border-4 border-dashed border-red-900 rounded-lg h-full p-6">
//               <p className="text-xl">
//                 Optimize your cycling experience with our data-driven approach to comfort, efficiency, and power.
//               </p>

//               <section className="mt-4">
//                 <h2 className="text-2xl font-semibold mb-2">Our Services</h2>
//                 <ul>
//                   {services.map(service => (
//                     <li key={service.id} className="mb-2">{service.description}</li>
//                   ))}
//                 </ul>
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">About Karen Roy</h2>
//                 <p>
//                   Your dedicated professional bike fitter combining years of experience with cutting-edge technology to deliver exceptional results.
//                 </p>
//                 <p className="mt-2">
//                   With over 30 years of experience in the health and fitness industry, Karen holds a Bachelor of Science degree in Health Fitness and is an ACE Certified Professional. Her comprehensive approach combines cutting-edge technology with deep biomechanics expertise to deliver personalized fitting solutions for cyclists of all levels.
//                 </p>
//                 <p className="mt-2">
//                   <strong>Professional Bike Fitter & Health Fitness Specialist</strong>
//                 </p>
//                 <p className="mt-1">
//                   B.S. Health Fitness | ACE Certified Personal Trainer | IBFI Certified Bike Fitter
//                 </p>
//                 <p className="mt-1">
//                   Avid cyclist riding all over New England and Beyond
//                 </p>
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">Our Studio</h2>
//                 <p>
//                   Our studio has grown to become the premier destination for cyclists seeking to optimize their performance and comfort through professional bike fitting services.
//                 </p>
//                 <p className="mt-2">
//                   With 32 years as an ACE Certified Personal Trainer and 17 years as Director of Fitness at an independent Living Facility, Karen Roy brings her expertise as a B.S. Health Fitness graduate and IBFI certified bike fitter to deliver personalized fitting solutions that combine cutting-edge technology with deep biomechanical knowledge.
//                 </p>
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
//                 <p>
//                   Our mission is simple: to help every cyclist achieve their full potential through proper positioning, biomechanical efficiency, and injury prevention.
//                 </p>
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">Testimonials</h2>
//                 {testimonials.map(testimonial => (
//                   <div key={testimonial.id} className="mb-4 p-4 border rounded-md">
//                     <blockquote className="italic">"{testimonial.quote}"</blockquote>
//                     <p className="mt-2 font-semibold">{testimonial.name}</p>
//                     <p className="text-gray-600">{testimonial.discipline}</p>
//                   </div>
//                 ))}
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">Ready to Transform Your Cycling Experience?</h2>
//                 <p>
//                   Contact us to schedule your professional bike fitting session or learn more about our services.
//                 </p>
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
//                 <p>3 Taylor St, Littleton, MA 01460</p>
//                 <p>(508) 783-4491</p>
//                 <p>kpkgkroy@gmail.com</p>
//               </section>

//               <section className="mt-6">
//                 <h2 className="text-2xl font-semibold mb-2">Hours</h2>
//                 <p>Monday: 4pm - 7pm</p>
//                 <p>Wednesday: 4pm - 7pm</p>
//                 <p>Saturday: 10am - 4pm</p>
//                 <p>Other days: Closed</p>
//               </section>

//             </div>
//           </div>
//           {/* /End replace */}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default KarenBikeFittingServices;
