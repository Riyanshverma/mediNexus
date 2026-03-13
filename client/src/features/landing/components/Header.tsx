import { Button } from "@/components/ui/button";
import { IconHeartbeat } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Hero", href: "#hero" },
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "CTA", href: "#cta" },
];

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconHeartbeat className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-light">mediNexus</span>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-6 text-md font-normal md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            className="font-normal hidden sm:inline-flex text-md"
            onClick={() => navigate("/login")}
          >
            Log in
          </Button>
          <Button size="lg" className="font-normal text-md">Get Started</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;