// ============================================================================
// API Client Service - Enhanced with Resilience Features
// Handles all backend communication with comprehensive error handling
// ============================================================================

import axios, {
  type AxiosInstance,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  TestSession,
  CreateTestRequest,
  TestResult,
  Question,
  SubmitAnswerRequest,
  AnalyticsDashboard,
  TopicStat,
  LeaderboardEntry,
  Bookmark,
  AIQuestionRequest,
  AIExplanationRequest,
  TopicId,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ============================================================================
// Error Types & Interfaces
// ============================================================================

export interface APIErrorResponse {
  message: string
  code: string
  status: number
  details?: Record<string, any>
  retryable: boolean
  timestamp: number
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR'

export class APIError extends Error {
  public readonly code: ErrorCode
  public readonly status: number
  public readonly details?: Record<string, any>
  public readonly retryable: boolean
  public readonly timestamp: number
  public readonly originalError?: AxiosError

  constructor(
    message: string,
    code: ErrorCode,
    status: number,
    options?: {
      details?: Record<string, any>
      retryable?: boolean
      originalError?: AxiosError
    }
  ) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.status = status
    this.details = options?.details
    this.retryable = options?.retryable ?? false
    this.timestamp = Date.now()
    this.originalError = options?.originalError
  }

  toJSON(): APIErrorResponse {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      retryable: this.retryable,
      timestamp: this.timestamp,
    }
  }
}

// ============================================================================
// Error Event Bus - For Global Error Notifications
// ============================================================================

type ErrorListener = (error: APIError) => void
type AuthListener = () => void

class ErrorEventBus {
  private errorListeners: Set<ErrorListener> = new Set()
  private authListeners: Set<AuthListener> = new Set()

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener)
    return () => this.errorListeners.delete(listener)
  }

  onAuthFailure(listener: AuthListener): () => void {
    this.authListeners.add(listener)
    return () => this.authListeners.delete(listener)
  }

  emitError(error: APIError): void {
    this.errorListeners.forEach((listener) => listener(error))
  }

  emitAuthFailure(): void {
    this.authListeners.forEach((listener) => listener())
  }
}

export const apiErrorBus = new ErrorEventBus()

// ============================================================================
// Request Queue for Offline Support
// ============================================================================

interface QueuedRequest {
  id: string
  config: InternalAxiosRequestConfig
  resolve: (value: AxiosResponse) => void
  reject: (error: any) => void
  timestamp: number
  retryCount: number
}

class RequestQueue {
  private queue: QueuedRequest[] = []
  private maxRetries = 3
  private isProcessing = false

  add(
    config: InternalAxiosRequestConfig,
    resolve: (value: AxiosResponse) => void,
    reject: (error: any) => void
  ): void {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      config,
      resolve,
      reject,
      timestamp: Date.now(),
      retryCount: 0,
    }
    this.queue.push(request)
    this.saveToStorage()
  }

  async processQueue(axiosInstance: AxiosInstance): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0 && navigator.onLine) {
      const request = this.queue[0]

      try {
        const response = await axiosInstance.request(request.config)
        request.resolve(response)
        this.queue.shift()
      } catch (error) {
        request.retryCount++
        if (request.retryCount >= this.maxRetries) {
          request.reject(error)
          this.queue.shift()
        } else {
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!)
          await new Promise((resolve) => setTimeout(resolve, 1000 * request.retryCount))
        }
      }
    }

    this.saveToStorage()
    this.isProcessing = false
  }

  private saveToStorage(): void {
    // Only save critical requests (answer submissions)
    const criticalRequests = this.queue.filter(
      (r) => r.config.url?.includes('/answer') || r.config.url?.includes('/submit')
    )
    if (criticalRequests.length > 0) {
      localStorage.setItem(
        'api_request_queue',
        JSON.stringify(
          criticalRequests.map((r) => ({
            url: r.config.url,
            method: r.config.method,
            data: r.config.data,
            timestamp: r.timestamp,
          }))
        )
      )
    }
  }

  getQueueLength(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue.forEach((r) => r.reject(new Error('Queue cleared')))
    this.queue = []
    localStorage.removeItem('api_request_queue')
  }
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT: 'The request took too long. Please try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again in a few minutes.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}

function getErrorMessage(code: ErrorCode, serverMessage?: string): string {
  // Use server message if it's user-friendly (not a generic error)
  if (serverMessage && serverMessage.length < 100 && !serverMessage.includes('Error')) {
    return serverMessage
  }
  return ERROR_MESSAGES[code]
}

// ============================================================================
// API Client Class
// ============================================================================

