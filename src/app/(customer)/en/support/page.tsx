// English version of the support page (for internationalization)
// This page is simply an entry point that redirects to the main page

import { redirect } from "next/navigation";

interface PageParams {
  locale?: string;
}

export default async function EnglishSupportPage(props: {
  params: Promise<PageParams>;
}): Promise<null> {
  redirect(`/support`);
  return null;
}
