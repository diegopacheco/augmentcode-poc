const API_BASE_URL = 'http://localhost:8080/api/v1';

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

export interface CreatePersonRequest {
  name: string;
  email: string;
  picture?: string;
}

export interface CreateTeamRequest {
  name: string;
  logo?: string;
}

export interface CreateFeedbackRequest {
  content: string;
  target_type: 'person' | 'team';
  target_id: number;
}

export interface AssignToTeamRequest {
  person_id: number;
  team_id: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Person endpoints
  async getPersons(): Promise<ApiPerson[]> {
    return this.request<ApiPerson[]>('/persons');
  }

  async getPerson(id: number): Promise<ApiPerson> {
    return this.request<ApiPerson>(`/persons/${id}`);
  }

  async createPerson(data: CreatePersonRequest): Promise<ApiPerson> {
    return this.request<ApiPerson>('/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePerson(id: number, data: Partial<CreatePersonRequest>): Promise<ApiPerson> {
    return this.request<ApiPerson>(`/persons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePerson(id: number): Promise<void> {
    await this.request<void>(`/persons/${id}`, {
      method: 'DELETE',
    });
  }

  async removePersonFromTeam(id: number): Promise<{ message: string; person: ApiPerson }> {
    return this.request<{ message: string; person: ApiPerson }>(`/persons/${id}/remove-from-team`, {
      method: 'POST',
    });
  }

  // Team endpoints
  async getTeams(): Promise<ApiTeam[]> {
    return this.request<ApiTeam[]>('/teams');
  }

  async getTeam(id: number): Promise<ApiTeam> {
    return this.request<ApiTeam>(`/teams/${id}`);
  }

  async createTeam(data: CreateTeamRequest): Promise<ApiTeam> {
    return this.request<ApiTeam>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTeam(id: number, data: Partial<CreateTeamRequest>): Promise<ApiTeam> {
    return this.request<ApiTeam>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(id: number): Promise<void> {
    await this.request<void>(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  // Feedback endpoints
  async getFeedbacks(): Promise<ApiFeedback[]> {
    return this.request<ApiFeedback[]>('/feedbacks');
  }

  async getFeedback(id: number): Promise<ApiFeedback> {
    return this.request<ApiFeedback>(`/feedbacks/${id}`);
  }

  async getFeedbacksByTarget(targetType: 'person' | 'team', targetId: number): Promise<ApiFeedback[]> {
    return this.request<ApiFeedback[]>(`/feedbacks/by-target?target_type=${targetType}&target_id=${targetId}`);
  }

  async createFeedback(data: CreateFeedbackRequest): Promise<ApiFeedback> {
    return this.request<ApiFeedback>('/feedbacks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFeedback(id: number): Promise<void> {
    await this.request<void>(`/feedbacks/${id}`, {
      method: 'DELETE',
    });
  }

  // Assignment endpoint
  async assignToTeam(data: AssignToTeamRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch('http://localhost:8080/health');
    return response.json();
  }
}

export const apiService = new ApiService();
