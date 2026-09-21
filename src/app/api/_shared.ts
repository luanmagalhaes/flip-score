import { ServiceError } from "@/lib/errors";

export function playerToken(request: Request): string {
  return request.headers.get("x-player-token") ?? "";
}

export async function handle<T>(work: () => Promise<T>): Promise<Response> {
  try {
    return Response.json(await work());
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return Response.json({ error: cause.message }, { status: cause.status });
    }

    const message = cause instanceof Error ? cause.message : "Erro inesperado";

    return Response.json({ error: message }, { status: 500 });
  }
}
