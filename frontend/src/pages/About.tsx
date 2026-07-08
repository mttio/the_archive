import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="py-8 space-y-12 w-full text-left">
      {/* Intro section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <div className="md:col-span-2 space-y-6">
          <h1 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter text-neutral-900 dark:text-stone-100 leading-[0.98] uppercase">
            Hi! I am Matteo <br />
            <span className="block font-sans font-light text-neutral-400 dark:text-stone-500 text-lg sm:text-xl tracking-widest uppercase mt-3">
              and this is my living archive.
            </span>
          </h1>
          
          <div className="editorial-border-t pt-6 space-y-6">
            <p className="text-base text-neutral-700 dark:text-stone-300 leading-relaxed font-sans font-light">
              In a world that often demands narrow specialization, I find my greatest momentum at the intersection of disciplines. I am a computer engineer who designs low-level software architectures, a traditional artist who explores shadows in ink, and an endurance runner who trains for marathons.
            </p>
            <p className="text-sm text-neutral-500 dark:text-stone-500 leading-relaxed font-sans font-light">
              Rather than separating these lives, I view them as reinforcing loops. The analytical focus required to debug a distributed system fuels the patience needed for drawing ink textures. The physical grit built during a 30km training run translates directly to the mental stamina required to solve a complex coding bottleneck.
            </p>
          </div>
        </div>
        
        {/* Profile / Workspace Image */}
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-[3/4] w-full rounded-none overflow-hidden bg-neutral-100 dark:bg-stone-900">
            <img
              src="https://scontent.cdninstagram.com/v/t51.82787-19/612169498_18091274516474242_370379513216965107_n.jpg?_nc_cat=111&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=RpVT7y049OMQ7kNvwFI5aPd&_nc_oc=AdpFNJKtRcL6_toJxAF3WXeKJy2j7-qrLel2nsGurOVW40oArA8wphrpX3UVz_Iz2zM&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=R5DirvC93Zg59_UTq2wYzA&_nc_ss=7b6a8&oh=00_AQBDuDeZlT0FK579o81442wUKIJEB_k_GuUKU-DkIQVPTA&oe=6A4B39BB"
              alt="Workspace setup showing design materials and tech"
              className="h-full w-full object-cover hover:scale-101 transition-transform duration-500 ease-out"
            />
          </div>
          <div className="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-stone-500 font-sans uppercase text-center md:text-left">
            Current HQ &bull; Turin, Italy
          </div>
        </div>
      </section>
    </div>
  );
};
