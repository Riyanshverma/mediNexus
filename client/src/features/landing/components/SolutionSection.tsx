import { Badge } from "@/components/ui/badge";
import { IconStethoscope, IconLayoutDashboard, IconActivity } from "@tabler/icons-react";

const SolutionSection = () => {
  return (
    <section id="solution" className="py-24 bg-primary/5 border-y">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 font-normal bg-background">
              The Solution
            </Badge>
            <h2 className="text-4xl font-light mb-6 font-serif leading-tight">
              A unified platform for better outcomes
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              mediNexus bridges the gap between patients and healthcare providers by centralizing data, automating scheduling, and enabling seamless, secure communication.
            </p>
            <ul className="space-y-4">
              {[
                "Universal Health ID for instant historical record access",
                "Automated appointment routing to minimize patient wait times",
                "Cross-department analytics for hospital administrators"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
            <div className="space-y-4 mt-8">
              <div className="p-6 bg-background rounded-2xl shadow-sm border">
                <IconStethoscope className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-medium">Clinical Excellence</h4>
              </div>
              <div className="p-6 bg-background rounded-2xl shadow-sm border">
                <IconActivity className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-medium">Real-time Vitals</h4>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 bg-background rounded-2xl shadow-sm border h-54 flex flex-col justify-end">
                <IconLayoutDashboard className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-medium">Smart Dashboard</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;