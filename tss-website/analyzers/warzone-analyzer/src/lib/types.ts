export interface AnalysisResult {
  id: string
  video_id: string
  filename: string
  duration_seconds: number
  resolution_width: number
  resolution_height: number
  fps: number
  status: 'queued' | 'processing' | 'completed' | 'failed'
  aim_stats: AimStats
  movement_stats: MovementStats
  positioning_stats: PositioningStats
  decision_stats: DecisionStats
  enemy_encounters: EnemyEncounters
  kill_death_data: KillDeathData
  hotspots: Hotspot[]
  issues_timeline: Issue[]
  created_at: string
  completed_at?: string
}

export interface AimStats {
  accuracy: number
  shots_count: number
  hits: number
  misses: number
  headshots: number
  aim_speed: number
  flick_shots: number
  average_reaction_time: number
  fps: number
}

export interface MovementStats {
  score: number
  distance_covered: number
  average_velocity: number
  sprint_efficiency: number
  rotation_speed: number
  strafe_accuracy: number
  movement_patterns: Array<{
    type: string
    frequency: number
  }>
}

export interface PositioningStats {
  positioning_score: number
  rotation_stats: {
    high_ground_time: number
    flanking_time: number
    defensive_position_count: number
    optimal_angles: number
  }
  cover_usage: {
    percentage: number
    effective_shots: number
  }
}

export interface DecisionStats {
  mistakes: Array<{
    type: string
    timestamp: string
    description: string
    impact: number
  }>
  decisions: Array<{
    type: string
    success_rate: number
    avg_time_taken: number
  }>
}

export interface EnemyEncounters {
  total_encounters: number
  closest_encounters: Array<{
    distance: number
    outcome: string
  }>
  rotations: {
    successful: number
    failed: number
  }
}

export interface KillDeathData {
  kills: number
  deaths: number
  kd_ratio: number
  assists: number
  kill_streaks: Array<{
    count: number
    achieved: boolean
  }>
}

export interface Hotspot {
  id: string
  name: string
  description: string
  severity: 'info' | 'warning' | 'error'
  timestamp: string
  x: number
  y: number
  width: number
  height: number
}

export interface Issue {
  id: string
  timestamp: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendation?: string
}
