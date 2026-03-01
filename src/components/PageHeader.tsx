export type PageHeaderProps = {
  title: string
  lead?: string
  action?: React.ReactNode
}

export function PageHeader({ title, lead, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="m-0 text-[1.9rem]">{title}</h1>
        {lead != null && (
          <p className="mt-1.5 text-[#4c5e75]">{lead}</p>
        )}
      </div>
      {action}
    </div>
  )
}
