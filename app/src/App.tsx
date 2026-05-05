/* ============================================================
   紫微斗数 App - 主入口
   PC 工作台 + 移动端自适应
   ============================================================ */

import { useMemo, useState } from 'react'
import { BirthForm } from '@/components/BirthForm'
import { ChartDisplay } from '@/components/chart'
import { AIInterpretation } from '@/components/AIInterpretation'
import { SettingsPanel } from '@/components/SettingsPanel'
import { YearlyFortune } from '@/components/fortune'
import { LifeKLine } from '@/components/kline'
import { MatchAnalysis } from '@/components/match'
import { ShareCard } from '@/components/share'
import { useChartStore } from '@/stores'
import { getHoroscope, type HoroscopeScope } from '@/lib/astro'

type TabType = 'chart' | 'fortune' | 'kline' | 'match' | 'share' | 'me'

const TABS: Array<{ key: TabType; label: string; desc: string; icon: string }> = [
  { key: 'chart', label: '命盘解读', desc: '排盘、宫位、AI 批注', icon: '☰' },
  { key: 'fortune', label: '年度运势', desc: '流年走势与提醒', icon: '◎' },
  { key: 'kline', label: '人生K线', desc: '百岁阶段起伏图', icon: '⊹' },
  { key: 'match', label: '双人合盘', desc: '双人关系分析', icon: '⚭' },
  { key: 'share', label: '分享卡片', desc: '生成传播素材', icon: '◈' },
  { key: 'me', label: '我的', desc: '设置与账户扩展', icon: '◌' },
]

