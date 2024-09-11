import { FC, PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  className?: string;
  tag?: Extract<
    keyof JSX.IntrinsicElements,
    "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  >;
}>;

export const Title: FC<Props> = ({
  className,
  children,
  tag: CustomTitle = "h1",
}): JSX.Element => {
  return <CustomTitle className={className}>{children}</CustomTitle>;
};
