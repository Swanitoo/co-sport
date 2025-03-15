import { Text as ReactEmailText } from "@react-email/components";
import type { ComponentPropsWithoutRef } from "react";

export const Text = ({
  ...props
}: ComponentPropsWithoutRef<typeof ReactEmailText>) => {
  // On applique par défaut un style qui correspond au design de l'application
  const defaultClassName =
    "text-base font-normal leading-7 text-slate-700 my-3";

  return (
    <ReactEmailText
      className={props.className || defaultClassName}
      {...props}
    />
  );
};

export default Text;
