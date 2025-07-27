export interface Person {
  id: string;
  name: string;
  email: string;
  picture: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  members: string[];
}

export interface Feedback {
  id: string;
  content: string;
  targetType: 'person' | 'team';
  targetId: string;
  targetName: string;
  createdAt: string;
}

// API types for backend communication
export interface ApiPerson {
  id: number;
  name: string;
  email: string;
  picture: string;
  team_id?: number;
  team?: ApiTeam;
  created_at: string;
  updated_at: string;
}

export interface ApiTeam {
  id: number;
  name: string;
  logo: string;
  members?: ApiPerson[];
  created_at: string;
  updated_at: string;
}

export interface ApiFeedback {
  id: number;
  content: string;
  target_type: 'person' | 'team';
  target_id: number;
  target_name: string;
  created_at: string;
  updated_at: string;
}
