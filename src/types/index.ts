// ============================================================================
// MPPSC Frontend Types
// Based on backend schemas and API contracts
// ============================================================================

export type Language = 'en' | 'hi'

export type TopicId =
  | 'indian_history'
  | 'mp_history_culture'
  | 'indian_geography'
  | 'mp_geography'
  | 'indian_polity'
  | 'mp_polity'
  | 'indian_economy'
  | 'mp_economy'
  | 'science_environment_health'
  | 'current_affairs_ict'
  | 'mp_tribes_heritage'

export type TestType =
  | 'full_length'
  | 'topic'
  | 'quick_practice'
  | 'weak_area'
  | 'ai_generated'

export type TestStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out'

export type StrengthLevel = 'weak' | 'average' | 'strong' | 'expert'

export interface Topic {
  id: TopicId
  name_en: string
  name_hi: string
  description_en?: string
  description_hi?: string
}

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  preferred_language: Language
  is_premium: boolean
  created_at: string
}

export interface Question {
  id: string
  question_text_en: string
  question_text_hi: string
  options_en: string[]
  options_hi: string[]
  predicted_answer: string
  explanation_en?: string
  explanation_hi?: string
  standardized_topic: TopicId
  difficulty_level?: number
  is_bookmarked?: boolean
}

export interface TestSession {
  id: string
  user_id: string
  test_type: TestType
  topic?: TopicId
  total_questions: number
  questions_attempted: number
  score?: number
  time_limit_minutes: number
  time_spent_seconds?: number
  time_taken_seconds?: number
  status: TestStatus
  created_at: string
  completed_at?: string
}

export interface TestQuestion {
  id: string
  test_session_id: string
  question_id?: string
  question_number: number
  user_answer?: string
  is_correct?: boolean
  time_spent_seconds?: number
  is_marked_for_review: boolean
  ai_question_data?: Question
  eliminated_options: string[]
}

export interface TestQuestionWithDetails extends TestQuestion {
  question: Question
}

export interface TestResult {
  test_session_id: string
  status: string
  total_questions: number
  attempted_questions: number
  correct_answers: number
  wrong_answers: number
  results: any[]
  score: number
  skipped_questions: number
  time_taken_seconds: number
  topic_breakdown: Record<string, {
    total: number
    attempted: number
    correct: number
    wrong: number
  }>
}

export interface UserStats {
  total_tests: number
  total_questions_attempted: number
  overall_accuracy: number
  total_time_spent_minutes: number
  current_streak_days: number
  longest_streak_days: number
  tests_by_type: Record<TestType, number>
}

export interface DailyStreak {
  id: string
  user_id: string
  streak_date: string
  activities_count: number
  is_active: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  question: Question
  notes?: string
  created_at: string
}

export interface AnalyticsDashboard {
  summary: DashboardSummary
  weak_topics: TopicStat[]
  strong_topics: TopicStat[]
  recommendations: {
    recommendations: any[]
    study_plan: any[]
    tips: string[]
    summary: any
  }
  recent_activity: any[]
}

export interface DashboardSummary {
  total_tests_taken: number
  total_questions_attempted: number
  total_correct_answers: number
  overall_accuracy: number
  avg_test_score: number
  total_time_spent_hours: number
  strongest_topic: string
  weakest_topic: string
  current_streak_days: number
  topic_stats: TopicStat[]
}

export interface TopicStat {
  id?: string
  topic: string
  topic_name: string // Added for compatibility with some views using topic_name
  topic_name_en: string
  topic_name_hi: string
  total_questions_attempted: number
  questions_available?: number
  correct_answers?: number
  wrong_answers?: number
  accuracy_percentage: number
  total_time_spent_seconds?: number
  avg_time_per_question?: number
  last_attempted_at?: string
  strength_level?: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  user_name: string
  score: number
  tests_completed: number
  accuracy: number
}

export interface AIQuestionRequest {
  topic: TopicId
  count?: number
  keyword?: string
  difficulty?: number
}

export interface AIExplanationRequest {
  question_id: string
  mode: 'eli5' | 'detailed' | 'hindi'
}

