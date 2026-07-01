import React, { useState } from 'react';
import { Mail, Camera, Activity, Send, CheckCircle } from 'lucide-react';

const Github: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Contact: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API submission
    setTimeout(() => {
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="py-12 md:py-20 space-y-16 max-w-4xl mx-auto text-left">
      <section className="space-y-6 max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          Let's create <br />
          <span className="italic font-normal text-neutral-500">something together.</span>
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-sans">
          Whether you want to discuss a software project, commission an artwork, talk running metrics, or just say hello—I'd love to hear from you.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-12 pt-6">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-neutral-900">Direct Connect</h3>
            <div className="flex items-center space-x-3 text-neutral-600 hover:text-neutral-950 transition-colors duration-200">
              <Mail size={16} />
              <a href="mailto:matteo@example.com" className="text-sm font-medium">matteo@example.com</a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-neutral-900">Elsewhere</h3>
            <div className="space-y-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-500 hover:text-neutral-950 transition-colors text-sm group"
              >
                <Github size={16} />
                <span>GitHub &bull; Codebases</span>
              </a>
              
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-500 hover:text-neutral-950 transition-colors text-sm group"
              >
                <Linkedin size={16} />
                <span>LinkedIn &bull; Professional network</span>
              </a>
              
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-500 hover:text-neutral-950 transition-colors text-sm group"
              >
                <Camera size={16} />
                <span>Instagram &bull; Portfolio drawings</span>
              </a>
              
              <a
                href="https://strava.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-500 hover:text-neutral-950 transition-colors text-sm group"
              >
                <Activity size={16} />
                <span>Strava &bull; Running & Cycling logs</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          {formSubmitted ? (
            <div className="rounded-none border border-neutral-200 bg-white p-8 text-center space-y-4">
              <div className="mx-auto p-3 rounded-none bg-emerald-50 border border-emerald-200 text-emerald-700 w-fit">
                <CheckCircle size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral-900">Message Transmitted</h3>
              <p className="text-sm text-neutral-600 leading-relaxed font-sans max-w-sm mx-auto">
                Thank you for reaching out. I read every message and will get back to you within 24 to 48 hours.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-xs font-semibold text-neutral-800 underline hover:text-neutral-600 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Topic of Interest</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors"
                >
                  <option value="General Inquiry">General Inquiry / Saying Hello</option>
                  <option value="Software Collaboration">Software Collaboration / Code</option>
                  <option value="Art Commission">Art Commission / Sketches</option>
                  <option value="Athletics & Training">Athletics & Running metrics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors resize-none"
                  placeholder="Tell me about your thoughts or project..."
                />
              </div>

              <button
                type="submit"
                className="group inline-flex items-center space-x-2 rounded-none bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer w-full sm:w-auto justify-center"
              >
                <span>Send Message</span>
                <Send size={14} className="text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
