import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FABAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
}

interface FloatingActionButtonProps {
  actions: FABAction[]
  className?: string
  position?: "bottom-right" | "bottom-left"
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className,
  position = "bottom-right"
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleActionClick = (action: FABAction) => {
    action.onClick()
    setIsExpanded(false)
  }

  const positionClasses = {
    "bottom-right": "bottom-24 right-4 md:bottom-4",
    "bottom-left": "bottom-24 left-4 md:bottom-4"
  }

  return (
    <div className={cn(
      "fixed z-60 flex flex-col items-end gap-3",
      positionClasses[position],
      className
    )}>
      {/* Action buttons - appear when expanded */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-slide-in-from-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap animate-fade-in">
                {action.label}
              </span>
              <Button
                size="icon"
                variant={action.variant || "default"}
                onClick={() => handleActionClick(action)}
                className="h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                {action.icon}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <Button
        size="icon"
        onClick={toggleExpanded}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-all duration-200",
          isExpanded && "rotate-45"
        )}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  )
}
