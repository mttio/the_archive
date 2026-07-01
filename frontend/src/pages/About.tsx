import React from 'react';
import { Terminal, PenTool, Flame } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="py-12 md:py-20 space-y-16 max-w-4xl mx-auto text-left">
      {/* Intro section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-2 space-y-6">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
            I believe in depth <br />
            <span className="italic font-normal text-neutral-500">over categorization.</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-sans">
            In a world that often demands narrow specialization, I find my greatest momentum at the intersection of disciplines. I am a computer engineer who designs low-level software architectures, a traditional artist who explores shadows in ink, and an endurance runner who trains for marathons.
          </p>
          <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">
            Rather than separating these lives, I view them as reinforcing loops. The analytical focus required to debug a distributed system fuels the patience needed for drawing ink textures. The physical grit built during a 30km training run translates directly to the mental stamina required to solve a complex coding bottleneck.
          </p>
        </div>
        
        {/* Profile / Workspace Image */}
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-square w-full rounded-none border border-neutral-200 overflow-hidden bg-neutral-100 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600"
              alt="Workspace setup showing design materials and tech"
              className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="text-[11px] text-neutral-400 font-sans tracking-wide uppercase text-center md:text-left">
            Current Base: Milan, Italy
          </div>
        </div>
      </section>

      {/* The Three Pillars Section */}
      <section className="space-y-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight border-b border-neutral-200 pb-4">
          Three Dimensions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Engineering */}
          <div className="rounded-none border border-neutral-200 bg-white p-6 space-y-4 hover:border-sky-300 transition-colors">
            <div className="p-3 rounded-none bg-sky-50 border border-sky-200 text-sky-700 w-fit">
              <Terminal size={18} />
            </div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">The Computer Engineer</h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              Focusing on system software, distributed computing, and web technologies. I love writing compilers, orchestrating microservices, and digging into raw protocol bytes. My tools are TypeScript, Go, Python, and Linux systems.
            </p>
          </div>

          {/* Art */}
          <div className="rounded-none border border-neutral-200 bg-white p-6 space-y-4 hover:border-rose-300 transition-colors">
            <div className="p-3 rounded-none bg-rose-50 border border-rose-200 text-rose-700 w-fit">
              <PenTool size={18} />
            </div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">The Traditional Artist</h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              Exploring traditional black-and-white media, primarily Japanese Sumi ink, charcoal, and dry-brush pens. I draw anatomy, gesture studies, and natural landscapes, translating complex textures into pure high-contrast values.
            </p>
          </div>

          {/* Sports */}
          <div className="rounded-none border border-neutral-200 bg-white p-6 space-y-4 hover:border-emerald-300 transition-colors">
            <div className="p-3 rounded-none bg-emerald-50 border border-emerald-200 text-emerald-700 w-fit">
              <Flame size={18} />
            </div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">The Athlete</h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              Driven by endurance. I run marathons and ride long road-bike tours. Training is a structured process of physiological optimization—tracking cardiac thresholds, lactate levels, and building aerobic base through high volume.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="space-y-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight border-b border-neutral-200 pb-4">
          Milestones & History
        </h2>
        
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-neutral-200">
          {/* Milestone 1 */}
          <div className="relative pl-10 flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="absolute left-1.5 top-1.5 h-4 w-4 rounded-none border border-sky-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-none bg-sky-500" />
            </span>
            <div className="sm:w-28 text-sm font-medium tracking-wide text-neutral-400 font-sans">
              2026 - Present
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-base font-bold text-neutral-900">Systems Engineer & Independent Artist</h4>
              <p className="text-sm text-neutral-600">Building cloud architectures and backend frameworks, while hosting private local exhibitions of ink collections and sports gesture sketches.</p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="relative pl-10 flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="absolute left-1.5 top-1.5 h-4 w-4 rounded-none border border-emerald-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-none bg-emerald-500" />
            </span>
            <div className="sm:w-28 text-sm font-medium tracking-wide text-neutral-400 font-sans">
              March 2026
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-base font-bold text-neutral-900">Rome Marathon - 2:57:42</h4>
              <p className="text-sm text-neutral-600">Broke the sub-3 hour marathon barrier after applying software analytics to training load metrics, resting heart rates, and stride data.</p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="relative pl-10 flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="absolute left-1.5 top-1.5 h-4 w-4 rounded-none border border-rose-500 bg-white flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-none bg-rose-500" />
            </span>
            <div className="sm:w-28 text-sm font-medium tracking-wide text-neutral-400 font-sans">
              2023 - 2025
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-base font-bold text-neutral-900">Software Engineer & Art Contributor</h4>
              <p className="text-sm text-neutral-600">Worked as a full-stack engineer developing analytical tools and microservice platforms, while studying figure anatomy and traditional drawing under local art mentors.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
