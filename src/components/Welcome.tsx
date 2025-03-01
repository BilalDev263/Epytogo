type Props = {
  title: string;
  description: string;
};

export const Welcome = ({ title, description }: Props) => {
  return (
    <div className="flex w-4/6 flex-col gap-4 text-center text-white">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        {title}
      </h1>
      <p className="mt-6 text-2xl leading-7">{description}</p>
    </div>
  );
};
