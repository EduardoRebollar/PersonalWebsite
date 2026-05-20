import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Journey } from '@/components/sections/Journey';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Contact } from '@/components/sections/Contact';
import { JsonLd } from '@/components/seo/JsonLd';
import { SpiralSplash } from '@/components/ui/SpiralSplash';
import { personSchema } from '@/lib/seo';

export default function HomePage() {
  return (
    <>
      <SpiralSplash />
      <JsonLd data={personSchema()} />
      <Hero />
      <About />
      <Journey />
      <Skills />
      <Projects />
      <Contact />
    </>
  );
}
