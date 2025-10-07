import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { registerUploadRoutes } from "./routes/upload";
import { setupChatWebSocket } from "./routes/chat";
import { insertProductSchema, insertGalleryImageSchema, insertProductImageSchema, insertOrderSchema } from "@shared/schema";
import { sendChatNotificationToAdmin, sendChatResponseToCustomer } from "./services/brevo";
import { chatStorage } from "./storage/chat";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Please set it in environment variables.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Register upload routes
  registerUploadRoutes(app);
  
  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured } = req.query;
      let products;
      
      if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating product: " + error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(parseInt(req.params.id), validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating product: " + error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product: " + error.message });
    }
  });

  // Product Images API
  app.get("/api/products/:productId/images", async (req, res) => {
    try {
      const images = await storage.getProductImages(parseInt(req.params.productId));
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching product images: " + error.message });
    }
  });

  app.post("/api/products/:productId/images", async (req, res) => {
    try {
      const validatedData = insertProductImageSchema.parse({
        productId: parseInt(req.params.productId),
        ...req.body
      });
      const image = await storage.createProductImage(validatedData);
      res.status(201).json(image);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating product image: " + error.message });
    }
  });

  app.delete("/api/products/:productId/images/:imageId", async (req, res) => {
    try {
      const success = await storage.deleteProductImage(parseInt(req.params.imageId));
      if (!success) {
        return res.status(404).json({ message: "Product image not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting product image: " + error.message });
    }
  });

  app.put("/api/products/:productId/images/:imageId/main", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const imageId = parseInt(req.params.imageId);
      const success = await storage.setMainProductImage(productId, imageId);
      if (!success) {
        return res.status(404).json({ message: "Product image not found" });
      }
      res.json({ message: "Main image updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error updating main image: " + error.message });
    }
  });

  // Gallery API
  app.get("/api/gallery", async (req, res) => {
    try {
      const { category } = req.query;
      let images;
      
      if (category) {
        images = await storage.getGalleryImagesByCategory(category as string);
      } else {
        images = await storage.getGalleryImages();
      }
      
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching gallery images: " + error.message });
    }
  });

  app.post("/api/gallery", async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating gallery image: " + error.message });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      const success = await storage.deleteGalleryImage(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting gallery image: " + error.message });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { items, customerInfo, shippingCost = 0 } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
      }

      const amount = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.price) * item.quantity);
      }, 0) + parseFloat(shippingCost);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => {
          // Valider l'URL de l'image - ne l'inclure que si c'est une URL complète valide
          const validImageUrl = item.imageUrl && 
            (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')) 
            ? item.imageUrl : null;
          
          return {
            price_data: {
              currency: 'eur',
              product_data: {
                name: item.name,
                images: validImageUrl ? [validImageUrl] : [],
              },
              unit_amount: Math.round(parseFloat(item.price) * 100),
            },
            quantity: item.quantity,
          };
        }),
        mode: 'payment',
        success_url: `${req.headers.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart`,
        metadata: {
          customerInfo: JSON.stringify(customerInfo || {}),
          shippingCost: shippingCost.toString(),
        },
        shipping_address_collection: {
          allowed_countries: ['BE', 'FR', 'NL', 'DE', 'ES', 'IT', 'LU'],
        },
      });

      res.json({ clientSecret: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("Error creating payment session:", error);
      res.status(500).json({ message: "Error creating payment session: " + error.message });
    }
  });

  // Stripe webhook
  app.post("/webhook", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const event = req.body;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        const customerInfo = session.metadata?.customerInfo ? 
          JSON.parse(session.metadata.customerInfo) : {};

        const orderData = {
          customerName: session.customer_details?.name || customerInfo.name || "",
          customerEmail: session.customer_details?.email || customerInfo.email || "",
          customerPhone: session.customer_details?.phone || customerInfo.phone || "",
          customerAddress: session.customer_details?.address?.line1 || customerInfo.address || "",
          customerCity: session.customer_details?.address?.city || customerInfo.city || "",
          customerPostalCode: session.customer_details?.address?.postal_code || customerInfo.postalCode || "",
          customerCountry: session.customer_details?.address?.country || customerInfo.country || "",
          items: JSON.stringify(customerInfo.items || []),
          totalAmount: (session.amount_total / 100).toString(),
          shippingCost: session.metadata?.shippingCost || "0",
          status: "paid",
          stripeSessionId: session.id,
        };

        await storage.createOrder(orderData);
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: "Webhook error: " + error.message });
    }
  });

  // Simple shipping calculation (without DPD)
  app.post("/api/calculate-shipping", async (req, res) => {
    try {
      const { country, items } = req.body;
      
      let shippingCost = 0;
      
      // Simple shipping rates by country
      if (country === 'BE') {
        shippingCost = 7.50;
      } else if (['FR', 'NL', 'DE', 'LU'].includes(country)) {
        shippingCost = 12.90;
      } else {
        shippingCost = 19.90;
      }

      res.json({ 
        shippingCost: shippingCost.toFixed(2),
        estimatedDelivery: "2-5 business days",
        carrier: "Standard Shipping"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error calculating shipping: " + error.message });
    }
  });

  // Test email route
  app.post("/api/test-email", async (req, res) => {
    try {
      const { customerName, customerEmail, message, sessionId } = req.body;
      
      const result = await sendChatNotificationToAdmin(
        customerName || "Test Client",
        customerEmail || "test@example.com", 
        message || "Test message",
        sessionId || "test-session-123"
      );
      
      res.json({ 
        success: result,
        message: result ? "Email sent successfully" : "Failed to send email"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error sending test email: " + error.message });
    }
  });

  // API pour récupérer la session d'un utilisateur par email
  app.get("/api/chat/user-session", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }

      // Chercher une session existante pour cet email dans chatStorage
      const existingSession = await chatStorage.getChatSessionByEmail(email);
      
      if (existingSession) {
        res.json({
          sessionId: existingSession.sessionId,
          customerName: existingSession.customerName,
          customerEmail: email
        });
      } else {
        // Pas de session trouvée pour cet email
        res.status(404).json({ message: "No session found for this email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user session: " + error.message });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for chat
  setupChatWebSocket(httpServer, app);
  
  return httpServer;
}