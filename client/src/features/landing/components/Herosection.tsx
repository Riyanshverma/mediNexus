import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section id="hero" className="relative pt-32 text-center container mx-auto max-w-6xl px-4">
      <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-foreground mb-6 leading-tight">
        Effortless healthcare management by <span className="text-primary">mediNexus</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-4xl mx-auto">
        Streamline your medical practice with seamless automation for patient scheduling, unified records, and staff management.
      </p>
      <Button size="lg" className="px-6 py-5 text-md font-normal">
        Start for free
      </Button>
    </section>
  );
}

export default HeroSection