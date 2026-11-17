export type DecreeStatus = "recebido" | "em_andamento" | "cumprido";

export interface InviteRecord {
  id: string;
  label: string;
  token_value: string;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Decree {
  id: string;
  invite_id: string;
  texto: string;
  status: DecreeStatus;
  resposta_do_namorado: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameRun {
  id: string;
  invite_id: string;
  score: number;
  duration_seconds: number;
  chocolate_cakes: number;
  macchi_collars: number;
  bags: number;
  zara_clothes: number;
  won: boolean;
  attempts: number;
  created_at: string;
}

export interface AlbumEvent {
  id: string;
  invite_id: string;
  photo_id: number;
  event_type: "opened" | "liked";
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  invite_id: string;
  event_type: "visit" | "decree_created" | "game_finished";
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GuestSnapshot {
  decrees: Decree[];
  likeCounts: Record<number, number>;
}

export interface AdminOverview {
  stats: {
    newDecrees: number;
    bestScore: number;
    gameRuns: number;
    albumOpens: number;
    hearts: number;
    visits: number;
  };
  invites: Array<{ id: string; label: string; token: string; active: boolean }>;
  decrees: Decree[];
  gameRuns: GameRun[];
  albumEvents: AlbumEvent[];
  activityEvents: ActivityEvent[];
}
