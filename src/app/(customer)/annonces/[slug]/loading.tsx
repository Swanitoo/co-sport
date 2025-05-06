import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Classe d'animation personnalisée pour une apparition plus rapide
const skeletonClass = "animate-pulse";

export default function ProductLoadingPage() {
  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Fil d'Ariane standardisé */}
        <Breadcrumb
          items={[
            { href: "/annonces", label: "Annonces" },
            {
              label: <Skeleton className={cn("h-4 w-32", skeletonClass)} />,
              isLoading: true,
            },
          ]}
        />

        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="max-w-[90%] space-y-2">
            <Skeleton className={cn("h-8 w-2/3", skeletonClass)} />
            <div className="mt-2 flex items-center gap-2">
              <Avatar>
                <AvatarFallback className="bg-muted">
                  <Skeleton
                    className={cn("size-8 rounded-full", skeletonClass)}
                  />
                </AvatarFallback>
              </Avatar>
              <Skeleton className={cn("h-4 w-32", skeletonClass)} />
            </div>
          </div>
          <div className="flex space-x-2">
            <Skeleton className={cn("h-9 w-24", skeletonClass)} />
            <Skeleton className={cn("h-9 w-24", skeletonClass)} />
          </div>
        </div>

        {/* Info sport et niveau */}
        <div className="flex flex-col text-lg sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className={cn("size-8 rounded-full", skeletonClass)} />
            <Skeleton className={cn("h-6 w-24", skeletonClass)} />
          </div>
          <span className="hidden text-muted-foreground sm:block">•</span>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <Skeleton className={cn("size-8 rounded-full", skeletonClass)} />
            <Skeleton className={cn("h-6 w-24", skeletonClass)} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Colonne 1-2: Description et Carte */}
          <div className="col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className={cn("h-6 w-40", skeletonClass)} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Carte */}
                  <Skeleton
                    className={cn("h-[300px] w-full rounded", skeletonClass)}
                  />

                  {/* Info lieu */}
                  <div className="flex items-start gap-2">
                    <Skeleton
                      className={cn("mt-1 size-4 shrink-0", skeletonClass)}
                    />
                    <div>
                      <Skeleton className={cn("h-5 w-48", skeletonClass)} />
                      <Skeleton
                        className={cn("mt-1 h-4 w-64", skeletonClass)}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <Skeleton className={cn("h-4 w-32 mb-2", skeletonClass)} />
                    <Skeleton className={cn("h-4 w-full", skeletonClass)} />
                    <Skeleton
                      className={cn("h-4 w-full mt-1", skeletonClass)}
                    />
                    <Skeleton className={cn("h-4 w-2/3 mt-1", skeletonClass)} />
                  </div>

                  {/* Boutons de partage */}
                  <div className="mt-6 border-t pt-4">
                    <Skeleton className={cn("h-5 w-40 mb-3", skeletonClass)} />
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton
                          key={i}
                          className={cn("h-9 w-9 rounded-full", skeletonClass)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne 3: Actions et Info utilisateur */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className={cn("h-6 w-36", skeletonClass)} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Table d'avis */}
                  <div className="rounded-md border">
                    <div className="border-b bg-muted/50 p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Skeleton className={cn("h-4 w-16", skeletonClass)} />
                        <Skeleton className={cn("h-4 w-12", skeletonClass)} />
                        <Skeleton className={cn("h-4 w-12", skeletonClass)} />
                      </div>
                    </div>
                    <div className="p-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 py-2">
                          <Skeleton className={cn("h-4 w-16", skeletonClass)} />
                          <Skeleton className={cn("h-4 w-8", skeletonClass)} />
                          <Skeleton className={cn("h-4 w-24", skeletonClass)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col gap-2">
                    <Button disabled className="w-full">
                      <Skeleton className={cn("h-4 w-32", skeletonClass)} />
                    </Button>
                    <Button disabled variant="outline" className="w-full">
                      <Skeleton className={cn("h-4 w-32", skeletonClass)} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membres */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className={cn("h-6 w-20", skeletonClass)} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton
                          className={cn("size-8 rounded-full", skeletonClass)}
                        />
                        <div>
                          <Skeleton className={cn("h-4 w-24", skeletonClass)} />
                          <Skeleton
                            className={cn("h-3 w-16 mt-1", skeletonClass)}
                          />
                        </div>
                      </div>
                      <Skeleton
                        className={cn("h-8 w-8 rounded-full", skeletonClass)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Chat - Conditionnelle */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className={cn("h-6 w-32", skeletonClass)} />
          </div>
          <Skeleton className={cn("h-[350px] w-full rounded", skeletonClass)} />
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className={cn("h-12 flex-1 rounded", skeletonClass)} />
            <Skeleton className={cn("h-10 w-20 rounded", skeletonClass)} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
