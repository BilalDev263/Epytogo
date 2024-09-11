import { forwardRef } from "react";
import { Button, ButtonProps } from "../ui/button";

export const SubmitButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { label: string }
>(({ label, ...props }, ref) => (
  <Button type="submit" aria-label={label} {...props} ref={ref}>
    {label}
  </Button>
));

SubmitButton.displayName = "SubmitButton";
