import { Welcome } from "./Welcome";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  image: string;
  title: string;
  description: string;
};

export const Background = ({ className, image, title, description }: Props) => {
  return (
    <div
      className={cn(
        "flex justify-center items-center w-full h-screen",
        className,
      )}
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(0, 0, 0, 0.7), 
            rgba(0, 0, 0, 0.7)
          ), 
          url(${image})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Welcome description={description} title={title} />
    </div>
  );
};
