import { Progress } from "turath-collective";

export function Default() {
  return <Progress value={60} className="w-[320px] max-w-full" />;
}

export function Steps() {
  return (
    <div className="grid w-[320px] max-w-full gap-4">
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={90} />
    </div>
  );
}
