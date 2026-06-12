import { cn } from "@/lib/utils";

type LandingSectionHeadingProps = {
  badge?: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export default function LandingSectionHeading({
  badge,
  title,
  description,
  align = "left",
}: LandingSectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {badge ? (
        <p
          className={cn(
            "w-fit text-xs font-semibold uppercase tracking-[0.18em] text-orange-500",
            align === "center" && "mx-auto",
          )}
        >
          {badge}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl",
          badge && "mt-4",
        )}
      >
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}
