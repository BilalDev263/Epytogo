import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type props = PropsWithChildren<{
  classNames?: {
    dialogContent?: string;
    dialogHeader?: string;
    dialogTitle?: string;
    dialogDescription?: string;
  };
  title: string;
  description?: React.ReactNode;
  trigger: React.ReactNode;
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}>;

export function Modal({
  classNames,
  title,
  description,
  footer,
  trigger,
  children,
  onOpenChange,
}: props) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn(classNames?.dialogContent)}>
        <DialogHeader className={classNames?.dialogHeader}>
          <DialogTitle className={classNames?.dialogTitle}>{title}</DialogTitle>
          {description && (
            <DialogDescription className={classNames?.dialogDescription}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
