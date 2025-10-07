import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "../hooks/use-cart";
import { useLanguage } from "../hooks/use-language";
import { useToast } from "../hooks/use-toast";
import { scrollToTop } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
// Header, Footer et ChatWidget sont maintenant dans App.tsx
import { Truck, Mail, Calculator, Info } from "lucide-react";
// Plus besoin des imports Stripe pour les éléments intégrés
import { apiRequest } from "../lib/queryClient";

// Plus besoin de charger Stripe côté client avec cette approche

// Schema de validation pour le formulaire d'adresse
const checkoutSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(5, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(4, "Code postal requis"),
  country: z.string().min(2, "Pays requis"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Composant pour afficher l'état de la commande
function OrderSummaryCard({ stripeUrl }: { stripeUrl?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>✅</span> Commande créée - Paiement en cours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Votre commande a été créée avec succès. Le paiement Stripe s'est ouvert dans un nouvel onglet. 
          Si l'onglet ne s'est pas ouvert automatiquement, cliquez sur le bouton ci-dessous.
        </p>
        
        {stripeUrl && (
          <div className="mb-4">
            <Button 
              onClick={() => window.open(stripeUrl, '_blank', 'noopener,noreferrer')}
              className="w-full"
            >
              Ouvrir le paiement Stripe
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span>🔒</span>
            <span>Paiement sécurisé avec Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>📧</span>
            <span>Confirmation par email après paiement</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>🚚</span>
            <span>Calcul des frais de port par notre équipe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Checkout() {
  const { t } = useLanguage();
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [stripeUrl, setStripeUrl] = useState("");
  const [orderCreated, setOrderCreated] = useState(false);

  // Scroll to top when page loads
  useEffect(() => {
    scrollToTop();
  }, []);

  // Redirection si le panier est vide
  useEffect(() => {
    if (items.length === 0) {
      window.location.href = "/catalog";
    }
  }, [items]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "BE",
      notes: "",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      // Créer l'intention de paiement avec les données du client
      const orderData = {
        ...data,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total: totalAmount,
      };

      const response = await apiRequest("POST", "/api/create-payment-intent", {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image && (item.image.startsWith('http://') || item.image.startsWith('https://')) 
            ? item.image : null
        })),
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          notes: data.notes || ""
        },
        shippingCost: 0 // Les frais seront calculés plus tard
      });

      const result = await response.json();
      
      // Redirection vers Stripe Checkout dans un nouvel onglet
      if (result.clientSecret) {
        // Ouvrir dans un nouvel onglet pour éviter les problèmes d'iframe
        const stripeWindow = window.open(result.clientSecret, '_blank', 'noopener,noreferrer');
        
        if (!stripeWindow) {
          // Si le popup est bloqué, essayer une redirection directe
          window.location.href = result.clientSecret;
        } else {
          // Afficher un message d'information à l'utilisateur
          toast({
            title: "Redirection vers Stripe",
            description: "Votre paiement s'ouvre dans un nouvel onglet. Veuillez compléter le paiement là-bas.",
          });
          setOrderCreated(true);
          setStripeUrl(result.clientSecret);
        }
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {t("checkout.title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire d'adresse de livraison */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-blue-50 dark:bg-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-blue-50 dark:bg-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} className="bg-blue-50 dark:bg-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} className="bg-blue-50 dark:bg-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse complète</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-blue-50 dark:bg-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-blue-50 dark:bg-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input {...field} className="bg-blue-50 dark:bg-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger id="country" className="bg-blue-50 dark:bg-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="BE">Belgique</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                                <SelectItem value="NL">Pays-Bas</SelectItem>
                                <SelectItem value="DE">Allemagne</SelectItem>
                                <SelectItem value="LU">Luxembourg</SelectItem>
                                <SelectItem value="CH">Suisse</SelectItem>
                                <SelectItem value="ES">Espagne</SelectItem>
                                <SelectItem value="IT">Italie</SelectItem>
                                <SelectItem value="GB">Royaume-Uni</SelectItem>
                                <SelectItem value="US">États-Unis</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optionnel)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Instructions de livraison..." className="bg-blue-50 dark:bg-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!orderCreated && (
                      <Button type="submit" className="w-full">
                        Procéder au paiement
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Information sur les frais de port */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  <strong>Calcul des frais de port</strong>
                </div>
                <p>
                  Les frais de livraison seront calculés par notre équipe avec DPD selon votre adresse. 
                  Vous recevrez une quotation détaillée par email avant la finalisation de votre commande.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-3 w-3" />
                  <span>Expédition depuis: Rue du Vicinal 9, 4141 Louveigné, Belgique</span>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Résumé de commande et paiement */}
          <div className="space-y-6">
            {/* Résumé du panier */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantité: {item.quantity} • Taille: {item.size}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(parseFloat(item.price) * item.quantity).toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Sous-total</span>
                    <span>{totalAmount.toFixed(2)}€</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>+ Frais de livraison (calculés séparément)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* État de la commande */}
            {orderCreated && <OrderSummaryCard stripeUrl={stripeUrl} />}
          </div>
        </div>
      </div>
    </div>
  );
}