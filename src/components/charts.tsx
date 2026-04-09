'use client'

import { motion } from 'framer-motion'

const SPRING = { type: 'spring' as const, stiffness: 80, damping: 18 }

/* ================================================================
   STREAK HEATMAP — GitHub-style contribution calendar
   ================================================================ */

interface HeatmapProps {
  weeks?: number
  data?: number[]
  size?: 'sm' | 'md'
  animated?: boolean
}

export function StreakHeatmap({ weeks = 12, data, size = 'md', animated = true }: HeatmapProps) {
  const cellSize = size === 'sm' ? 8 : 11
  const gap = size === 'sm' ? 2 : 3
  const days = weeks * 7

  const cells = data ?? generateHeatmapData(days)

  const dayLabels = size === 'md' ? ['L', '', 'X', '', 'V', '', 'D'] : []

  return (
    <div className="flex gap-1">
      {size === 'md' && (
        <div className="flex flex-col justify-between pr-1" style={{ gap }}>
          {dayLabels.map((d, i) => (
            <span key={i} className="text-[8px] text-gray-400 leading-none" style={{ height: cellSize }}>
              {d}
            </span>
          ))}
        </div>
      )}
      <div className="flex" style={{ gap: gap - 1 }}>
        {Array.from({ length: weeks }).map((_, weekIdx) => (
          <div key={weekIdx} className="flex flex-col" style={{ gap: gap - 1 }}>
            {Array.from({ length: 7 }).map((_, dayIdx) => {
              const idx = weekIdx * 7 + dayIdx
              const value = cells[idx] ?? 0
              const bg = value === 0
                ? 'bg-gray-100'
                : value <= 30
                  ? 'bg-accent/20'
                  : value <= 60
                    ? 'bg-accent/40'
                    : value <= 90
                      ? 'bg-accent/70'
                      : 'bg-accent'

              const Wrapper = animated ? motion.div : 'div'
              const animProps = animated ? {
                initial: { opacity: 0, scale: 0 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.3 + idx * 0.004, duration: 0.2 },
              } : {}

              return (
                <Wrapper
                  key={dayIdx}
                  className={`rounded-[2px] ${bg}`}
                  style={{ width: cellSize, height: cellSize }}
                  {...animProps}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   WEEKLY BARS — Bar chart for points per day (L-D)
   ================================================================ */

interface WeeklyBarsProps {
  data?: number[]
  labels?: string[]
  maxHeight?: number
  accentToday?: boolean
  animated?: boolean
}

export function WeeklyBars({
  data = [65, 80, 45, 90, 100, 30, 0],
  labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  maxHeight = 80,
  accentToday = true,
  animated = true,
}: WeeklyBarsProps) {
  const max = Math.max(...data, 1)
  const todayIdx = new Date().getDay()
  const todayMapped = todayIdx === 0 ? 6 : todayIdx - 1

  return (
    <div className="flex items-end justify-between gap-1.5">
      {data.map((val, i) => {
        const height = (val / max) * maxHeight
        const isToday = accentToday && i === todayMapped
        const isEmpty = val === 0
        const Wrapper = animated ? motion.div : 'div'

        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[9px] font-bold text-muted tabular-nums">
              {val > 0 ? val : ''}
            </span>
            <Wrapper
              className={`w-full rounded-md ${
                isEmpty ? 'bg-gray-100' : isToday ? 'bg-accent' : 'bg-accent/40'
              }`}
              style={{ minHeight: isEmpty ? 4 : undefined }}
              {...(animated ? {
                initial: { height: 0 },
                animate: { height: Math.max(height, 4) },
                transition: { ...SPRING, delay: 0.2 + i * 0.06 },
              } : { style: { height: Math.max(height, 4), minHeight: isEmpty ? 4 : undefined } })}
            />
            <span className={`text-[9px] font-semibold ${isToday ? 'text-accent' : 'text-gray-400'}`}>
              {labels[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ================================================================
   TREND LINE — SVG line chart for weekly trends
   ================================================================ */

interface TrendLineProps {
  data?: number[]
  width?: number
  height?: number
  animated?: boolean
  showDots?: boolean
  showLabels?: boolean
}

export function TrendLine({
  data = [180, 320, 290, 450, 380, 420],
  width = 280,
  height = 100,
  animated = true,
  showDots = true,
  showLabels = false,
}: TrendLineProps) {
  const padding = { top: 10, right: 10, bottom: showLabels ? 20 : 10, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((val, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((val - min) / range) * chartH,
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FC5200" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FC5200" stopOpacity="0" />
        </linearGradient>
      </defs>

      <motion.path
        d={areaD}
        fill="url(#trendFill)"
        initial={animated ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      <motion.path
        d={pathD}
        fill="none"
        stroke="#FC5200"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      />

      {showDots && points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="white"
          stroke="#FC5200"
          strokeWidth={2}
          initial={animated ? { opacity: 0, scale: 0 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        />
      ))}

      {showLabels && points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={height - 4}
          textAnchor="middle"
          className="fill-gray-400 text-[9px] font-medium"
        >
          S{data.length - data.length + i + 1}
        </text>
      ))}
    </svg>
  )
}

/* ================================================================
   MINI HEATMAP — Compact 4-week heatmap for individual habits
   ================================================================ */

interface MiniHeatmapProps {
  data?: number[]
  completionRate: number
}

export function MiniHeatmap({ data, completionRate }: MiniHeatmapProps) {
  const cells = data ?? generateMiniHeatmapData(28, completionRate)

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: 4 }).map((_, weekIdx) => (
        <div key={weekIdx} className="flex flex-col gap-[2px]">
          {Array.from({ length: 7 }).map((_, dayIdx) => {
            const idx = weekIdx * 7 + dayIdx
            const done = cells[idx] ?? 0
            return (
              <div
                key={dayIdx}
                className={`w-[5px] h-[5px] rounded-[1px] ${done ? 'bg-accent' : 'bg-gray-200'}`}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   SQUAD COMPARISON BARS
   ================================================================ */

interface ComparisonBarsProps {
  members: { name: string; pts: number; isYou?: boolean }[]
}

export function ComparisonBars({ members }: ComparisonBarsProps) {
  const max = Math.max(...members.map(m => m.pts), 1)

  return (
    <div className="space-y-2">
      {members.map((m, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-500 w-12 truncate">{m.name}</span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${m.isYou ? 'bg-accent' : 'bg-accent/30'}`}
              initial={{ width: 0 }}
              animate={{ width: `${(m.pts / max) * 100}%` }}
              transition={{ ...SPRING, delay: 0.1 + i * 0.08 }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-500 tabular-nums w-8 text-right">{m.pts}</span>
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   HELPERS
   ================================================================ */

function generateHeatmapData(days: number): number[] {
  const seed = [0,80,100,60,0,90,70,100,50,0,80,100,100,60,0,0,30,90,100,80,70,100,50,0,80,100,90,60]
  return Array.from({ length: days }, (_, i) => {
    const base = seed[i % seed.length]
    if (i > days - 7 && i > days - 3) return 0
    return base
  })
}

function generateMiniHeatmapData(days: number, rate: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    const threshold = rate / 100
    const pseudo = Math.sin(i * 13.37 + rate) * 0.5 + 0.5
    return pseudo < threshold ? 1 : 0
  })
}
