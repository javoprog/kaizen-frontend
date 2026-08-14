export type Difficulty = 'TINY' | 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC'

export interface User {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  timezone: string
  onboardingCompleted: boolean
  xp: number
  level: number
  kaizenStreak: number
  kaizenScore: number
}

export interface Task {
  id: string
  title: string
  description?: string | null
  difficulty: Difficulty
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  durationMinutes: number | null
  deadline: string | null
  completed: boolean
  order: number
  goal?: { id: string; title: string } | null
}

export interface Milestone {
  id: string
  title: string
  description: string | null
  status: 'UPCOMING' | 'CURRENT' | 'COMPLETED'
  progress: number
  order: number
  tasks: Task[]
}

export interface Goal {
  id: string
  title: string
  description: string | null
  category: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  planningStatus: 'DRAFT' | 'APPROVED'
  progressStrategy: 'TASKS' | 'METRIC'
  targetDate: string | null
  startValue: string | number | null
  currentValue: string | number | null
  targetValue: string | number | null
  unit: string | null
  progress: number
  earnedXp: number
  createdAt: string
  milestones: Milestone[]
  tasks: Task[]
  recommendedTask: Task | null
  health: { label: string; tone: 'success' | 'warning' | 'danger'; explanation: string }
}

export interface SuggestedTask {
  title: string
  difficulty: Difficulty
  durationMinutes: number
}

export interface SuggestedMilestone {
  title: string
  description: string
  tasks: SuggestedTask[]
}

export interface PlanSuggestion {
  source: 'OPENAI' | 'LOCAL_PLANNER'
  notice: string
  milestones: SuggestedMilestone[]
}

export interface Reward {
  entityType?: 'HABIT'
  taskId?: string
  habitId?: string
  habitStreak?: number
  xpGained: number
  totalXp: number
  previousLevel: number
  level: number
  leveledUp: boolean
  streak: number
  kaizenScore: number
  goalProgress: number | null
  milestoneProgress: number | null
  achievements: Array<{ id: string; name: string; description: string }>
}

export interface HabitCompletion {
  id: string
  localDate: string
  xpAwarded: number
  completedAt: string
}

export interface Habit {
  id: string
  title: string
  description: string | null
  difficulty: Difficulty
  scheduleType: 'DAILY' | 'SELECTED_DAYS'
  daysOfWeek: number[]
  status: 'ACTIVE' | 'PAUSED'
  goal: { id: string; title: string } | null
  completions: HabitCompletion[]
  xpReward: number
  dueToday: boolean
  completedToday: boolean
  streak: number
  totalCompletions: number
  today: string
}

export interface CoachRecommendation {
  type: 'TASK' | 'HABIT' | 'GOAL'
  id: string
  title: string
  reason: string
  actionLabel: string
  href: string
  goalTitle?: string
  priority?: string
  difficulty?: Difficulty
  durationMinutes?: number | null
  xpReward?: number
  overdue?: boolean
  completedToday?: boolean
  streak?: number
  health?: string
  progress?: number
}

export interface CoachResponse {
  source: 'OPENAI' | 'LOCAL_COACH'
  message: string
  recommendations: CoachRecommendation[]
  contextSummary: {
    activeGoals: number
    dueHabits: number
    overdueTasks: number
    streak: number
    kaizenScore: number
  }
}

export interface DashboardData {
  user: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    xp: number
    streak: number
    kaizenScore: number
    onboardingCompleted: boolean
  }
  level: {
    level: number
    currentLevelXp: number
    nextLevelXp: number
    xpRemaining: number
    percent: number
  }
  focus: (Task & { xpReward: number }) | null
  today: {
    pendingTasks: number
    completedTasks: number
    pendingHabits: number
    completedHabits: number
    totalCompleted: number
    totalPlanned: number
    xpEarned: number
  }
  todayHabits: Habit[]
  activeGoals: Array<{
    id: string
    title: string
    description: string | null
    category: string | null
    progress: number
    earnedXp: number
    targetDate: string | null
  }>
  scoreHistory: Array<{ id: string; date: string; score: number }>
  recentAchievement: {
    id: string
    unlockedAt: string
    achievement: { name: string; description: string; icon: string }
  } | null
  weeklyXp: number
}
