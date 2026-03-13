import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCalendarStats, IconUsersGroup, IconStethoscope, IconDeviceAnalytics } from "@tabler/icons-react";

const FeaturesSection = () => {
  const features = [
    {
      title: "Smart Scheduling.",
      description: "Manage appointments beautifully organized so you see everything clearly without the clutter.",
      icon: <IconCalendarStats className="h-8 w-8 text-primary mb-4" />
    },
    {
      title: "Unified Team Sync.",
      description: "Every update flows instantly across your medical staff and keeps collaboration effortless and fast.",
      icon: <IconUsersGroup className="h-8 w-8 text-primary mb-4" />
    },
    {
      title: "Patient First Integration.",
      description: "All your patient data connects in one place and works together seamlessly by design.",
      icon: <IconStethoscope className="h-8 w-8 text-primary mb-4" />
    },
    {
      title: "Data that speaks.",
      description: "Track hospital growth with precision and turn raw diagnostic data into confident decisions.",
      icon: <IconDeviceAnalytics className="h-8 w-8 text-primary mb-4" />
    }
  ];

  return (
    <section id="features" className="pb-32 container mx-auto max-w-6xl px-4">
      <div className="text-center mb-16">
        <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 font-normal">
          Platform Features
        </Badge>
        <h2 className="text-4xl font-light mb-4 font-serif">
          Streamline your operations
        </h2>
        <p className="text-muted-foreground max-w-4xl mx-auto text-lg">
          Manage schedules, analyze patient data, and collaborate with your team all in one powerful, HIPAA-compliant platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <Card key={idx} className="border-muted bg-muted/10 shadow-none hover:bg-muted/30 transition-colors">
            <CardHeader>
              {feature.icon}
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection