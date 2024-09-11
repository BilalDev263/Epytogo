import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "../ui/card";

export const CustomCard = ({
  place,
  className,
  onClick,
}: {
  place: {
    placeId: string;
    name: string;
    address: string;
    rating: number;
    photo: string;
  };
  className?: string;
  onClick?: () => void;
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const photoUrl = `https://places.googleapis.com/v1/${place.photo}/media?key=${apiKey}&maxWidthPx=500&maxHeightPx=360`;

  return (
    <Card
      key={place.placeId}
      className={cn(
        "relative flex flex-col cursor-pointer border-none shadow-lg transition-opacity hover:opacity-90 rounded-lg overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      <div className="relative w-full h-64 md:h-72 lg:h-80">
        <Image
          alt={place.name}
          className="w-full h-full object-cover"
          src={photoUrl}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <CardTitle className="absolute bottom-4 left-4 text-xl md:text-2xl lg:text-3xl text-white drop-shadow-lg bg-black/60 p-2 rounded-md">
          {place.name}
        </CardTitle>
      </div>
      <CardContent className="flex flex-col justify-between p-4 bg-white">
        <p className="text-base md:text-lg lg:text-xl font-semibold line-clamp-2">{place.address}</p>
        <div className="mt-2 flex items-center">
          <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-base md:text-lg lg:text-xl font-bold">{place.rating.toFixed(1)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
