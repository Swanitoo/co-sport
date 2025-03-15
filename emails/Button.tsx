import { Button as ReactEmailButton } from "@react-email/components";
import type { ComponentPropsWithoutRef } from "react";

export const Button = ({
  ...props
}: ComponentPropsWithoutRef<typeof ReactEmailButton>) => {
  // On applique par défaut un style qui correspond au design de l'application
  // Utilisation du jaune pour être cohérent avec le site
  const defaultClassName =
    "rounded-md bg-yellow-500 px-4 py-3 text-center text-base font-medium text-white no-underline hover:bg-yellow-600";

  return (
    <ReactEmailButton
      className={props.className || defaultClassName}
      {...props}
    />
  );
};

export default Button;