// ============================================================================
// UI State Types
// ============================================================================

export interface QuestionUIState {
  selectedOption?: string
  eliminatedOptions: string[]
  isAnswered: boolean
  showExplanation: boolean
  showAIExplanation: boolean
  aiExplanation?: string
  isMarkedForReview: boolean
  timeSpent: number
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
}

export interface TimerState {
  remainingSeconds: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}

export interface PaletteState {
  isOpen: boolean
  currentQuestion: number
  questions: {
    number: number
    status: 'unanswered' | 'answered' | 'marked'
  }[]
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
  preferred_language: Language
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface CreateTestRequest {
  test_type: TestType
  topic?: TopicId
  question_count?: number
  time_limit_minutes?: number
  include_ai_questions?: boolean
}

export interface SubmitAnswerRequest {
  question_id: number  // DB question ID (int)
  test_question_id: string  // UUID from test_questions table
  answer: string  // "A" | "B" | "C" | "D"
  time_spent_seconds: number
}

export interface APIError {
  detail: string
  status_code: number
}

export interface APIResponse<T> {
  data?: T
  error?: APIError
  success: boolean
}

// ============================================================================
// Constants
// ============================================================================

export const TOPICS: Topic[] = [
  {
    id: 'indian_history',
    name_en: 'Indian History',
    name_hi: 'भारत का इतिहास',
  },
  {
    id: 'mp_history_culture',
    name_en: 'MP History & Culture',
    name_hi: 'मध्य प्रदेश का इतिहास और संस्कृति',
  },
  {
    id: 'indian_geography',
    name_en: 'Indian Geography',
    name_hi: 'भारत का भूगोल',
  },
  {
    id: 'mp_geography',
    name_en: 'MP Geography',
    name_hi: 'मध्य प्रदेश का भूगोल',
  },
  {
    id: 'indian_polity',
    name_en: 'Indian Polity',
    name_hi: 'भारतीय राजव्यवस्था',
  },
  {
    id: 'mp_polity',
    name_en: 'MP Polity',
    name_hi: 'मध्य प्रदेश की राजव्यवस्था',
  },
  {
    id: 'indian_economy',
    name_en: 'Indian Economy',
    name_hi: 'भारतीय अर्थव्यवस्था',
  },
  {
    id: 'mp_economy',
    name_en: 'MP Economy',
    name_hi: 'मध्य प्रदेश की अर्थव्यवस्था',
  },
  {
    id: 'science_environment_health',
    name_en: 'Science, Environment & Health',
    name_hi: 'विज्ञान, पर्यावरण और स्वास्थ्य',
  },
  {
    id: 'current_affairs_ict',
    name_en: 'Current Affairs & ICT',
    name_hi: 'समसामयिक घटनाएं और आईसीटी',
  },
  {
    id: 'mp_tribes_heritage',
    name_en: 'Tribes of MP',
    name_hi: 'मध्य प्रदेश की जनजातियाँ',
  },
]

export const TEST_TYPE_CONFIG = {
  full_length: {
    name_en: 'Full Length Test',
    name_hi: 'पूर्ण लंबाई परीक्षा',
    questions: 100,
    time_minutes: 120,
    icon: '📝',
  },
  topic: {
    name_en: 'Topic Test',
    name_hi: 'विषय परीक्षा',
    questions: 100,
    time_minutes: 90,
    icon: '📚',
  },
  quick_practice: {
    name_en: 'Quick Practice',
    name_hi: 'त्वरित अभ्यास',
    questions: 20,
    time_minutes: 30,
    icon: '⚡',
  },
  weak_area: {
    name_en: 'Weak Area Test',
    name_hi: 'कमजोर क्षेत्र परीक्षा',
    questions: 50,
    time_minutes: 60,
    icon: '🎯',
  },
  ai_generated: {
    name_en: 'AI Generated Test',
    name_hi: 'AI जनरेटेड टेस्ट',
    questions: 100,
    time_minutes: 90,
    icon: '🤖',
  },
}
