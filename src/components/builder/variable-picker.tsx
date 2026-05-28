"use client"

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Variable } from "@/lib/generation/variables"
import { Braces, ChevronRight, Hash, Globe, Database, Shield, Zap } from "lucide-react"

interface VariablePickerProps {
  variables: Variable[];
  onSelect: (variable: string) => void;
  trigger?: React.ReactNode;
}

export function VariablePicker({ variables, onSelect, trigger }: VariablePickerProps) {
  const categories = Array.from(new Set(variables.map(v => v.category)));

  const getIcon = (category: string) => {
    switch (category) {
      case 'Request': return <Globe size={14} className="text-blue-400" />;
      case 'Database': return <Database size={14} className="text-emerald-400" />;
      case 'Auth': return <Shield size={14} className="text-purple-400" />;
      case 'Environment': return <Zap size={14} className="text-amber-400" />;
      default: return <Hash size={14} className="text-zinc-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest cursor-pointer">
            <Braces size={14} /> Insert Variable
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-zinc-950 border-zinc-800 text-zinc-300">
        {categories.map((category) => (
          <DropdownMenuGroup key={category}>
            <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
              {getIcon(category)}
              {category}
            </DropdownMenuLabel>
            {variables.filter(v => v.category === category).map((variable) => (
              <DropdownMenuItem
                key={variable.id}
                className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer focus:bg-white/5 focus:text-white group"
                onClick={() => onSelect(variable.name)}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-primary group-hover:text-white transition-colors">{`{{${variable.name}}}`}</span>
                  {variable.description && <span className="text-[10px] text-zinc-500">{variable.description}</span>}
                </div>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-zinc-800/50" />
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
