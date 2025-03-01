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
  }
> = {
  userNotExist: {
    message: "L'utilisateur correspondant à ce lien n'existe pas.",
    link: { href: "/register", text: "Retourner à l'inscription" },
    colorClass: "text-red-500",
  },
  alreadyActivated: {
    message: "Votre compte est déjà activé.",
    link: { href: "/auth/login", text: "Aller à la connexion" },
    colorClass: "text-yellow-500",
  },
  success: {
    message: "Félicitations ! Votre compte a été activé avec succès.",
    link: { href: "/auth/login", text: "Aller à la connexion" },
    colorClass: "text-green-500",
  },
  error: {
    message: "Oups ! Une erreur est survenue.",
    link: { href: "/register", text: "Retourner à l'inscription" },
    colorClass: "text-red-500",
  },
};

// Composant générique pour afficher le message et le lien appropriés
const ResponseMessage: React.FC<{
  type: ResponseType;
  message: string;
  link: { href: string; text: string };
  colorClass: string;
}> = ({ message, link, colorClass }) => (
  <div className="text-center">
    <p className={`${colorClass} text-2xl font-bold`}>{message}</p>
    <p className="mt-2 text-gray-700">
      {colorClass === "text-red-500"
        ? "Il est possible que ce lien soit invalide ou que l'utilisateur ait été supprimé."
        : colorClass === "text-yellow-500"
        ? "Vous pouvez vous connecter directement à l'aide de vos identifiants."
        : colorClass === "text-green-500"
        ? "Vous pouvez maintenant vous connecter avec vos identifiants."
        : "Nous avons rencontré un problème lors de l'activation de votre compte. Veuillez réessayer plus tard."}
    </p>
    <Link className="mt-4 text-blue-500 underline" href={link.href}>
      {link.text}
    </Link>
  </div>
);

const ActivationPage = async ({ params }: Props) => {
  const data = await activateUserAction(params.jwt);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      {data in responseDetails ? (
        <ResponseMessage
          type={data as ResponseType}
          message={responseDetails[data as ResponseType].message}
          link={responseDetails[data as ResponseType].link}
          colorClass={responseDetails[data as ResponseType].colorClass}
        />
      ) : (
        <ResponseMessage
          type="error"
          message="Une erreur inattendue est survenue."
          link={{ href: "/register", text: "Retourner à l'inscription" }}
          colorClass="text-red-500"
        />
      )}
    </div>
  );
};

export default ActivationPage;
