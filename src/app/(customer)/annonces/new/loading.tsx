import { Layout, LayoutTitle } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function NewProductLoading() {
  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/home" className="hover:text-foreground">
          <Home className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/annonces" className="hover:text-foreground">
          Annonces
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Créer une annonce</span>
      </div>
      <LayoutTitle>Créer une annonce</LayoutTitle>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
