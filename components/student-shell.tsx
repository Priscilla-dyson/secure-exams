import React from 'react'

interface StudentShellProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export const StudentShell: React.FC<StudentShellProps> = ({ title, subtitle, actions, children }) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div>{actions}</div>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default StudentShell
