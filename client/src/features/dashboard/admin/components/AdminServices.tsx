import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminServices = () => {
  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">Service Catalogue</h1>
        <Button className="font-normal">
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
        Define hospital services, link them to specific doctors, set duration, and pricing here.
      </div>
    </div>
  )
}