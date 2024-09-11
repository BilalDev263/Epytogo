import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

import { Background } from "./Background";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel as CarouselRoot,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { restaurantInfo } from "@/data/data";

type Props = {
  className?: string;
  delay?: number;
  stopOnInteraction?: boolean;
};

export const Carousel = ({
  className,
  delay = 6000,
  stopOnInteraction = true,
}: Props) => {
  const plugin = useRef(Autoplay({ delay, stopOnInteraction }));

  return (
    <CarouselRoot className={className} plugins={[plugin.current]}>
      <CarouselContent>
        {restaurantInfo.map(({ heroImgUrl, name, restaurantsId }) => (
          <CarouselItem key={restaurantsId}>
            <Card>
              <CardContent>
                <Background
                  description="lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum."
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
