import * as React from "react";

import { cn } from "@/lib/utils";

const Card = ({ className, ...props }: React.ComponentPropsWithRef<"div">) => (
  <div
    className={cn(
      "flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
);
Card.displayName = "Card";

const CardTitle = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <h3
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight p-6 pb-0",
      className
    )}
    {...props}
  />
);
CardTitle.displayName = "CardTitle";

const CardDescription = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"p">) => (
  <p
    className={cn("text-sm text-muted-foreground p-6 pt-3", className)}
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

const CardFooter = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div className={cn("mt-auto p-6 pt-0", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

export { Card, CardFooter, CardTitle, CardDescription };
