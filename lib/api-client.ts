import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  User,
  Character,
  Raid,
  SignUp,
  RosterSlot,
  RosterSuggestion,
  AuthResponse,
  ApiError,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateRaidRequest,
  UpdateRaidRequest,
  CreateSignUpRequest,
  UpdateSignUpRequest,
  CreateRosterSlotRequest
} from './types'

class ApiClient {
  private client: AxiosInstance
  private baseURL: string
  private token: string | null = null

  constructor() {
    // Auto-detect API URL based on environment
    this.baseURL = this.getApiUrl()
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      withCredentials: true, // Include cookies in requests
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.clearToken()
          // Redirect to login or emit auth error event
          window.dispatchEvent(new CustomEvent('auth-error'))
        }
        return Promise.reject(this.formatError(error))
      }
    )

    // Load token from localStorage on init
    this.loadToken()
  }

  private getApiUrl(): string {
    // Check if custom API URL is set
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }

    // If running on Vercel (production), use relative URL that gets proxied
    if (process.env.VERCEL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))) {
      return '/api/v1'
    }

    // For local development, use the remote server directly
    return 'http://138.2.151.108:3001/api/v1'
  }

  private formatError(error: AxiosError<ApiError>): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    if (error.message) {
      return new Error(error.message)
    }
    return new Error('An unexpected error occurred')
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('raid-planner-token')
      if (token) {
        this.token = token
      }
    }
  }

  private saveToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('raid-planner-token', token)
    }
  }

  private clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('raid-planner-token')
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health')
    return response.data
  }

  // Authentication
  async login(discordId: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', { discordId })
    this.saveToken(response.data.access_token)
    return response.data
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/auth/profile')
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      this.clearToken()
    }
  }

  // Characters
  async getCharacters(): Promise<Character[]> {
    const response = await this.client.get<Character[]>('/characters')
    return response.data
  }

  // Get all characters from all users (admin only)
  async getAllCharacters(filters?: { userId?: string; class?: string; faction?: string; isActive?: boolean }): Promise<Character[]> {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.class) params.append('class', filters.class)
    if (filters?.faction) params.append('faction', filters.faction)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    
    const response = await this.client.get<Character[]>(`/characters${params.toString() ? '?' + params.toString() : ''}`)
    return response.data
  }

  async getCharacterById(id: string): Promise<Character> {
    const response = await this.client.get<Character>(`/characters/${id}`)
    return response.data
  }

  async createCharacter(data: CreateCharacterRequest): Promise<Character> {
    const response = await this.client.post<Character>('/characters', data)
    return response.data
  }

  async updateCharacter(id: string, data: UpdateCharacterRequest): Promise<Character> {
    const response = await this.client.patch<Character>(`/characters/${id}`, data)
    return response.data
  }

  async deleteCharacter(id: string): Promise<void> {
    await this.client.delete(`/characters/${id}`)
  }

  // Raids
  async getRaids(): Promise<Raid[]> {
    const response = await this.client.get<Raid[]>('/raids')
    return response.data
  }

  async getRaidById(id: string): Promise<Raid> {
    const response = await this.client.get<Raid>(`/raids/${id}`)
    return response.data
  }

  async createRaid(data: CreateRaidRequest): Promise<Raid> {
    const response = await this.client.post<Raid>('/raids', data)
    return response.data
  }

  async updateRaid(id: string, data: UpdateRaidRequest): Promise<Raid> {
    const response = await this.client.patch<Raid>(`/raids/${id}`, data)
    return response.data
  }

  async deleteRaid(id: string): Promise<void> {
    await this.client.delete(`/raids/${id}`)
  }

  // Sign-ups - Get current user's sign-ups
  async getSignUps(): Promise<SignUp[]> {
    const response = await this.client.get<SignUp[]>('/signups/my')
    return response.data
  }

  // Get all sign-ups (admin only)
  async getAllSignUps(filters?: { raidId?: string; userId?: string; status?: string }): Promise<SignUp[]> {
    const params = new URLSearchParams()
    if (filters?.raidId) params.append('raidId', filters.raidId)
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.status) params.append('status', filters.status)
    
    const response = await this.client.get<SignUp[]>(`/signups${params.toString() ? '?' + params.toString() : ''}`)
    return response.data
  }

  async getSignUpsByRaid(raidId: string): Promise<SignUp[]> {
    const response = await this.client.get<SignUp[]>(`/signups/raid/${raidId}`)
    return response.data
  }

  // Get detailed signups for raid management (admin/raid leader only)
  async getSignUpsByRaidDetailed(raidId: string): Promise<SignUp[]> {
    const response = await this.client.get<SignUp[]>(`/signups/raid/${raidId}/manage`)
    return response.data
  }

  async createSignUp(data: CreateSignUpRequest): Promise<SignUp> {
    const response = await this.client.post<SignUp>('/signups', data)
    return response.data
  }

  async updateSignUp(id: string, data: UpdateSignUpRequest): Promise<SignUp> {
    const response = await this.client.patch<SignUp>(`/signups/${id}`, data)
    return response.data
  }

  async deleteSignUp(id: string): Promise<void> {
    await this.client.delete(`/signups/${id}`)
  }

  // Roster
  async getRoster(raidId: string): Promise<RosterSlot[]> {
    const response = await this.client.get<RosterSlot[]>(`/roster/${raidId}`)
    return response.data
  }

  async getRosterSuggestions(raidId: string): Promise<CreateRosterSlotRequest[]> {
    const response = await this.client.post<CreateRosterSlotRequest[]>(`/roster/${raidId}/suggest`)
    return response.data
  }

  async createOrUpdateRoster(raidId: string, rosterSlots: CreateRosterSlotRequest[]): Promise<RosterSlot[]> {
    const response = await this.client.post<RosterSlot[]>(`/roster/${raidId}`, rosterSlots)
    return response.data
  }

  async removeFromRoster(raidId: string, slotId: string): Promise<void> {
    await this.client.delete(`/roster/${raidId}/slots/${slotId}`)
  }

  async finalizeRoster(raidId: string): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(`/roster/${raidId}/finalize`)
    return response.data
  }

  // Utility methods
  isAuthenticated(): boolean {
    // For cookie-based auth, we'll try to make a profile request to check if authenticated
    // This is a simple check - in practice, we rely on the auth context to manage state
    if (typeof window !== 'undefined') {
      // Check if we have a token in localStorage (fallback) or assume cookie exists
      return !!this.token || document.cookie.includes('access_token=')
    }
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }

  setToken(token: string): void {
    this.saveToken(token)
  }

  setApiUrl(url: string): void {
    this.baseURL = url
    this.client.defaults.baseURL = url
  }

  getCurrentApiUrl(): string {
    return this.baseURL
  }

  // Admin endpoints
  async getAdminStats() {
    const response = await this.client.get('/admin/stats')
    return response.data
  }

  async getAdminUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.role) searchParams.append('role', params.role)
    
    const response = await this.client.get(`/admin/users${searchParams.toString() ? '?' + searchParams.toString() : ''}`)
    return response.data
  }

  async updateUserRole(userId: string, role: string) {
    const response = await this.client.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  }

  async deleteUser(userId: string) {
    const response = await this.client.delete(`/admin/users/${userId}`)
    return response.data
  }

  async getAdminRaids(params?: { page?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const response = await this.client.get(`/admin/raids${searchParams.toString() ? '?' + searchParams.toString() : ''}`)
    return response.data
  }

  async getAdminCharacters(params?: { page?: number; limit?: number; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const response = await this.client.get(`/admin/characters${searchParams.toString() ? '?' + searchParams.toString() : ''}`)
    return response.data
  }

  async deleteCharacterAdmin(characterId: string) {
    const response = await this.client.delete(`/admin/characters/${characterId}`)
    return response.data
  }

  async deleteRaidAdmin(raidId: string) {
    const response = await this.client.delete(`/admin/raids/${raidId}`)
    return response.data
  }

  async updateCharacterAdmin(characterId: string, data: any) {
    const response = await this.client.patch(`/admin/characters/${characterId}`, data)
    return response.data
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient 