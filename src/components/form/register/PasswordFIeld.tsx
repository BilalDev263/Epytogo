import { RegisterPayload } from "@/validators/registerSchema";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../ui/input";
import { PasswordStrength } from "../PasswordStrength";

type PasswordFieldsProps = {
  register: UseFormRegister<RegisterPayload>;
  errors: FieldErrors<RegisterPayload>;
  strength: number;
};

export const PasswordFields = ({
  register,
  errors,
  strength,
}: PasswordFieldsProps) => (
  <div className="flex w-full gap-2">
    <div className="flex flex-col gap-1 w-full">
      <Input
        label="Mot de passe*"
        className="h-12 w-full"
        placeholder="Entrez votre mot de passe"
        type="password"
        aria-label="Mot de passe"
        error={errors.password?.message as string}
        {...register("password")}
      />
      <PasswordStrength className="px-1" strength={strength} />
    </div>
    <Input
      label="Confirmez mot de passe*"
      className="h-12 w-full"
      placeholder="Confirmez votre mot de passe"
      type="password"
      aria-label="Mot de passe"
      error={errors.confirmPassword?.message as string}
      {...register("confirmPassword")}
    />
  </div>
);
