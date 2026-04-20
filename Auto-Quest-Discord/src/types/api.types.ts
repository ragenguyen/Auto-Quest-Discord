export interface VideoProgressBody {
  timestamp: number;
}

export interface VideoProgressResponse {
  completed_at: string | null;
}

export interface HeartbeatBody {
  application_id?: string;
  stream_key?: string;
  terminal: boolean;
}

export interface EnrollBody {
  location: number;
  is_targeted: boolean;
  metadata_raw: null;
}

export interface ApplicationData {
  id: string;
  name?: string;
}
