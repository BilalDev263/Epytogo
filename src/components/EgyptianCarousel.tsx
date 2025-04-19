import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

import { Background } from "./Background";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel as CarouselRoot,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { egyptianSites } from "@/data/data";

type Props = {
  className?: string;
  delay?: number;
  stopOnInteraction?: boolean;
};

export const EgyptianCarousel = ({
  className,
  delay = 6000,
  stopOnInteraction = true,
}: Props) => {
  const plugin = useRef(Autoplay({ delay, stopOnInteraction }));

  return (
    <CarouselRoot className={className} plugins={[plugin.current]}>
      <CarouselContent>
        {egyptianSites.map(({ heroImgUrl, name,description,id }) => (
          <CarouselItem key={id}>
            <Card>
              <CardContent>
                <Background
                  description={description}
                  image={heroImgUrl}
                  title={name}
                />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </CarouselRoot>
  );
};
