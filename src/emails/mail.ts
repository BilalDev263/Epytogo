import { Resend } from "resend";
import { Welcome } from "./templates/Welcome";

interface SendMail {
  to: string[];
  name: string;
  subject: string;
  url: string;
}

export async function sendMail({ to, name, subject, url }: SendMail) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject,
      react: Welcome({ name, url }),
    });
    return data;
  } catch (e) {
    console.error(e);
  }
}
