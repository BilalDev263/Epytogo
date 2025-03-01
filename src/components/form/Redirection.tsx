import Link from "next/link";

export const AuthLink = ({ isRegisterPage }: { isRegisterPage: boolean }) => {
  const text = isRegisterPage
    ? "Vous avez déjà un compte ?"
    : "Vous n'avez pas de compte ?";

  const linkText = isRegisterPage ? "Connectez-vous" : "Inscrivez-vous";
  const linkHref = isRegisterPage ? "/auth/login" : "/register";
  const ariaLabel = isRegisterPage ? "Se connecter" : "S'inscrire";

  return (
    <div className="flex w-full justify-start">
      <p className="text-sm text-muted-foreground">
        {text}{" "}
        <span className="text-primary">
          <Link href={linkHref} aria-label={ariaLabel}>
            {linkText}
          </Link>
        </span>
      </p>
    </div>
  );
};
