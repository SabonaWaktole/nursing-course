import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Courses from '../components/Courses';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Courses />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
