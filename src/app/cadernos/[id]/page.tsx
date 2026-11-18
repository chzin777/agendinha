import { Suspense } from "react";
import { NotebookView } from "./NotebookView";

export default function NotebookPage({ params }: PageProps<"/cadernos/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <NotebookView params={params} />
    </Suspense>
  );
}
