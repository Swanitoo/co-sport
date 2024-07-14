import type { PageParams } from "@/types/next";
import { Layout, LayoutTitle } from "@/components/layout";

export default async function RoutePage(props: PageParams<{}>) {

  return (
    <Layout>
        <LayoutTitle>Ohhh... it's seems the payment has been canceled</LayoutTitle>
    </Layout>
  );
}
