import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("Test Client");
  const [customerEmail, setCustomerEmail] = useState("");
  const [message, setMessage] = useState("Ceci est un message de test du système de chat.");
  const [result, setResult] = useState<any>(null);

  const handleTestEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          message,
          sessionId: `test-${Date.now()}`
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        alert("✅ Email envoyé avec succès à equisaddles@gmail.com");
      } else {
        alert("❌ Échec: " + (data.message || "L'email n'a pas pu être envoyé"));
      }
    } catch (error: any) {
      console.error("Error:", error);
      setResult({ error: error.message });
      alert("❌ Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test d'envoi d'email Brevo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cette page teste l'envoi de notifications email via l'API Brevo.
              L'email sera envoyé à <strong>equisaddles@gmail.com</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du client (simulé)
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nom du client"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email du client (simulé)
              </label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Message test
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message de test..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleTestEmail}
              disabled={loading || !customerEmail.includes('@')}
              className="w-full"
            >
              {loading ? "Envoi en cours..." : "📧 Envoyer email de test"}
            </Button>

            {result && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Résultat :</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">ℹ️ Configuration actuelle :</h4>
              <ul className="space-y-1 text-xs">
                <li>• Email expéditeur : <code>equisaddles@gmail.com</code></li>
                <li>• Email destinataire (admin) : <code>equisaddles@gmail.com</code></li>
                <li>• API utilisée : Brevo API v3</li>
                <li>• Variable d'env : <code>BREVO_API_KEY</code></li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">⚠️ Points à vérifier si l'email n'arrive pas :</h4>
              <ul className="space-y-1 text-xs">
                <li>1. La clé API Brevo est bien configurée dans Railway</li>
                <li>2. L'email equisaddles@gmail.com est vérifié dans Brevo</li>
                <li>3. Vérifier les logs Railway pour les erreurs</li>
                <li>4. Vérifier le dossier spam de equisaddles@gmail.com</li>
                <li>5. Vérifier les logs d'activité dans le dashboard Brevo</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
