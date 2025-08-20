
"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
}

export function AddonToggleGroup({ value, onChange, options }: Props) {
  return (
    <ToggleGroup
      type="multiple"
      value={value}
      onValueChange={onChange}
      className="flex flex-wrap gap-2"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className="text-sm px-3 py-1"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
