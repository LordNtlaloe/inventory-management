"use client"

import React from "react"

interface PeriodSelectorProps {
  currentPeriod: "monthly" | "weekly"
  onChange: (period: "monthly" | "weekly") => void
}

export function PeriodSelector({ currentPeriod, onChange }: PeriodSelectorProps) {
  return (
    <select
      value={currentPeriod}
      onChange={(e) => onChange(e.target.value as "monthly" | "weekly")}
      className="border rounded px-2 py-1"
      aria-label="Select period"
    >
      <option value="monthly">Monthly</option>
      <option value="weekly">Weekly</option>
    </select>
  )
}
