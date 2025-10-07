// Configuration Brevo avec fetch direct
async function initializeBrevo() {
  if (!process.env.BREVO_API_KEY) {
    console.log('BREVO_API_KEY not configured - email notifications disabled');
    return null;
  }

  // Utiliser fetch directement pour contourner les problèmes d'API
  return {
    sendEmail: async (emailData: any) => {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY!
        },
        body: JSON.stringify({
          sender: emailData.sender,
          to: emailData.to,
          subject: emailData.subject,
          htmlContent: emailData.htmlContent,
          textContent: emailData.textContent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Brevo API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    }
  };
}

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderName?: string;
  senderEmail?: string;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log('Email sending skipped - Brevo API key not configured');
      return false;
    }

    const brevoService = await initializeBrevo();
    if (!brevoService) {
      console.log('Email sending skipped - Brevo service initialization failed');
      return false;
    }

    const emailPayload = {
      sender: {
        name: emailData.senderName || "Equi Saddles - Chat Support",
        email: emailData.senderEmail || "equisaddles@gmail.com"
      },
      to: [{ email: emailData.to }],
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent || emailData.htmlContent.replace(/<[^>]*>/g, '')
    };

    const response = await brevoService.sendEmail(emailPayload);
    console.log('Email sent successfully via Brevo API:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendChatNotificationToAdmin(customerName: string, customerEmail: string, message: string, sessionId: string): Promise<boolean> {
  const adminEmail = "equisaddles@gmail.com"; // Email de l'admin vérifié dans Brevo
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  
  const emailData: EmailData = {
    to: adminEmail,
    subject: `🔔 Nouveau message chat - ${customerName}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #8B5A3C; margin-bottom: 20px;">💬 Nouveau message de chat reçu</h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Informations du client:</h3>
          <p style="margin: 5px 0;"><strong>Nom:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
          <p style="margin: 5px 0;"><strong>Session ID:</strong> ${sessionId}</p>
        </div>
        
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #8B5A3C; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Message:</h3>
          <p style="margin: 0; line-height: 1.5;">${message}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://${domain}/admin?tab=chat&session=${sessionId}" 
             style="background-color: #8B5A3C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            🔗 Répondre directement à cette conversation
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
          <a href="https://${domain}/admin" 
             style="background-color: #6c757d; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block; font-size: 14px; font-weight: bold;">
            📊 Voir toutes les conversations
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          Cette notification a été envoyée automatiquement par le système de chat Equi Saddles.<br>
          Pour désactiver ces notifications, connectez-vous à votre interface admin.
        </p>
      </div>
    `,
    senderName: "Equi Saddles - Système de Chat", 
    senderEmail: "equisaddles@gmail.com"
  };

  return await sendEmail(emailData);
}

export async function sendChatResponseToCustomer(customerEmail: string, customerName: string, adminMessage: string): Promise<boolean> {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  
  const emailData: EmailData = {
    to: customerEmail,
    subject: `📩 Réponse de l'équipe Equi Saddles`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #8B5A3C; margin-bottom: 20px;">📩 Réponse de notre équipe</h2>
        
        <p style="margin-bottom: 20px;">Bonjour ${customerName},</p>
        
        <p style="margin-bottom: 20px;">Nous avons répondu à votre message sur notre chat en ligne:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #8B5A3C; margin-bottom: 20px;">
          <p style="margin: 0; line-height: 1.5; font-style: italic;">${adminMessage}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://equisaddles.com/chat?email=${encodeURIComponent(customerEmail)}" 
             style="background-color: #8B5A3C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            🔗 Continuer la conversation
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="font-size: 14px; color: #333; margin-bottom: 10px;">
          <strong>Equi Saddles</strong><br>
          Spécialiste en selles d'équitation<br>
          Rue du Vicinal 9, 4141 Louveigné, Belgique<br>
          Tél: +32 496 94 41 25<br>
          Email: contact@equisaddles.com
        </p>
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          Merci de votre confiance. Nous sommes là pour vous accompagner dans vos projets équestres.
        </p>
      </div>
    `,
    senderName: "Equi Saddles",
    senderEmail: "equisaddles@gmail.com"
  };

  return await sendEmail(emailData);
}