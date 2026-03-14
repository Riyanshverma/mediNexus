import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminDoctors = () => {
  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">Doctor Roster</h1>
        <Button className="font-normal">
          <Plus className="mr-2 h-4 w-4" />
          Invite Doctor
        </Button>
      </div>
      <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
        List of onboarded and pending doctors will appear here. You can manage their basic info and send email invitations.
      </div>
    </div>
  )
}