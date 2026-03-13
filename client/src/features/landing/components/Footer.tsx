import { IconBrandX, IconBrandLinkedin, IconBrandGithub } from "@tabler/icons-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-5 gap-8 pl-4">
        <div className="col-span-2">
          <span className="font-serif font-light text-xl block mb-4">mediNexus</span>
          <p className="text-sm text-muted-foreground mb-6">Healthcare management made effortless.</p>
          <div className="flex gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground"><IconBrandX size={20} /></a>
            <a href="#" className="hover:text-foreground"><IconBrandLinkedin size={20} /></a>
            <a href="#" className="hover:text-foreground"><IconBrandGithub size={20} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-sm">Product</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Features</a></li>
            <li><a href="#" className="hover:text-foreground">Pricing</a></li>
            <li><a href="#" className="hover:text-foreground">Integrations</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-4 text-sm">Company</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">About us</a></li>
            <li><a href="#" className="hover:text-foreground">Our team</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>

        <div>
           <h4 className="font-medium mb-4 text-sm">Resources</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Terms of use</a></li>
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground">Support</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer