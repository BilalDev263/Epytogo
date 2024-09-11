export type ItemId =
  | "all"
  | "restaurant"
  | "hotel"
  | "home"
  | "favorite"
  | "profile"
  | "logout";
export type NavItem = {
  id: ItemId;
  name: string;
  icon: React.ReactNode;
  tooltip?: boolean;
  handleClick?: () => void;
};
