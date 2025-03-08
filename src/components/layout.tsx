import { twx } from "@/lib/twx";

export const Layout = twx.div((props) => [
  "max-w-5xl w-full flex flex-col py-6 gap-4 mx-auto px-4",
]);

export const LayoutTitle = twx.h1((props) => [`text-4xl font-bold`]);

export const LayoutDescription = twx.p((props) => [
  `text-lg text-muted-foreground`,
]);
