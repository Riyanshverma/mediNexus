import { Badge } from "@/components/ui/badge";
import { IconClock, IconFileOff, IconHeartBroken } from "@tabler/icons-react";

const ProblemSection = () => {
  return (
    <section id="problem" className="py-32 container mx-auto max-w-6xl px-4">
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 font-normal">
          The Challenge
        </Badge>
        <h2 className="text-4xl font-light mb-4 font-serif">
          Healthcare is too fragmented
        </h2>
        <p className="text-muted-foreground max-w-4xl mx-auto">
          Patients and providers alike struggle with a disconnected ecosystem that wastes time, scatters data, and compromises care.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <IconFileOff className="w-10 h-10 text-destructive mb-4" />,
            title: "Scattered Records",
            desc: "Patient history is siloed across different clinics and hospitals, making it hard to get a comprehensive view."
          },
          {
            icon: <IconClock className="w-10 h-10 text-destructive mb-4" />,
            title: "Inefficient Scheduling",
            desc: "Long wait times and complex booking processes frustrate patients and reduce hospital throughput."
          },
          {
            icon: <IconHeartBroken className="w-10 h-10 text-destructive mb-4" />,
            title: "Coordination Gaps",
            desc: "Lack of real-time communication between different departments and external facilities leads to delays in care."
          }
        ].map((item, idx) => (
          <div key={idx} className="p-6 bg-muted/10 rounded-2xl border border-muted/50 hover:bg-muted/30 transition-colors">
            {item.icon}
            <h3 className="text-xl font-medium mb-2">{item.title}</h3>
            <p className="text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProblemSection;