/* ============================================================
   命盘可视化组件
   清爽高对比盘面 + 运限叠盘
   ============================================================ */

import { useState } from 'react'
import { useChartStore } from '@/stores'
import type { FunctionalAstrolabe, FunctionalHoroscope, HoroscopeScope } from '@/lib/astro'
import type { HoroscopeItem } from 'iztro/lib/data/types'

const PALACE_POSITIONS: Record<string, { row: number; col: number }> = {
  '巳': { row: 0, col: 0 }, '午': { row: 0, col: 1 },
  '未': { row: 0, col: 2 }, '申': { row: 0, col: 3 },
  '辰': { row: 1, col: 0 }, '酉': { row: 1, col: 3 },
  '卯': { row: 2, col: 0 }, '戌': { row: 2, col: 3 },
  '寅': { row: 3, col: 0 }, '丑': { row: 3, col: 1 },
  '子': { row: 3, col: 2 }, '亥': { row: 3, col: 3 },
}

const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

const BRIGHTNESS_STYLE: Record<string, string> = {
  '庙': 'text-emerald-700',
  '旺': 'text-amber-700',
  '得': 'text-sky-700',
  '利': 'text-sky-700',
  '平': 'text-slate-500',
  '不': 'text-rose-600',
  '陷': 'text-rose-700',
}

const MUTAGEN_LABELS = ['禄', '权', '科', '忌'] as const
const SCOPE_LABEL: Record<HoroscopeScope, string> = {
  decadal: '大限',
  yearly: '流年',
  monthly: '流月',
  daily: '流日',
}

const SANFANG_LABELS = ['本宫', '三方', '三方', '对宫'] as const

interface StarData {
  name: string
  brightness?: string
  mutagen?: string
}

interface ExtraStarData {
  name?: string
}

interface PalaceData {
  index: number
  name: string
  stem: string
  branch: string
  majorStars: StarData[]
  minorStars: StarData[]
  adjectiveStars: string[]
  decadal: { range: [number, number] }
  boshi12: string
  changsheng12: string
  isLife: boolean
  isBody: boolean
}

interface FlowOverlay {
  scope: HoroscopeScope
  item: HoroscopeItem
  palaceName?: string
  stars: string[]
  mutagens: Array<{ star: string; label: string }>
  isActivePalace: boolean
}

interface ChartDisplayProps {
  horoscope?: FunctionalHoroscope | null
  activeScope?: HoroscopeScope
}

function getNayin(ganZhi: string): string {
  return NAYIN_TABLE[ganZhi] || ''
}

function getHoroscopeItem(
  horoscope: FunctionalHoroscope | null | undefined,
  scope: HoroscopeScope
): HoroscopeItem | null {
  if (!horoscope) return null
  return horoscope[scope]
}

function getFlowOverlay(
  horoscope: FunctionalHoroscope | null | undefined,
  scope: HoroscopeScope,
  palaceIndex: number
): FlowOverlay | null {
  const item = getHoroscopeItem(horoscope, scope)
  if (!item) return null

  const stars = (item.stars?.[palaceIndex] || []).map((star) => String(star.name))
  const mutagens = item.mutagen.map((star, index) => ({
    star: String(star),
    label: MUTAGEN_LABELS[index] || '',
  })).filter((entry) => entry.label)

  return {
    scope,
    item,
    palaceName: item.palaceNames[palaceIndex] ? String(item.palaceNames[palaceIndex]) : undefined,
    stars,
    mutagens,
    isActivePalace: item.index === palaceIndex,
  }
}

function getSanfangIndicesByBranch(palaces: PalaceData[], activePalace: PalaceData): number[] {
  const groups = [
    ['申', '子', '辰'],
    ['寅', '午', '戌'],
    ['亥', '卯', '未'],
    ['巳', '酉', '丑'],
  ]
  const group = groups.find((branches) => branches.includes(activePalace.branch)) || []
  const sanhe = group
    .map((branch) => palaces.find((palace) => palace.branch === branch)?.index)
    .filter((index): index is number => typeof index === 'number')
  const opposite = palaces.find((palace) => palace.index === (activePalace.index + 6) % 12)?.index

  return Array.from(new Set([
    activePalace.index,
    ...sanhe.filter((index) => index !== activePalace.index),
    ...(typeof opposite === 'number' ? [opposite] : []),
  ]))
}

function getCenterEdgePoint(palace: PalaceData): { x: number; y: number } {
  const pos = PALACE_POSITIONS[palace.branch]
  const row = pos.row
  const col = pos.col
  const horizontalX = [0, 25, 75, 100][col] ?? 50

  if (row === 0) return { x: horizontalX, y: 0 }
  if (row === 3) return { x: horizontalX, y: 100 }
  if (col === 0) return { x: 0, y: (row - 1) * 50 + 25 }
  return { x: 100, y: (row - 1) * 50 + 25 }
}

function StarText({ star, strong = false }: { star: StarData; strong?: boolean }) {
  const brightnessStyle = star.brightness ? BRIGHTNESS_STYLE[star.brightness] || '' : ''
  const mutagenStyle = {
    '禄': 'text-emerald-700',
    '权': 'text-amber-700',
    '科': 'text-sky-700',
    '忌': 'text-rose-700',
  }[star.mutagen || ''] || (strong ? 'text-indigo-700' : 'text-slate-700')

  return (
    <span className={`mr-2 inline-block font-semibold leading-5 ${mutagenStyle}`}>
      {star.name}
      {star.brightness && (
        <span className={`ml-0.5 text-xs ${brightnessStyle}`}>{star.brightness}</span>
      )}
      {star.mutagen && <span className="ml-0.5 text-xs">{star.mutagen}</span>}
    </span>
  )
}

interface PalaceCardProps extends PalaceData {
  flowOverlay: FlowOverlay | null
  sanfangLabel?: string
  isSelected?: boolean
  isSanfang?: boolean
  onClick?: () => void
}

