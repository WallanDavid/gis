import { createContext, useContext, useMemo, useState } from 'react'

const TabsCtx = createContext(null)

export function Tabs({ defaultValue = '', value, onValueChange, className = '', children }) {
  const [internal, setInternal] = useState(defaultValue || '')
  const v = value ?? internal
  const setV = onValueChange ?? setInternal
  const ctx = useMemo(() => ({ value: v, setValue: setV }), [v, setV])
  return (
    <TabsCtx.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  )
}

export function TabsList({ className = '', children }) {
  return <div className={`inline-grid gap-1 ${className}`}>{children}</div>
}

export function TabsTrigger({ value, className = '', children }) {
  const ctx = useContext(TabsCtx)
  const active = ctx?.value === value
  const base = 'px-3 py-2 border rounded text-sm transition'
  const activeCls = 'bg-slate-800 text-white border-slate-800'
  const inactiveCls = 'bg-white text-slate-700 border-slate-300'
  return (
    <button
      className={`${base} ${active ? activeCls : inactiveCls} ${className}`}
      onClick={() => ctx?.setValue(value)}
      type="button"
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className = '', children }) {
  const ctx = useContext(TabsCtx)
  if (ctx?.value !== value) return null
  return <div className={className}>{children}</div>
}