class APIClient {
  private client: AxiosInstance
  private accessToken: string | null = null
  private requestQueue: RequestQueue
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.requestQueue = new RequestQueue()

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds default timeout
    })

    // Load token from localStorage
    this.accessToken = localStorage.getItem('access_token')
    if (this.accessToken) {
      this.setAuthToken(this.accessToken)
    }

    this.setupInterceptors()
    this.setupOnlineListener()
  }

  // ============================================================================
  // Interceptor Setup
  // ============================================================================

  private setupInterceptors(): void {
    // Request interceptor - add timestamp for tracking
    this.client.interceptors.request.use(
      (config) => {
        // Add request timestamp for timeout tracking
        ;(config as any).metadata = { startTime: Date.now() }

        // Log in development
        if (import.meta.env.DEV) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        return Promise.reject(this.transformError(error))
      }
    )

    // Response interceptor - comprehensive error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (import.meta.env.DEV) {
          const duration = Date.now() - (response.config as any).metadata?.startTime
          console.log(`[API] ${response.config.url} completed in ${duration}ms`)
        }
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Handle specific HTTP status codes
        if (error.response) {
          const status = error.response.status

          // 401 Unauthorized - Try token refresh
          if (status === 401 && !originalRequest._retry) {
            return this.handleUnauthorized(originalRequest)
          }

          // 403 Forbidden
          if (status === 403) {
            const apiError = new APIError(
              getErrorMessage('FORBIDDEN', (error.response.data as any)?.detail),
              'FORBIDDEN',
              403,
              { originalError: error }
            )
            apiErrorBus.emitError(apiError)
            return Promise.reject(apiError)
          }

          // 404 Not Found
          if (status === 404) {
            const apiError = new APIError(
              getErrorMessage('NOT_FOUND', (error.response.data as any)?.detail),
              'NOT_FOUND',
              404,
              { originalError: error }
            )
            return Promise.reject(apiError)
          }

          // 422 Validation Error
          if (status === 422) {
            const details = (error.response.data as any)?.detail
            const message = Array.isArray(details)
              ? details.map((d: any) => d.msg || d.message).join(', ')
              : getErrorMessage('VALIDATION_ERROR', details)
            const apiError = new APIError(message, 'VALIDATION_ERROR', 422, {
              details: { validation: details },
              originalError: error,
            })
            return Promise.reject(apiError)
          }

          // 429 Rate Limited
          if (status === 429) {
            const apiError = new APIError(getErrorMessage('RATE_LIMITED'), 'RATE_LIMITED', 429, {
              retryable: true,
              originalError: error,
            })
            apiErrorBus.emitError(apiError)
            return Promise.reject(apiError)
          }

          // 500+ Server Errors
          if (status >= 500) {
            const code: ErrorCode = status === 503 ? 'SERVICE_UNAVAILABLE' : 'SERVER_ERROR'
            const apiError = new APIError(getErrorMessage(code), code, status, {
              retryable: true,
              originalError: error,
            })
            apiErrorBus.emitError(apiError)
            return Promise.reject(apiError)
          }
        }

        // Network Error (no response)
        if (!error.response) {
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            const apiError = new APIError(getErrorMessage('TIMEOUT'), 'TIMEOUT', 0, {
              retryable: true,
              originalError: error,
            })
            return Promise.reject(apiError)
          }

          const apiError = new APIError(getErrorMessage('NETWORK_ERROR'), 'NETWORK_ERROR', 0, {
            retryable: true,
            originalError: error,
          })

          // Queue the request if offline and it's a mutation (POST/PUT/DELETE)
          if (!navigator.onLine && ['post', 'put', 'delete'].includes(originalRequest.method?.toLowerCase() || '')) {
            return new Promise((resolve, reject) => {
              this.requestQueue.add(originalRequest, resolve, reject)
            })
          }

          apiErrorBus.emitError(apiError)
          return Promise.reject(apiError)
        }

        // Generic error fallback
        const apiError = new APIError(
          getErrorMessage('UNKNOWN_ERROR', (error.response?.data as any)?.detail),
          'UNKNOWN_ERROR',
          error.response?.status || 0,
          { originalError: error }
        )
        return Promise.reject(apiError)
      }
    )
  }

  // ============================================================================
  // Token Refresh Logic
  // ============================================================================

  private async handleUnauthorized(
    originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }
  ): Promise<AxiosResponse> {
    if (this.isRefreshing) {
      // Wait for the refresh to complete
      return new Promise((resolve, reject) => {
        this.refreshSubscribers.push((token: string) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          resolve(this.client(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    this.isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await this.client.post('/api/v1/auth/refresh', {
        refresh_token: refreshToken,
      })

      const { access_token } = response.data
      this.setAuthToken(access_token)
      localStorage.setItem('access_token', access_token)

      // Notify all waiting requests
      this.refreshSubscribers.forEach((callback) => callback(access_token))
      this.refreshSubscribers = []

      originalRequest.headers['Authorization'] = `Bearer ${access_token}`
      return this.client(originalRequest)
    } catch (refreshError) {
      // Refresh failed, clear auth and notify
      this.clearAuth()
      apiErrorBus.emitAuthFailure()

      const apiError = new APIError(getErrorMessage('UNAUTHORIZED'), 'UNAUTHORIZED', 401)
      return Promise.reject(apiError)
    } finally {
      this.isRefreshing = false
    }
  }

  // ============================================================================
  // Online/Offline Handling
  // ============================================================================

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[API] Back online, processing queued requests...')
      this.requestQueue.processQueue(this.client)
    })
  }

  // ============================================================================
  // Error Transformation Helper
  // ============================================================================

  private transformError(error: any): APIError {
    if (error instanceof APIError) {
      return error
    }

    return new APIError(
      error.message || getErrorMessage('UNKNOWN_ERROR'),
      'UNKNOWN_ERROR',
      0
    )
  }

  // ============================================================================
  // Auth Methods
  // ============================================================================

  setAuthToken(token: string): void {
    this.accessToken = token
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  clearAuth(): void {
    this.accessToken = null
    delete this.client.defaults.headers.common['Authorization']
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // ============================================================================
  // Queue Status
  // ============================================================================

  getPendingRequestCount(): number {
    return this.requestQueue.getQueueLength()
  }

  clearPendingRequests(): void {
    this.requestQueue.clear()
  }

  // ============================================================================
  // Authentication Endpoints
  // ============================================================================

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/v1/auth/register', data)
    this.setAuthToken(response.data.access_token)
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)
    return response.data
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/v1/auth/login', data)
    this.setAuthToken(response.data.access_token)
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('refresh_token', response.data.refresh_token)
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/v1/auth/me')
    return response.data
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.put<User>('/api/v1/auth/profile', data)
    return response.data
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/api/v1/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  }

  logout(): void {
    this.clearAuth()
  }

  // ============================================================================
  // Questions Endpoints
  // ============================================================================

  async getQuestionsByTopic(topic: TopicId, limit = 20, offset = 0): Promise<Question[]> {
    const response = await this.client.get<Question[]>('/api/v1/questions/topic/' + topic, {
      params: { limit, offset },
    })
    return response.data
  }

  async getQuestion(id: string): Promise<Question> {
    const response = await this.client.get<Question>(`/api/v1/questions/${id}`)
    return response.data
  }

  async searchQuestions(query: string, limit = 20): Promise<Question[]> {
    const response = await this.client.get<Question[]>('/api/v1/questions/search', {
      params: { q: query, limit },
    })
    return response.data
  }

  async generateAIQuestions(request: AIQuestionRequest): Promise<{ questions: Question[]; source_question_count: number }> {
    // Extended timeout for AI generation (2 minutes)
    const response = await this.client.post<{ questions: Question[]; source_question_count: number }>(
      '/api/v1/questions/generate',
      request,
      { timeout: 120000 } // 2 minutes for AI generation
    )
    return response.data
  }

  async generateAIQuestionByKeyword(topic: string, keyword: string): Promise<Question> {
    // Extended timeout for AI generation (2 minutes)
    const response = await this.client.post<{ question: Question }>(
      '/api/v1/questions/generate-by-keyword',
      null,
      {
        params: { topic, keyword },
        timeout: 120000 // 2 minutes for AI generation
      }
    )
    return response.data.question
  }

  async getAIExplanation(request: AIExplanationRequest): Promise<string> {
    // Extended timeout for AI explanation (90 seconds)
    const response = await this.client.post<{ explanation: string }>(
      '/api/v1/questions/ai-explain',
      request,
      { timeout: 90000 } // 90 seconds for AI explanation
    )
    return response.data.explanation
  }

  // ============================================================================
  // Bookmarks Endpoints
  // ============================================================================

  async getBookmarks(page: number = 1, pageSize: number = 50): Promise<{ items: Bookmark[]; total: number }> {
    // Backend returns PaginatedResponse with 'items' array
    const response = await this.client.get<{ items: Bookmark[]; total: number; page: number; page_size: number }>(
      '/api/v1/questions/bookmarks/',
      { params: { page, page_size: pageSize } }
    )
    return response.data
  }

  async addBookmark(questionId: string | number, notes?: string): Promise<Bookmark> {
    const response = await this.client.post<Bookmark>('/api/v1/questions/bookmarks', {
      question_id: Number(questionId),
      notes,
    })
    return response.data
  }

  async removeBookmark(questionId: string | number): Promise<void> {
    // Backend expects question_id, not bookmark id
    await this.client.delete(`/api/v1/questions/bookmarks/${questionId}`)
  }

  // ============================================================================
  // Tests Endpoints
  // ============================================================================

  async createTest(request: CreateTestRequest): Promise<TestSession> {
    const response = await this.client.post<TestSession>('/api/v1/tests/create', request)
    return response.data
  }

  async getTestSession(sessionId: string): Promise<TestSession> {
    console.log('[API] Fetching test session:', sessionId)
    const response = await this.client.get<TestSession>(`/api/v1/tests/session/${sessionId}`)
    console.log('[API] Test session response:', response.data)
    console.log('[API] Session has questions:', Array.isArray((response.data as any).questions), 'count:', (response.data as any).questions?.length)
    return response.data
  }

  async submitAnswer(sessionId: string, data: SubmitAnswerRequest): Promise<void> {
    await this.client.post(`/api/v1/tests/session/${sessionId}/answer`, data)
  }

  async submitTest(sessionId: string): Promise<TestResult> {
    const response = await this.client.post<TestResult>(`/api/v1/tests/session/${sessionId}/submit`)
    return response.data
  }

  async abandonTest(sessionId: string): Promise<void> {
    await this.client.post(`/api/v1/tests/session/${sessionId}/abandon`)
  }

  async getTestResult(sessionId: string): Promise<TestResult> {
    const response = await this.client.get<TestResult>(`/api/v1/tests/session/${sessionId}/result`)
    return response.data
  }

  async getTestHistory(limit = 10, offset = 0): Promise<TestSession[]> {
    const response = await this.client.get<TestSession[]>('/api/v1/tests/history', {
      params: { limit, offset },
    })
    return response.data
  }

  // Quick Start Methods
  async startFullLengthTest(): Promise<TestSession> {
    const response = await this.client.post<TestSession>('/api/v1/tests/quick/full-length')
    return response.data
  }

  async startTopicTest(topic: TopicId): Promise<TestSession> {
    const response = await this.client.post<TestSession>(`/api/v1/tests/quick/topic/${topic}`)
    return response.data
  }

  async startQuickPractice(topic?: TopicId, numQuestions: number = 20): Promise<TestSession> {
    const params: any = { num_questions: numQuestions }
    if (topic) {
      params.topic = topic
    }
    const response = await this.client.post<TestSession>('/api/v1/tests/quick/practice', null, { params })
    return response.data
  }

  async startWeakAreaTest(): Promise<TestSession> {
    const response = await this.client.post<TestSession>('/api/v1/tests/quick/weak-areas')
    return response.data
  }

  async startAIGeneratedTest(topic: TopicId): Promise<TestSession> {
    const response = await this.client.post<TestSession>(`/api/v1/tests/quick/ai-generated/${topic}`)
    return response.data
  }

  // ============================================================================
  // Analytics Endpoints
  // ============================================================================

  async getDashboard(): Promise<AnalyticsDashboard> {
    const response = await this.client.get<AnalyticsDashboard>('/api/v1/analytics/dashboard')
    return response.data
  }

  async getPerformanceSummary(): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/performance')
    return response.data
  }

  async getTopicAnalytics(topic: TopicId): Promise<TopicStat> {
    const response = await this.client.get<TopicStat>(`/api/v1/analytics/topic/${topic}`)
    return response.data
  }

  async getWeakTopics(limit?: number): Promise<TopicStat[]> {
    const response = await this.client.get<TopicStat[]>('/api/v1/analytics/weak-topics', {
      params: limit ? { limit } : undefined
    })
    return response.data
  }

  async getStrongTopics(limit?: number): Promise<TopicStat[]> {
    const response = await this.client.get<TopicStat[]>('/api/v1/analytics/strong-topics', {
      params: limit ? { limit } : undefined
    })
    return response.data
  }

  async getRecommendations(): Promise<string[]> {
    const response = await this.client.get<string[]>('/api/v1/analytics/recommendations')
    return response.data
  }

  async getDailyActivity(days = 30): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/activity', {
      params: { days }
    })
    return response.data
  }

  async getActivityStreak(): Promise<any> {
    return this.getDailyActivity()
  }

  async getLeaderboard(period: 'weekly' | 'monthly' | 'all_time' = 'weekly'): Promise<LeaderboardEntry[]> {
    const response = await this.client.get<LeaderboardEntry[]>('/api/v1/analytics/leaderboard', {
      params: { period },
    })
    return response.data
  }

  async getProgressChart(days = 30): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/progress-chart', {
      params: { days },
    })
    return response.data
  }

  async getTopicComparison(): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/compare-topics')
    return response.data
  }

  async getAllTopics(): Promise<TopicStat[]> {
    const response = await this.client.get<TopicStat[]>('/api/v1/analytics/topics')
    return response.data
  }

  // ============================================================================
  // Topics Endpoints
  // ============================================================================

  async getTopics(): Promise<any[]> {
    const response = await this.client.get('/api/v1/topics')
    return response.data
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health')
    return response.data
  }
}

// Export singleton instance
export const api = new APIClient()
export default api
