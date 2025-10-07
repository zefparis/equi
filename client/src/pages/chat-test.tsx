import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function ChatTestPage() {
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();

  const handleTestChat = () => {
    if (email && email.includes('@')) {
      setLocation(`/chat?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Test Chat Page</h1>
          <p className="text-muted-foreground">Entrer un email pour tester le chat</p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Button 
            onClick={handleTestChat}
            disabled={!email.includes('@')}
            className="w-full"
          >
            Ouvrir Chat
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setLocation('/')}
            className="w-full"
          >
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}