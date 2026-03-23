export type QuestionUI = "text" | "buttons" | "list" | "multi_list";

export interface SurveyStep {
  key: string;
  prompt: string;
  type: "text" | "choice" | "multi_choice" | "location" | "voice";
  choices?: string[];
  /** How to render this question in WhatsApp */
  ui?: QuestionUI;
  /** Button text for list messages */
  listButton?: string;
}

export interface Session {
  id: string;
  phone: string;
  current_step: number;
  answers: Record<string, string>;
  started_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  answers: Record<string, string>;
  voice_urls: string[];
  submitted_at: string;
}

export interface WebhookPayload {
  event?: string | { type?: string; event?: string };
  type?: string;
  id?: string;
  event_id?: string;
  chat_id?: string;
  from_me?: boolean;
  message?: {
    id?: string;
    chat_id?: string;
    from_me?: boolean;
    type?: string;
    text?: { body?: string };
    body?: string;
    location?: { latitude: number; longitude: number };
    interactive?: {
      type?: string;
      button_reply?: { id: string; title: string };
      list_reply?: { id: string; title: string; description?: string };
    };
  };
  messages?: Array<{
    id?: string;
    chat_id?: string;
    from_me?: boolean;
    type?: string;
    text?: { body?: string };
    body?: string;
    location?: { latitude: number; longitude: number };
    audio?: { link?: string };
    voice?: { link?: string };
    interactive?: {
      type?: string;
      button_reply?: { id: string; title: string };
      list_reply?: { id: string; title: string; description?: string };
    };
    action?: {
      button_reply?: { id: string; title: string };
      list_reply?: { id: string; title: string; description?: string };
    };
  }>;
}