const NEXT_PHASE_ITEMS = ['账号体系', '充值额度', '服务套餐', '后台管理']
const FLOW_SCOPES: Array<{ key: HoroscopeScope; label: string }> = [
  { key: 'decadal', label: '大限' },
  { key: 'yearly', label: '流年' },
  { key: 'monthly', label: '流月' },
  { key: 'daily', label: '流日' },
]

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function App() {
  const { chart } = useChartStore()
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('chart')
  const [activeScope, setActiveScope] = useState<HoroscopeScope>('decadal')
  const [targetDate, setTargetDate] = useState(formatDateInput(new Date()))
  const horoscope = useMemo(() => (
    chart ? getHoroscope(chart, targetDate) : null
  ), [chart, targetDate])

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="aurora-bg" />
      <div className="star-bg" />

      <div className="lg:grid lg:h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* PC 侧边工作台 */}
        <aside className="hidden lg:flex flex-col border-r border-white/[0.07] bg-night/78 backdrop-blur-2xl">
          <div className="px-6 py-6 border-b border-white/[0.06]">
            <BrandBlock />
          </div>

          <nav className="flex-1 px-4 py-5 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  group w-full rounded-lg px-4 py-3 text-left
                  transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-white/[0.08] text-text shadow-[inset_3px_0_0_rgba(212,175,55,0.85)]'
                    : 'text-text-muted hover:bg-white/[0.04] hover:text-text-secondary'
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm
                      ${activeTab === tab.key
                        ? 'border-gold/35 bg-gold/12 text-gold'
                        : 'border-white/[0.08] bg-white/[0.03] text-text-muted group-hover:text-text-secondary'
                      }
                    `}
                  >
                    {tab.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{tab.label}</span>
                    <span className="mt-0.5 block text-xs text-text-muted">{tab.desc}</span>
                  </span>
                </span>
              </button>
            ))}
          </nav>

          <div className="px-5 pb-5 space-y-4">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">一期模式</span>
                <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-xs text-gold">
                  自用部署
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Coding Plan Key 由服务器配置文件托管；开放外部用户时再接账号、额度和订单系统。
              </p>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="
                flex w-full items-center justify-center gap-2 rounded-lg
                border border-white/[0.08] bg-white/[0.04] px-4 py-3
                text-sm text-text-secondary transition-all duration-200
                hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-text
              "
            >
              <span>设置模型</span>
              <span className="text-text-muted">⌘</span>
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col lg:min-h-0">
          {/* 移动端顶部栏 */}
          <header
            className="
              sticky top-0 z-40 lg:hidden
              px-4 py-3
              bg-night/86 backdrop-blur-xl
              border-b border-white/[0.06]
            "
          >
            <div className="flex items-center justify-between">
              <BrandBlock compact />
              <button
                onClick={() => setShowSettings(true)}
                className="
                  rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5
                  text-text-muted transition-all duration-200
                  hover:bg-white/[0.08] hover:text-text
                "
                title="设置"
              >
                ⚙
              </button>
            </div>
          </header>

          {/* 移动端底部导航 */}
          <nav
            className="
              lg:hidden fixed bottom-0 left-0 right-0 z-40
              px-3 py-2
              bg-night/92 backdrop-blur-xl
              border-t border-white/[0.06]
            "
          >
            <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative flex flex-col items-center gap-1 rounded-lg px-1 py-1.5
                    text-xs transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-white/[0.07] text-gold'
                      : 'text-text-muted'
                    }
                  `}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span className="leading-none">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-3 lg:py-2 lg:pb-3">
            <div className="mx-auto max-w-[1500px]">
              {activeTab === 'chart' && (
                !chart ? (
                  <div className="grid min-h-[calc(100vh-160px)] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:min-h-[calc(100vh-150px)]">
                    <WelcomePanel />
                    <BirthForm />
                  </div>
                ) : (
                  <div className="animate-fade-in space-y-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">本命盘与运限叠盘</h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            选择目标日期后，可切换大限、流年、流月、流日查看宫位与四化。
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <input
                            type="date"
                            value={targetDate}
                            onChange={(event) => setTargetDate(event.target.value)}
                            className="
                              rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800
                              outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                            "
                          />
                          <div className="grid grid-cols-4 rounded-lg border border-slate-200 bg-slate-50 p-1">
                            {FLOW_SCOPES.map((scope) => (
                              <button
                                key={scope.key}
                                onClick={() => setActiveScope(scope.key)}
                                className={`
                                  rounded-md px-3 py-1 text-sm font-medium transition
                                  ${activeScope === scope.key
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                  }
                                `}
                              >
                                {scope.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-text">本命盘工作区</h3>
                        <p className="text-xs text-text-muted">
                          点击宫位查看三方四正；下方可继续生成 AI 批注。
                        </p>
                      </div>
                      <button
                        onClick={() => useChartStore.getState().clear()}
                        className="
                          inline-flex w-fit items-center gap-2 rounded-lg
                          border border-white/[0.08] bg-white/[0.04] px-4 py-2
                          text-sm text-text-muted transition-all duration-200
                          hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-text
                        "
                      >
                        ← 重新输入
                      </button>
                    </div>

                    <ChartDisplay horoscope={horoscope} activeScope={activeScope} />
                    <AIInterpretation />
                  </div>
                )
              )}

              {activeTab === 'fortune' && (
                !chart ? (
                  <GateState
                    message="请先在「命盘解读」中输入您的生辰信息"
                    action={() => setActiveTab('chart')}
                    actionLabel="前往输入"
                  />
                ) : (
                  <YearlyFortune />
                )
              )}

              {activeTab === 'kline' && (
                !chart ? (
                  <GateState
                    message="请先在「命盘解读」中输入您的生辰信息"
                    action={() => setActiveTab('chart')}
                    actionLabel="前往输入"
                  />
                ) : (
                  <LifeKLine />
                )
              )}

              {activeTab === 'match' && <MatchAnalysis />}

              {activeTab === 'share' && (
                !chart ? (
                  <GateState
                    message="请先在「命盘解读」中输入您的生辰信息"
                    action={() => setActiveTab('chart')}
                    actionLabel="前往输入"
                  />
                ) : (
                  <div className="mx-auto max-w-xl">
                    <ShareCard />
                  </div>
                )
              )}

              {activeTab === 'me' && (
                <MePanel onOpenSettings={() => setShowSettings(true)} />
              )}
            </div>
          </main>

          <footer className="hidden border-t border-white/[0.04] px-8 py-2 text-xs text-text-muted lg:block">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between">
              <span>紫微知道 · AI 命理工作台</span>
              <span>一期：自用部署 · 二期：账号、充值、额度、运营后台</span>
            </div>
          </footer>
        </div>
      </div>

      {showSettings && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/60 backdrop-blur-sm
            flex items-center justify-center p-4
          "
          onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div className="animate-fade-in">
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          relative flex shrink-0 items-center justify-center rounded-lg
          border border-white/[0.1] bg-gradient-to-br from-star/20 to-gold/20
          shadow-[0_0_20px_rgba(124,58,237,0.16)]
          ${compact ? 'h-9 w-9' : 'h-11 w-11'}
        `}
      >
        <span className="text-gold">☆</span>
      </div>
      <div>
        <h1
          className={`
            font-bold bg-gradient-to-r from-star-light via-gold to-star-light
            bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_4s_ease-in-out_infinite]
            ${compact ? 'text-lg' : 'text-xl'}
          `}
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          紫微知道
        </h1>
        {!compact && (
          <p className="text-xs text-text-muted">AI 命理预测服务</p>
        )}
      </div>
    </div>
  )
}

function WelcomePanel() {
  return (
    <section className="hidden lg:block">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-medium text-gold">第一期 · 自用部署版本</p>
        <h2
          className="text-4xl font-semibold leading-tight text-text"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          一套能直接部署到服务器的紫微斗数 AI 工作台
        </h2>
        <p className="mt-5 max-w-xl text-base leading-8 text-text-secondary">
          在 iztro 排盘能力之上，整理出更适合 PC 看盘的工作台：运限叠盘、AI 解读、K 线、合盘和分享都放在同一个自用部署版本里。模型 Key 先由服务器托管，后续再接账号、订单和额度系统。
        </p>
        <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
          {[
            ['PC 优先', '大屏工作区、侧边导航、内容区滚动'],
            ['手机可用', '移动端顶部栏与底部导航自动切换'],
            ['百炼接入', '内置百炼按量与 Coding Plan 端点'],
            ['二期预留', '注册、充值、额度、后台能力已留入口'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-4">
              <h3 className="text-sm font-medium text-text">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MePanel({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">我的</h2>
        <p className="mt-1 text-sm text-slate-500">
          当前是独立自用部署版本。模型配置、账户体系、充值额度和后台能力后续都可以从这里扩展。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          onClick={onOpenSettings}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-300 hover:bg-amber-100"
        >
          <div className="text-sm font-semibold text-amber-800">模型设置</div>
          <div className="mt-1 text-xs leading-5 text-amber-700">
            查看 Coding Plan 服务器托管配置，或切换其他模型、BaseURL 与联网搜索。
          </div>
        </button>

        {NEXT_PHASE_ITEMS.map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-800">{item}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              二期开放给外部用户时接入。
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface GateStateProps {
  message: string
  action: () => void
  actionLabel: string
}

function GateState({ message, action, actionLabel }: GateStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="
          max-w-md rounded-lg border border-white/[0.06] bg-white/[0.03]
          p-8 text-center backdrop-blur-xl
        "
      >
        <div className="mb-4 text-4xl opacity-30">☆</div>
        <p className="mb-5 text-text-muted">{message}</p>
        <button
          onClick={action}
          className="
            inline-flex items-center gap-2 rounded-lg
            bg-star/20 px-4 py-2 text-sm text-star-light
            transition-colors hover:bg-star/30
          "
        >
          {actionLabel}
          <span>→</span>
        </button>
      </div>
    </div>
  )
}
