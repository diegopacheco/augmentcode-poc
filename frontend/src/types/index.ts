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
