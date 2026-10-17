import { FriendlyError } from "@/lib/friendly";
import type { RoomState } from "@/types/room";
import type { Modifier } from "@/lib/game/rules";
import type { ExitKind } from "@/types/room";

export type { RoomState };

export interface JoinResponse {
  code: string;
  playerId: string;
  accessToken: string;
  name: string;
}

export class ApiError extends FriendlyError {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const offlineMessage =
  "Não consegui falar com o servidor do jogo. Veja se a internet está funcionando e tente de novo.";
const unreadableMessage = "A resposta do servidor veio estranha. Tente de novo.";

function messageForStatus(status: number): string {
  if (status === 404) {
    return "Não achei essa sala.";
  }

  if (status === 401 || status === 403) {
    return "Você não tem acesso a isso.";
  }

  if (status === 503) {
    return "O banco de dados do jogo está fora do ar agora. Espere uns minutos e tente de novo.";
  }

  if (status === 504) {
    return "O servidor do jogo demorou demais para responder. Tente de novo.";
  }

  if (status >= 500) {
    return "Deu um problema no servidor do jogo. Tente de novo daqui a pouco.";
  }

  return "Não consegui completar essa ação.";
}

function serverMessage(payload: unknown, status: number): string {
  const error = (payload as { error?: unknown } | null)?.error;

  return typeof error === "string" && error.length > 0 ? error : messageForStatus(status);
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("x-player-token", token);
  }

  let response: Response;

  try {
    response = await fetch(path, { ...init, headers, cache: "no-store" });
  } catch {
    throw new FriendlyError(offlineMessage);
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(serverMessage(payload, response.status), response.status);
  }

  if (payload === null) {
    throw new FriendlyError(unreadableMessage);
  }

  return payload as T;
}

export const api = {
  createRoom: (hostName: string, emoji: string | null) =>
    request<JoinResponse>("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ hostName, emoji }),
    }),

  joinRoom: (code: string, name: string, emoji: string | null) =>
    request<JoinResponse>(`/api/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ name, emoji }),
    }),

  state: (code: string, token?: string) =>
    request<RoomState>(`/api/rooms/${code}`, { method: "GET" }, token),

  start: (code: string, token: string) =>
    request<RoomState>(`/api/rooms/${code}/start`, { method: "POST" }, token),

  saveEntry: (
    code: string,
    token: string,
    entry: {
      roundNumber?: number;
      replacing?: boolean;
      numbers: number[];
      modifiers: Modifier[];
      exitKind: ExitKind;
    },
  ) =>
    request<RoomState>(
      `/api/rooms/${code}/entry`,
      { method: "POST", body: JSON.stringify(entry) },
      token,
    ),

  removeEntry: (code: string, token: string, entryId: string) =>
    request<RoomState>(
      `/api/rooms/${code}/entry`,
      { method: "DELETE", body: JSON.stringify({ entryId }) },
      token,
    ),

  setEmoji: (code: string, token: string, emoji: string) =>
    request<RoomState>(
      `/api/rooms/${code}/profile`,
      { method: "POST", body: JSON.stringify({ emoji, avatar: null }) },
      token,
    ),

  removePlayer: (code: string, token: string, playerId: string) =>
    request<RoomState>(
      `/api/rooms/${code}/remove`,
      { method: "POST", body: JSON.stringify({ playerId }) },
      token,
    ),

  leave: (code: string, token: string) =>
    request<{ left: boolean; lastOne: boolean }>(
      `/api/rooms/${code}/leave`,
      { method: "POST" },
      token,
    ),

  sendAvatar: async (code: string, token: string, blob: Blob) => {
    let response: Response;

    try {
      response = await fetch(`/api/rooms/${code}/avatar`, {
        method: "POST",
        body: blob,
        headers: { "Content-Type": blob.type, "x-player-token": token },
      });
    } catch {
      throw new FriendlyError(offlineMessage);
    }

    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new ApiError(serverMessage(payload, response.status), response.status);
    }

    return payload as { avatar: string };
  },
};
