import Link from "next/link";
import { MapIcon, PlusIcon } from "lucide-react";
import { getPayload } from "payload";

import config from "@payload-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function EditorIndexPage() {
  const payload = await getPayload({ config });
  const floors = await payload.find({
    collection: "floors",
    limit: 12,
    sort: "level",
  });

  return (
    <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-content-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <MapIcon className="size-5" />
            </span>
            <div>
              <h1 className="font-heading text-xl font-semibold">Floor Editor</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a floor to continue editing paths, objects, and map nodes.
              </p>
            </div>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/admin/collections/floors/create" />}
            variant="outline"
            size="lg"
          >
            <PlusIcon className="size-4" />
            New Floor
          </Button>
        </header>

        {floors.docs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {floors.docs.map((floor) => (
              <Link
                key={floor.id}
                href={`/editor/${floor.id}`}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{floor.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Level {floor.level} / {floor.width}x{floor.height}
                    </p>
                  </div>
                  <Badge variant="outline" className="uppercase tracking-[0.16em]">
                    {floor.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <section className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
            <MapIcon className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-lg font-semibold">No floors yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Create your first floor in Payload admin, then return here to edit the map.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
