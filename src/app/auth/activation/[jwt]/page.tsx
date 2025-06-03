// src/app/auth/activation/[jwt]/page.tsx
import { activateUserAction } from "@/actions/activate";
import Link from "next/link";

interface Props {
  params: {
    jwt: string;
  };
}

// Définition des types de réponse possibles
type ResponseType = "userNotExist" | "alreadyActivated" | "success" | "error";

const responseDetails: Record<
  ResponseType,
  {
    message: string;
    link: { href: string; text: string };
    colorClass: string;
    description: string;
  }
> = {
  userNotExist: {
    message: "L'utilisateur correspondant à ce lien n'existe pas.",
    link: { href: "/register", text: "Retourner à l'inscription" },
    colorClass: "text-red-500",
    description: "Il est possible que ce lien soit invalide ou que l'utilisateur ait été supprimé."
  },
  alreadyActivated: {
    message: "Votre compte est déjà activé.",
    link: { href: "/auth/login", text: "Aller à la connexion" },
    colorClass: "text-yellow-500",
    description: "Vous pouvez vous connecter directement à l'aide de vos identifiants."
  },
  success: {
    message: "Félicitations ! Votre compte a été activé avec succès.",
    link: { href: "/auth/login", text: "Aller à la connexion" },
    colorClass: "text-green-500",
    description: "Vous pouvez maintenant vous connecter avec vos identifiants."
  },
  error: {
    message: "Oups ! Une erreur est survenue.",
    link: { href: "/register", text: "Retourner à l'inscription" },
    colorClass: "text-red-500",
    description: "Nous avons rencontré un problème lors de l'activation de votre compte. Veuillez réessayer plus tard."
  },
};

// Composant générique pour afficher le message et le lien appropriés
const ResponseMessage: React.FC<{
  type: ResponseType;
  message: string;
  link: { href: string; text: string };
  colorClass: string;
  description: string;
}> = ({ message, link, colorClass, description }) => (
  <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
    <div className={`text-5xl mb-4 ${
      colorClass === "text-green-500" ? "text-green-500" : 
      colorClass === "text-yellow-500" ? "text-yellow-500" : 
      "text-red-500"
    }`}>
      {colorClass === "text-green-500" ? "✅" : 
       colorClass === "text-yellow-500" ? "⚠️" : 
       "❌"}
    </div>
    <h1 className={`${colorClass} text-2xl font-bold mb-4`}>{message}</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
    <Link 
      className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200" 
      href={link.href}
    >
      {link.text}
    </Link>
  </div>
);

const ActivationPage = async ({ params }: Props) => {
  let data: ResponseType;
  
  try {
    data = await activateUserAction(params.jwt);
  } catch (error) {
    console.error("Erreur lors de l'activation:", error);
    data = "error";
  }

  const responseConfig = responseDetails[data] || responseDetails.error;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <ResponseMessage
        type={data}
        message={responseConfig.message}
        link={responseConfig.link}
        colorClass={responseConfig.colorClass}
        description={responseConfig.description}
      />
    </div>
  );
};

export default ActivationPage;