import * as Tooltip from '@radix-ui/react-tooltip'

export default function InfoTooltip({ content, children }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Content side="top" sideOffset={6} className="rounded bg-slate-800 text-white text-xs px-2 py-1 shadow">
          {content}
          <Tooltip.Arrow className="fill-slate-800" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

