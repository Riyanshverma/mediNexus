import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="cta" className="py-32 bg-primary/5 border-t">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-light mb-6 font-serif text-foreground">
          Ready to transform your practice?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-4xl mx-auto">
          Join thousands of healthcare providers streamlining their operations, managing schedules, and prioritizing patient care.
        </p>
        <Button size="lg" className="px-6 py-5 text-md font-normal">
          Start for free
        </Button>
      </div>
    </section>
  );
}

export default CTASection