import { RegisterPayload } from "@/validators/registerSchema";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../ui/input";

type EmailFieldProps = {
  register: UseFormRegister<RegisterPayload>;
  errors: FieldErrors<RegisterPayload>;
};

export const EmailField = ({ register, errors }: EmailFieldProps) => (
  <Input
    label="Email*"
    className="h-12 w-full"
    placeholder="Entrez votre email"
    type="email"
    aria-label="Adresse e-mail"
    error={errors.email?.message as string}
    {...register("email")}
  />
);
