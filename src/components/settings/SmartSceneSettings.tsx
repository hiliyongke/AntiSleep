import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAppStore } from '../../stores/appStore'
import { listProcessesDetailed } from '../../lib/tauri-commands'
import type { ProcessInfo } from '../../types'
import { Search, RefreshCw, Plus, X, Cpu, HardDrive, Check, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type AddMode = 'browse' | 'manual'
type SortKey = 'name' | 'pid' | 'cpu' | 'memory'
type SortDir = 'asc' | 'desc'

function formatMemory(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatCpu(cpu: number): string {
  return `${cpu.toFixed(1)}%`
}

export function SmartSceneSettings() {
  const smartScene = useAppStore((s) => s.smartScene)
  const settings = useAppStore((s) => s.settings)
  const setAutoOnCharge = useAppStore((s) => s.setAutoOnCharge)
  const setProcessNames = useAppStore((s) => s.setProcessNames)
  const setPollIntervalSeconds = useAppStore((s) => s.setPollIntervalSeconds)

  const [addMode, setAddMode] = useState<AddMode>('browse')
  const [processList, setProcessList] = useState<ProcessInfo[]>([])
  const [runningNames, setRunningNames] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [browserExpanded, setBrowserExpanded] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load process list
  const loadProcesses = useCallback(async () => {
    setLoading(true)
    try {
      const procs = await listProcessesDetailed()
      setProcessList(procs)
      // Build set of currently running process names (for status indicators)
      const names = new Set<string>()
      for (const p of procs) {
        names.add(p.name.toLowerCase())
      }
      setRunningNames(names)
    } catch (e) {
      console.error('[SmartScene] Failed to load processes:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProcesses()
    // Auto-refresh every 15 seconds while component is mounted
    refreshTimerRef.current = setInterval(loadProcesses, 15000)
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [loadProcesses])

  // Filter processes by search query
  const filteredProcesses = useMemo(() => {
    let list = processList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toString().includes(searchQuery),
    )

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'pid':
          cmp = a.pid - b.pid
          break
        case 'cpu':
          cmp = a.cpuUsage - b.cpuUsage
          break
        case 'memory':
          cmp = a.memoryBytes - b.memoryBytes
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [processList, searchQuery, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Check if a process name is already selected
  const isSelected = (name: string) =>
    smartScene.processNames.some((n) => n.toLowerCase() === name.toLowerCase())

  // Toggle a process from the running list
  const toggleProcess = (name: string) => {
    if (isSelected(name)) {
      setProcessNames(smartScene.processNames.filter((n) => n.toLowerCase() !== name.toLowerCase()))
    } else {
      setProcessNames([...smartScene.processNames, name])
    }
  }

  // Manual add
  const handleManualAdd = () => {
    const trimmed = manualInput.trim()
    if (!trimmed) return
    if (isSelected(trimmed)) {
      setManualInput('')
      return
    }
    setProcessNames([...smartScene.processNames, trimmed])
    setManualInput('')
  }

  // Remove a selected process
  const removeProcess = (name: string) => {
    setProcessNames(smartScene.processNames.filter((n) => n !== name))
  }

  // Check if a selected process is currently running
  const isRunning = (name: string) => runningNames.has(name.toLowerCase())

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>智能场景</h2>

      {/* Auto on charge */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>充电时自动激活</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>检测到电源适配器连接时自动开始防锁屏</p>
        </div>
        <button
          onClick={() => setAutoOnCharge(!smartScene.autoOnCharge)}
          className={`fluent-toggle ${smartScene.autoOnCharge ? 'fluent-toggle-active' : ''}`}
        >
          <span className="fluent-toggle-thumb" />
        </button>
      </div>

      <div className="fluent-divider" />

      {/* Process detection */}
      <div className="space-y-3">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>进程检测自动激活</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>指定进程运行时自动开始防锁屏，全部退出后自动停止</p>
        </div>

        {/* Selected processes as chips */}
        {smartScene.processNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>已选进程</p>
            <div className="flex flex-wrap gap-1.5">
              {smartScene.processNames.map((name) => (
                <div
                  key={name}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors border ${
                    isRunning(name)
                      ? 'bg-functional-success/15 text-functional-success border-functional-success/30'
                      : ''
                  }`}
                  style={isRunning(name) ? {} : { backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', borderColor: 'var(--border-fluent)' }}
                >
                  {/* Running indicator dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRunning(name) ? 'bg-functional-success' : ''
                    }`}
                    style={isRunning(name) ? {} : { backgroundColor: 'var(--text-tertiary)' }}
                  />
                  <span>{name}</span>
                  <button
                    onClick={() => removeProcess(name)}
                    className="ml-0.5 transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#D13438')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add mode tabs */}
        <div className="flex gap-1 p-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-subtle)' }}>
          <button
            onClick={() => setAddMode('browse')}
            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              addMode === 'browse'
                ? 'bg-accent/15 text-accent'
                : ''
            }`}
            style={addMode === 'browse' ? {} : { color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { if (addMode !== 'browse') e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={(e) => { if (addMode !== 'browse') e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            从运行中选择
          </button>
          <button
            onClick={() => setAddMode('manual')}
            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              addMode === 'manual'
                ? 'bg-accent/15 text-accent'
                : ''
            }`}
            style={addMode === 'manual' ? {} : { color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { if (addMode !== 'manual') e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={(e) => { if (addMode !== 'manual') e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            手动输入
          </button>
        </div>

        {/* Browse mode: process list */}
        {addMode === 'browse' && (
          <div className="space-y-2">
            {/* Search + refresh bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索进程名或 PID..."
                  className="fluent-input w-full pl-8 pr-2"
                />
              </div>
              <button
                onClick={loadProcesses}
                disabled={loading}
                className={`fluent-btn px-2.5 ${loading ? 'opacity-50' : ''}`}
                title="刷新进程列表"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Process list */}
            <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border-fluent)' }}>
              <div
                className="flex items-center justify-between px-3 py-1.5 cursor-pointer"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
                onClick={() => setBrowserExpanded(!browserExpanded)}
              >
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {filteredProcesses.length} 个进程{searchQuery ? '（已筛选）' : ''}
                </span>
                {browserExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
              </div>

              {browserExpanded && (
                <div className="max-h-[320px] overflow-y-auto relative">
                  {/* Table header */}
                  <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 text-[11px] font-semibold select-none" style={{ backgroundColor: 'var(--bg-medium)', borderBottom: '1px solid var(--border-fluent)', color: 'var(--text-secondary)' }}>
                    <div className="w-3.5 flex-shrink-0" /> {/* checkbox spacer */}

                    {/* Name header */}
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex-1 flex items-center gap-0.5 text-left transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      <span>进程名</span>
                      {sortKey === 'name' ? (
                        sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                      ) : (
                        <ArrowUpDown size={10} className="opacity-40" />
                      )}
                    </button>

                    {/* PID header */}
                    <button
                      onClick={() => toggleSort('pid')}
                      className="w-16 flex items-center justify-end gap-0.5 transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      <span>PID</span>
                      {sortKey === 'pid' ? (
                        sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                      ) : (
                        <ArrowUpDown size={10} className="opacity-40" />
                      )}
                    </button>

                    {/* CPU header */}
                    <button
                      onClick={() => toggleSort('cpu')}
                      className="w-16 flex items-center justify-end gap-0.5 transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      <span>CPU</span>
                      {sortKey === 'cpu' ? (
                        sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                      ) : (
                        <ArrowUpDown size={10} className="opacity-40" />
                      )}
                    </button>

                    {/* Memory header */}
                    <button
                      onClick={() => toggleSort('memory')}
                      className="w-20 flex items-center justify-end gap-0.5 transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                    >
                      <span>内存</span>
                      {sortKey === 'memory' ? (
                        sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                      ) : (
                        <ArrowUpDown size={10} className="opacity-40" />
                      )}
                    </button>
                  </div>

                  {filteredProcesses.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {loading ? '加载中...' : '没有匹配的进程'}
                    </div>
                  ) : (
                    filteredProcesses.map((proc) => {
                      const selected = isSelected(proc.name)
                      return (
                        <button
                          key={`${proc.pid}-${proc.name}`}
                          onClick={() => toggleProcess(proc.name)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                            selected
                              ? 'bg-accent/10'
                              : ''
                          }`}
                          style={selected ? {} : {}}
                          onMouseEnter={(e) => { if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)' }}
                          onMouseLeave={(e) => { if (!selected) e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              selected
                                ? 'bg-accent border-accent'
                                : ''
                            }`}
                            style={selected ? {} : { borderColor: 'var(--border-fluent-hover)' }}
                          >
                            {selected && <Check size={10} className="text-white" />}
                          </div>

                          {/* Process name */}
                          <span className={`flex-1 text-xs truncate ${selected ? 'text-accent' : ''}`} style={selected ? {} : { color: 'var(--text-primary)' }}>
                            {proc.name}
                          </span>

                          {/* PID */}
                          <span className="text-[10px] tabular-nums w-16 text-right flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            {proc.pid}
                          </span>

                          {/* CPU */}
                          <span className="text-[10px] tabular-nums w-16 text-right flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            {formatCpu(proc.cpuUsage)}
                          </span>

                          {/* Memory */}
                          <span className="text-[10px] tabular-nums w-20 text-right flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                            {formatMemory(proc.memoryBytes)}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual input mode */}
        {addMode === 'manual' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                placeholder="输入进程名，如 python、node、code"
                className="fluent-input flex-1"
              />
              <button
                onClick={handleManualAdd}
                disabled={!manualInput.trim()}
                className={`fluent-btn-primary px-3 ${!manualInput.trim() ? 'opacity-50' : ''}`}
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              输入进程名称即可。支持模糊匹配，如输入 "python" 可匹配 "python3"。
            </p>
          </div>
        )}
      </div>

      <div className="fluent-divider" />

      {/* Poll interval */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>检测频率</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>每隔多久检测一次进程和充电状态</p>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{settings.pollIntervalSeconds}秒</span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={settings.pollIntervalSeconds}
          onChange={(e) => setPollIntervalSeconds(Number(e.target.value))}
          className="fluent-slider"
        />
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>5秒（更灵敏）</span>
          <span>60秒（更省电）</span>
        </div>
      </div>
    </div>
  )
}
