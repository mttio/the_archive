import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Articles } from './pages/Articles';
import { WorkDetail } from './pages/WorkDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { FullPageEditor } from './pages/FullPageEditor';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-white font-sans text-black transition-colors duration-300 dark:bg-black dark:text-white">
        {/* Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="mx-auto flex w-full max-w-none flex-grow flex-col px-6 md:px-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/work/:id" element={<WorkDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/new" element={<FullPageEditor />} />
            <Route path="/admin/edit/:id" element={<FullPageEditor />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