function PalaceCard({
  name, stem, branch, majorStars, minorStars, adjectiveStars, decadal,
  boshi12, changsheng12, isLife, isBody, isSelected, isSanfang, sanfangLabel, flowOverlay, onClick,
}: PalaceCardProps) {
  const decadalRange = decadal?.range ? `${decadal.range[0]}-${decadal.range[1]}` : ''

  return (
    <div
      onClick={onClick}
      className={`
        relative z-20 flex h-full min-h-[104px] cursor-pointer flex-col border bg-white p-1.5
        text-slate-700 transition-all duration-200 hover:border-slate-400
        ${isSelected ? 'border-rose-300 bg-rose-50/20 shadow-[inset_0_0_0_2px_rgba(244,63,94,0.16)]' : 'border-slate-200'}
        ${isSanfang && !isSelected ? 'border-rose-100 bg-rose-50/10' : ''}
        ${isLife ? 'shadow-[inset_3px_0_0_rgba(180,83,9,0.75)]' : ''}
        ${isBody ? 'ring-1 ring-sky-200' : ''}
      `}
    >
      {sanfangLabel && (
        <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {sanfangLabel}
        </span>
      )}

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] gap-1 text-[12px]">
        <div className="min-w-0 pr-1">
          <div className="min-h-[28px] pt-1 leading-4">
            {majorStars.map((star, i) => (
              <StarText key={`${star.name}-${i}`} star={star} strong />
            ))}
          </div>

          <div className="mt-0.5 text-[11px] leading-4 text-slate-600">
            {flowOverlay && (
              <>
                <span className="mr-1 text-violet-600">{SCOPE_LABEL[flowOverlay.scope]}</span>
                {flowOverlay.stars.map((star) => (
                  <span key={star} className="mr-1 text-sky-600">{star}</span>
                ))}
              </>
            )}
          </div>

          <div className="mt-1 text-[11px] leading-4 text-green-700">
            <span className="mr-2 text-lime-700">{changsheng12}</span>
            <span>{boshi12}</span>
          </div>
        </div>

        <div className="min-w-0 text-right text-[10px] leading-4">
          <div className="min-h-[28px] text-slate-500">
            {minorStars.slice(0, 5).map((star, i) => (
              <span key={`${star.name}-${i}`} className="ml-1 inline-block">
                {star.name}
                {star.brightness && <span className="text-[10px]">{star.brightness}</span>}
              </span>
            ))}
          </div>

          <div className="mt-0.5 text-slate-400">
            {adjectiveStars.slice(0, 6).map((star, i) => (
              <span key={`${star}-${i}`} className="ml-1 inline-block">{star}</span>
            ))}
          </div>

          <div className="mt-0.5 text-slate-500">
            {flowOverlay?.mutagens.map((entry) => (
              <span key={`${entry.star}-${entry.label}`} className="ml-1 inline-block text-fuchsia-600">
                {entry.star}{entry.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-slate-100 pt-0.5">
        <div className="text-[10px] leading-3 text-slate-500">
          <div className="hidden xl:block">{Array.from({ length: 7 }, (_, i) => decadal.range[0] + i * 12).join(' ')}</div>
          <div className="font-semibold">{decadalRange}</div>
        </div>

        <div className="text-right">
          <div className="font-mono text-[11px] font-semibold text-green-700">{stem}{branch}</div>
          <div className="text-sm font-bold text-indigo-700">
            {name}{isBody ? <span className="text-xs">·身</span> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function SanfangLines({
  palaces,
  activeIndex,
}: {
  palaces: PalaceData[]
  activeIndex: number
}) {
  const activePalace = palaces.find((palace) => palace.index === activeIndex)
  if (!activePalace) return null

  const sanfangPalaces = getSanfangIndicesByBranch(palaces, activePalace)
    .map((index) => palaces.find((palace) => palace.index === index))
    .filter((palace): palace is PalaceData => !!palace)
  const sanhePalaces = sanfangPalaces.filter((palace) => palace.index !== (activeIndex + 6) % 12)
  const points = sanfangPalaces.map((palace) => getCenterEdgePoint(palace))
  const activePoint = getCenterEdgePoint(activePalace)

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {points.slice(1).map((point, index) => (
        <line
          key={`${point.x}-${point.y}-${index}`}
          x1={activePoint.x}
          y1={activePoint.y}
          x2={point.x}
          y2={point.y}
          stroke="rgba(220,38,38,0.62)"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <polyline
        points={sanhePalaces.map((palace) => {
          const point = getCenterEdgePoint(palace)
          return `${point.x},${point.y}`
        }).join(' ')}
        fill="none"
        stroke="rgba(220,38,38,0.42)"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function CenterInfo({
  chart, solarDate, gender, horoscope, activeScope,
  palaces, activePalaceIndex,
}: {
  chart: FunctionalAstrolabe
  solarDate: string
  gender: string
  horoscope?: FunctionalHoroscope | null
  activeScope: HoroscopeScope
  palaces: PalaceData[]
  activePalaceIndex: number
}) {
  const yearGanZhi = chart.chineseDate?.split(' ')[0] || ''
  const nayin = getNayin(yearGanZhi)
  const flowItem = getHoroscopeItem(horoscope, activeScope)

  return (
    <div className="relative z-0 flex h-full min-h-[210px] overflow-hidden border border-slate-200 bg-white/70 text-left">
      <SanfangLines palaces={palaces} activeIndex={activePalaceIndex} />
      <div className="relative z-10 flex w-full flex-col justify-between bg-white/45 p-3">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-[13px] leading-5 text-slate-700">
        <span className="text-slate-400">四柱</span>
        <span className="font-mono text-green-700">{chart.chineseDate}</span>
        <span className="text-slate-400">阳历</span>
        <span className="text-green-700">{solarDate}</span>
        <span className="text-slate-400">农历</span>
        <span className="text-green-700">{chart.lunarDate}</span>
        <span className="text-slate-400">时辰</span>
        <span className="text-green-700">{chart.time} {chart.timeRange}</span>
        <span className="text-slate-400">生肖</span>
        <span className="text-green-700">{chart.zodiac}</span>
        <span className="text-slate-400">星座</span>
        <span className="text-green-700">{chart.sign}</span>
        <span className="text-slate-400">命主</span>
        <span className="text-green-700">{chart.soul}</span>
        <span className="text-slate-400">身主</span>
        <span className="text-green-700">{chart.body}</span>
        <span className="text-slate-400">命宫</span>
        <span className="text-green-700">{chart.earthlyBranchOfSoulPalace}</span>
        <span className="text-slate-400">身宫</span>
        <span className="text-green-700">{chart.earthlyBranchOfBodyPalace}</span>
        <span className="text-slate-400">性别</span>
        <span className="text-green-700">{gender}</span>
        {nayin && (
          <>
            <span className="text-slate-400">纳音</span>
            <span className="text-green-700">{nayin}</span>
          </>
        )}
      </div>

      <div className="mt-2 text-[13px] text-slate-600">
        {flowItem && (
          <>
            <div className="font-semibold text-indigo-700">
              {SCOPE_LABEL[activeScope]} {flowItem.heavenlyStem}{flowItem.earthlyBranch}
            </div>
            <div className="mt-1">
              四化：{flowItem.mutagen.map((star, index) => `${star}${MUTAGEN_LABELS[index]}`).join('、')}
            </div>
          </>
        )}
        <div className="mt-1 text-xs italic text-slate-300">Powered by iztro</div>
      </div>
      </div>
    </div>
  )
}

function parsePalaces(chart: FunctionalAstrolabe): PalaceData[] {
  return (chart.palaces || []).map((palace, index) => {
    const majorStars: StarData[] = (palace.majorStars || []).map((star) => ({
      name: String(star.name),
      brightness: star.brightness ? String(star.brightness) : undefined,
      mutagen: star.mutagen ? String(star.mutagen) : undefined,
    }))

    const minorStars: StarData[] = (palace.minorStars || []).map((star) => ({
      name: String(star.name),
      brightness: star.brightness ? String(star.brightness) : undefined,
      mutagen: star.mutagen ? String(star.mutagen) : undefined,
    }))

    const palaceWithExtras = palace as typeof palace & { adjectiveStars?: ExtraStarData[] }
    const adjectiveStars = (palaceWithExtras.adjectiveStars || [])
      .map((star) => String(star.name || ''))
      .filter(Boolean)

    return {
      index,
      name: String(palace.name),
      stem: String(palace.heavenlyStem),
      branch: String(palace.earthlyBranch),
      majorStars,
      minorStars,
      adjectiveStars,
      decadal: palace.decadal as { range: [number, number] },
      boshi12: String(palace.boshi12 || ''),
      changsheng12: String(palace.changsheng12 || ''),
      isLife: palace.name === '命宫',
      isBody: palace.isBodyPalace === true,
    }
  })
}

export function ChartDisplay({ horoscope, activeScope = 'decadal' }: ChartDisplayProps) {
  const { chart, birthInfo } = useChartStore()
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null)

  if (!chart || !birthInfo) return null

  const palaceData = parsePalaces(chart)
  const grid: (PalaceData | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null))

  palaceData.forEach((palace) => {
    const pos = PALACE_POSITIONS[palace.branch]
    if (pos) grid[pos.row][pos.col] = palace
  })

  const solarDate = `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日`
  const gender = birthInfo.gender === 'male' ? '男' : '女'
  const lifePalace = palaceData.find((palace) => palace.isLife) || palaceData[0]
  const activeIndex = selectedPalaceIndex ?? lifePalace.index
  const activePalace = palaceData.find((palace) => palace.index === activeIndex) || lifePalace
  const sanfangIndices = getSanfangIndicesByBranch(palaceData, activePalace)

  const renderPalace = (palace: PalaceData | null, key: string) => {
    if (!palace) return <div key={key} />
    const sanfangPosition = sanfangIndices.indexOf(palace.index)
    return (
      <PalaceCard
        key={key}
        {...palace}
        flowOverlay={getFlowOverlay(horoscope, activeScope, palace.index)}
        isSelected={activeIndex === palace.index}
        isSanfang={sanfangPosition >= 0}
        sanfangLabel={sanfangPosition >= 0 ? SANFANG_LABELS[sanfangPosition] : undefined}
        onClick={() => setSelectedPalaceIndex(activeIndex === palace.index ? null : palace.index)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1180px] border border-slate-200 bg-white p-1.5 shadow-sm">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">三方四正</span>
        <span>当前：{palaceData.find((palace) => palace.index === activeIndex)?.name}</span>
        <span>点击任意宫位切换查看</span>
      </div>
      <div className="relative grid grid-cols-4 gap-px bg-slate-200 overflow-hidden">
        {grid[0].map((palace, col) => renderPalace(palace, `0-${col}`))}
        {renderPalace(grid[1][0], '1-0')}
        <div className="relative z-0 col-span-2 row-span-2">
          <CenterInfo
            chart={chart}
            solarDate={solarDate}
            gender={gender}
            horoscope={horoscope}
            activeScope={activeScope}
            palaces={palaceData}
            activePalaceIndex={activeIndex}
          />
        </div>
        {renderPalace(grid[1][3], '1-3')}
        {renderPalace(grid[2][0], '2-0')}
        {renderPalace(grid[2][3], '2-3')}
        {grid[3].map((palace, col) => renderPalace(palace, `3-${col}`))}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>命宫</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <span>身宫</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-700">禄</span>
          <span className="text-amber-700">权</span>
          <span className="text-sky-700">科</span>
          <span className="text-rose-700">忌</span>
          <span>四化</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded bg-indigo-50 px-1 text-indigo-700">运限</span>
          <span>{SCOPE_LABEL[activeScope]}叠盘</span>
        </div>
      </div>
    </div>
  )
}
