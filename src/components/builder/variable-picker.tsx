"use client"

import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Variable } from "@/lib/generation/variables"
import { Braces, ChevronRight, Hash, Globe, Database, Shield, Zap, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VariablePickerProps {
  variables: Variable[];
  onSelect: (variable: string) => void;
  trigger?: React.ReactNode;
}

export function VariablePicker({ variables, onSelect, trigger }: VariablePickerProps) {
  const [search, setSearch] = useState("");

  const filterVariables = (vars: Variable[]): Variable[] => {
    return vars.map(v => ({
      ...v,
      children: v.children ? filterVariables(v.children) : undefined
    })).filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.children && v.children.length > 0)
    );
  };

  const filtered = search ? filterVariables(variables) : variables;
  const categories = Array.from(new Set(filtered.map(v => v.category)));

  const getIcon = (category: string) => {
    switch (category) {
      case 'Request': return <Globe size={14} className="text-blue-400" />;
      case 'Database': return <Database size={14} className="text-emerald-400" />;
      case 'Auth': return <Shield size={14} className="text-purple-400" />;
      case 'Environment': return <Zap size={14} className="text-amber-400" />;
      default: return <Hash size={14} className="text-zinc-400" />;
    }
  };

  const renderVariable = (v: Variable) => {
    if (v.children && v.children.length > 0) {
      return (
        <DropdownMenuSub key={v.id}>
          <DropdownMenuSubTrigger className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer focus:bg-white/5 focus:text-white group">
             <div className="flex flex-col">
                <span className="text-xs font-mono text-zinc-300 group-hover:text-white transition-colors">{v.name}</span>
             </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-zinc-950 border-white/10 text-zinc-300 min-w-48">
              {v.children.map(child => renderVariable(child))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={v.id}
        className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer focus:bg-white/5 focus:text-white group"
        onClick={() => onSelect(v.name)}
      >
        <div className="flex flex-col">
          <span className="text-xs font-mono text-primary group-hover:text-white transition-colors">{`{{${v.name}}}`}</span>
          {v.description && <span className="text-[10px] text-zinc-500">{v.description}</span>}
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-white/5 transition-all">
            <Braces size={14} /> Browse Variables
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-zinc-950 border-white/10 text-zinc-300 shadow-2xl rounded-2xl p-2">
        <div className="p-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search context..."
                    className="h-9 pl-9 bg-zinc-900 border-white/5 text-xs focus:ring-primary/20"
                />
            </div>
        </div>
        <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
        <ScrollArea className="max-h-96 overflow-y-auto">
            {categories.map((category) => (
            <DropdownMenuGroup key={category}>
                <DropdownMenuLabel className="flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
                {getIcon(category)}
                {category}
                </DropdownMenuLabel>
                {filtered.filter(v => v.category === category).map((variable) => renderVariable(variable))}
                <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
            </DropdownMenuGroup>
            ))}
            {filtered.length === 0 && (
                <div className="p-8 text-center space-y-2 opacity-50">
                    <Hash size={24} className="mx-auto text-zinc-600" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">No context matches</p>
                </div>
            )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
