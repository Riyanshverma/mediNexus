import { useState } from "react";
import { IconHeartbeat, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

export type Role = 'patient' | 'doctor' | 'admin';

const LoginPage = () => {
  const navigate = useNavigate();
  // Manage the state for the selected role 
  const [role, setRole] = useState<Role>('patient'); 

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Portion */}
      <div className="relative hidden h-full flex-col bg-muted p-8 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary/90" />
        <div className="relative z-20 flex items-center gap-2 font-serif text-2xl">
          <IconHeartbeat className="h-8 w-8 text-white" />
          mediNexus
        </div>
        <Button 
          variant="ghost" 
          className="absolute top-8 right-8 text-white hover:bg-primary-foreground hover:text-primary z-20 font-light text-md"
          onClick={() => navigate("/")}
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This platform has completely transformed how I manage my appointments and patient records."
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      
      {/* Right Portion */}
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-end lg:hidden mb-8 w-full">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <IconArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
        <div className="flex justify-end items-center gap-4 w-full">
          <Button variant="ghost" className="font-light text-md" size="lg">Need help?</Button>
          <Button 
            className="font-light text-md" 
            size="lg" 
            disabled={role === "doctor"}
          >
            Register
          </Button>
        </div>
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] mt-24">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-4xl font-light tracking-tight">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground pb-4 capitalize">
              Login to your <span className="text-primary">{role}</span> account
            </p>
          </div>

          {/* Role Section Tabs */}
          <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="w-full">
             <TabsList className="grid w-full grid-cols-3 ">
               <TabsTrigger value="patient" className="text-md font-light">Patient</TabsTrigger>
               <TabsTrigger value="doctor" className="text-md font-light">Doctor</TabsTrigger>
               <TabsTrigger value="admin" className="text-md font-light">Admin</TabsTrigger>
             </TabsList>
          </Tabs>

          <LoginForm role={role} />
          
          <p className="px-8 text-center text-md text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;