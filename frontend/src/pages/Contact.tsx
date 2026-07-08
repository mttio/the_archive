import React, { useState } from 'react';
import { api } from '../services/api';
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

const Youtube: React.FC<{ size?: number }> = ({ size = 18 }) => (
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
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.submitContactForm(formData);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to transmit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="py-8 space-y-12 w-full text-left">
      <section className="space-y-4 max-w-2xl">
        <h1 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter text-neutral-900 dark:text-stone-100 leading-[0.98] uppercase">
          
          Let's have a good Cappuccino!
        </h1>
        <p className="text-sm text-neutral-500 dark:text-stone-400 leading-relaxed font-sans font-light">
          Whether you want to discuss a project, commission an artwork, talk about sports, or just meet me, don't hesitate.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-12 pt-6 editorial-border-t">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-stone-100">Direct Connect</h3>
            <div className="flex items-center space-x-3 text-neutral-500 dark:text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors duration-200">
              <Mail size={14} className="text-neutral-400" />
              <a href="mailto:mtt.berga@gmail.com" className="text-xs font-semibold tracking-wider">mtt.berga@gmail.com</a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-stone-100">Elsewhere</h3>
            <div className="space-y-3 font-sans">
              <a
                href="https://github.com/mttio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-400 dark:text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors text-xs font-light"
              >
                <Github size={14} />
                <span>GitHub &bull; Code archives</span>
              </a>
              
              <a
                href="https://www.linkedin.com/in/matteo-berga-7332a52a6/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-400 dark:text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors text-xs font-light"
              >
                <Linkedin size={14} />
                <span>LinkedIn &bull; Professional updates</span>
              </a>
              
              <a
                href="https://www.instagram.com/mtt_brg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-400 dark:text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors text-xs font-light"
              >
                <Camera size={14} />
                <span>Instagram &bull; Art Portfolio</span>
              </a>
              
              <a
                href="https://www.strava.com/athletes/118901811"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-400 dark:text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors text-xs font-light"
              >
                <Activity size={14} />
                <span>Strava &bull; Running logs</span>
              </a>

              <a
                href="https://www.youtube.com/@matteoberga"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-neutral-400 dark:text-stone-500 hover:text-neutral-900 dark:hover:text-stone-100 transition-colors text-xs font-light"
              >
                <Youtube size={14} />
                <span>YouTube &bull; Videography</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          {formSubmitted ? (
            <div className="rounded-none border border-neutral-300/80 bg-white dark:bg-stone-900 dark:border-stone-800 p-8 text-center space-y-4">
              <div className="mx-auto p-3 rounded-none bg-stone-50 border border-neutral-300 text-neutral-800 dark:bg-stone-950 dark:border-stone-850 dark:text-stone-100 w-fit">
                <CheckCircle size={28} />
              </div>
              <h3 className="font-sans font-extrabold text-lg uppercase tracking-tight text-neutral-900 dark:text-stone-100">Message Transmitted</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans max-w-sm mx-auto font-light">
                Thank you for reaching out. I read every message and will get back to you within 24 to 48 hours.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-neutral-800 underline hover:text-neutral-500 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-stone-500 block">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-none border border-neutral-300 bg-white px-4 py-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-0 transition-colors font-sans dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-stone-600"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-none border border-neutral-300 bg-white px-4 py-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-0 transition-colors font-sans dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-stone-600"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">Topic of Interest</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full rounded-none border border-neutral-300 bg-white px-4 py-3 text-xs text-neutral-800 focus:border-neutral-500 focus:outline-none focus:ring-0 transition-colors font-sans dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-600"
                >
                  <option value="General Inquiry">Saying Hello</option>
                  <option value="Software Collaboration">Collaboration proposal</option>
                  <option value="Art Commission">Work commission</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full rounded-none border border-neutral-300 bg-white px-4 py-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-0 transition-colors resize-none font-sans dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-stone-600"
                  placeholder="Tell me about your thoughts or project..."
                />
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex items-center space-x-2 rounded-none bg-neutral-900 dark:bg-stone-200 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:text-stone-950 hover:bg-neutral-800 dark:hover:bg-stone-300 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors cursor-pointer w-full sm:w-auto justify-center"
              >
                <span>{submitting ? 'Transmitting...' : 'Send Message'}</span>
                <Send size={12} className="text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
