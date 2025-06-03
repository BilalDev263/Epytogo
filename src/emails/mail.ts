// src/emails/mail.ts
import { Resend } from "resend";
import { Welcome } from "./templates/Welcome";

interface SendMail {
  to: string[];
  name: string;
  subject: string;
  url: string;
}

export async function sendMail({ to, name, subject, url }: SendMail) {
  // Vérifier si la clé API Resend est configurée
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY n'est pas configurée");
    
    // En développement, simuler l'envoi
    if (process.env.NODE_ENV === 'development') {
      console.log("📧 Email simulé (RESEND_API_KEY manquante):");
      console.log(`To: ${to.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log(`Name: ${name}`);
      console.log(`URL: ${url}`);
      return { success: true, id: 'simulated-dev' };
    }
    
    throw new Error("Configuration email manquante");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Epytogo <onboarding@resend.dev>", // Utilise le domaine par défaut de Resend
      to,
      subject,
      react: Welcome({ name, url }),
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw new Error(`Erreur envoi email: ${error.message}`);
    }

    console.log("✅ Email envoyé avec succès:", data?.id);
    return data;
  } catch (error) {
    console.error("Erreur dans sendMail:", error);
    throw error;
  }
}