import { cn } from "@/lib/utils";
import { useSignedUrl } from "./api";

/** Exibe a imagem da prova via URL assinada (bucket privado). */
export function VozImagem({
  path,
  className,
}: {
  path: string | null;
  className?: string;
}) {
  const { data: url, isLoading } = useSignedUrl(path);
  if (!path) return null;
  if (isLoading || !url)
    return <div className={cn("animate-pulse rounded-md bg-secondary", className)} />;
  return (
    <img
      src={url}
      alt="Prova do cliente"
      className={cn("rounded-md object-cover", className)}
    />
  );
}
