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

const offlineMessage = "Sem internet aqui. Veja a conexão e tente de novo.";
const unreadableMessage = "A resposta veio estranha. Tente de novo.";

function messageForStatus(status: number): string {
  if (status === 404) {
    return "Não achei essa sala.";
  }

  if (status === 401 || status === 403) {
    return "Você não tem acesso a isso.";
  }

  if (status >= 500) {
    return "O servidor tropeçou. Tente de novo.";
  }

  return "Não consegui completar essa ação.";
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
    throw new Error(offlineMessage);
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error ?? messageForStatus(response.status));
  }

  if (payload === null) {
    throw new Error(unreadableMessage);
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
      throw new Error(offlineMessage);
    }

    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(
        (payload as { error?: string } | null)?.error ?? messageForStatus(response.status),
      );
    }

    return payload as { avatar: string };
  },
};
