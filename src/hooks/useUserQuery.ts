import useShowToast from "./useShowToast";
import { RegisterPayload } from "@/validators/registerSchema";
import {
  LoginPayload,
  UpdateEmailPayload,
  UpdatePasswordPayload,
} from "@/validators/loginSchema";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useStore } from "@/store/useStore";
import { updateEmailAction } from "@/actions/updateEmail";
import { updatePasswordAction } from "@/actions/updatePassword";
import { registerAction } from "@/actions/register";
import { UseFormReset } from "react-hook-form";

type RegisterParams = {
  data: RegisterPayload;
  reset: UseFormReset<RegisterPayload>;
};
type LoginParams = {
  data: LoginPayload;
  reset: UseFormReset<LoginPayload>;
  callbackUrl?: string;
};

export const useUserQuery = () => {
  const { showToast } = useShowToast();
  const { setCurrentUser } = useStore();

  const router = useRouter();
  const registerUser = async ({ data, reset }: RegisterParams) => {
    {
      const { accepted, confirmPassword, ...user } = data;
      try {
        const newUser = await registerAction(user);
        showToast({
          title: "Inscription réussie",
          description:
            "un email de confirmation a été envoyé sur votre boite mail",
          variant: "default",
          redirectTo: "/auth/login",
        });
        reset();
        return newUser;
      } catch (error) {
        showToast({
          description: "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        });

        console.error("Error registering user:", error);
      }
    }
  };

  const loginUser = async ({ data, reset, callbackUrl }: LoginParams) => {
    const response = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (!response?.ok) {
      showToast({
        description: response?.error as string,
        variant: "destructive",
      });

      return;
    }
    showToast({
      description:
        "Connexion réussie. Vous allez être redirigé vers la page d'accueil.",
      variant: "default",
      redirectTo: "/",
    });
    reset();
  };

  const updateEmail = async ({
    userId,
    email,
    reset,
  }: UpdateEmailPayload & {
    reset: UseFormReset<UpdateEmailPayload>;
  }) => {
    {
      try {
        const newUser = await updateEmailAction({ userId, email });
        showToast({
          description: "Votre adresse email a été mise à jour avec succès.",
          variant: "default",
        });

        setCurrentUser(newUser);
        reset();
        return newUser;
      } catch (error) {
        showToast({
          description: "Une erreur est survenue lors de la mise à jour",
          variant: "destructive",
        });

        console.error("Error registering user:", error);
      }
    }
  };

  const updatePassword = async ({
    userId,
    password,
    newPassword,
    reset,
  }: UpdatePasswordPayload & {
    reset: UseFormReset<UpdatePasswordPayload>;
  }) => {
    {
      try {
        const newUser = await updatePasswordAction({
          userId,
          password,
          newPassword,
        });
        showToast({
          description: "Votre mot de passe a été mis à jour avec succès.",
          variant: "default",
        });

        setCurrentUser(newUser);
        reset();
        return newUser;
      } catch (error) {
        showToast({
          description: "Une erreur est survenue lors de la mise à jour",
          variant: "destructive",
        });

        console.error("Error registering user:", error);
      }
    }
  };

  return { registerUser, loginUser, updateEmail, updatePassword };
};
