"use client"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  MessageSquarePlus,
  Play,
  Settings,
  Bot,
  FileText,
  ChevronLeft,
  ChevronRight,
  Database,
  Globe,
  UserCog,
  Bell,
  Shield,
  Palette,
} from "lucide-react"

interface Conversation {
  id: string
  title: string
  date: string
  active?: boolean
}

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  conversations: Conversation[]
  activeConversation: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDemoConversation: () => void
  activeSection: string
  onSectionChange: (section: string) => void
}



export function AppSidebar({
  collapsed,
  onToggle,
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDemoConversation,
  activeSection,
  onSectionChange,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-full",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-14">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">AGC-WARE</span>
              <span className="text-[10px] text-muted-foreground leading-none">Copilot Contable</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </div>

      <Separator />

      {/* New Conversation Button */}
      <div className="flex flex-col gap-2 p-3">
        <Button
          onClick={onNewConversation}
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 border-dashed border-border hover:bg-accent transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Nueva conversacion</span>}
        </Button>
        <Button
          onClick={onDemoConversation}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <Play className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">Ejemplo de conversacion</span>}
        </Button>
      </div>

      <Separator className="mx-3" />

      {/* Recent Conversations */}
      {!collapsed && activeSection === "chat" && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Recientes
            </span>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="flex flex-col gap-0.5 pb-4">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors w-full",
                    activeConversation === conv.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="text-sm truncate w-full">{conv.title}</span>
                  <span className="text-[10px] text-muted-foreground">{conv.date}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Footer: Settings + Toggle */}
      <div className="mt-auto border-t border-border p-3 flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors",
                collapsed && "justify-center px-0"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm">Configuracion</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Configuracion</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Database className="h-4 w-4" />
              <span>Conexion ERP</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Globe className="h-4 w-4" />
              <span>Webhook n8n</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <UserCog className="h-4 w-4" />
              <span>Perfil de usuario</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              <span>Permisos y roles</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Palette className="h-4 w-4" />
              <span>Apariencia</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-md py-2 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
