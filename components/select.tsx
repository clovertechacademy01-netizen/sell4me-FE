"use client";

import { cn } from "@/lib/utils";
import ReactSelect from "react-select";
import {
  type ChangeEvent,
  type JSX,
  type ReactNode,
} from "react";

type SelectProps = {
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  children?: ReactNode;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    isDisabled?: boolean;
  }>;
};

type SelectOption = {
  value: string;
  label: string;
  description?: string;
  isDisabled?: boolean;
};

export function Select({
  className,
  children,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  name,
  id,
  isSearchable = true,
  isClearable = false,
}: SelectProps) {
  const parsedChildren: SelectOption[] = (Array.isArray(children) ? children : [children])
    .flatMap((child) => {
      if (!child || typeof child !== "object") return [];
      const element = child as JSX.Element;
      if (!("props" in element)) return [];
      if (
        element.props?.children &&
        !element.props?.value &&
        Array.isArray(element.props.children)
      ) {
        return element.props.children;
      }
      return [element];
    })
    .filter(Boolean)
    .flatMap((child) => {
      if (!child || typeof child !== "object") return [];
      const element = child as JSX.Element;
      if (!("props" in element)) return [];
      if (element.props?.value === undefined) return [];
      return [
        {
          value: String(element.props.value),
          label: String(element.props.children ?? element.props.value),
          description: undefined,
          isDisabled: Boolean(element.props.disabled),
        },
      ];
    });

  const selectOptions: SelectOption[] = options ?? parsedChildren;

  const selected = selectOptions.find(
    (option) => option.value === String(value ?? ""),
  );

  return (
    <div className={className}>
      <ReactSelect
        unstyled
        options={selectOptions}
        value={selected ?? null}
        inputId={id}
        name={name}
        isDisabled={disabled}
        isSearchable={isSearchable}
        isClearable={isClearable}
        placeholder={placeholder}
        noOptionsMessage={() => "No options found"}
        filterOption={(option, rawInput) => {
          const query = rawInput.trim().toLowerCase();
          if (!query) return true;
          const label = option.label.toLowerCase();
          const description = (option.data.description || "").toLowerCase();
          return label.includes(query) || description.includes(query);
        }}
        onChange={(option) => {
          onChange?.({
            target: { value: option?.value ?? "" },
          } as ChangeEvent<HTMLSelectElement>);
        }}
        classNames={{
          control: (state) =>
            cn(
              "min-h-11 rounded-lg border bg-white px-3 text-sm transition",
              state.isFocused
                ? "border-brand ring-2 ring-brand/20"
                : "border-outline-variant",
            ),
          valueContainer: () => "gap-2 py-0.5",
          placeholder: () => "text-muted/65",
          singleValue: () => "text-foreground",
          input: () => "m-0 p-0 text-sm",
          indicatorsContainer: () => "gap-1",
          dropdownIndicator: () => "px-2 text-muted",
          clearIndicator: () => "px-2 text-muted",
          menu: () =>
            "mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-[0_4px_12px_rgba(10,42,107,0.08)]",
          menuList: () => "max-h-60 p-1.5",
          option: (state) =>
            cn(
              "cursor-pointer rounded-md px-3 py-2 text-sm transition",
              state.isSelected && "bg-brand text-white",
              !state.isSelected && state.isFocused && "bg-brand-soft text-brand-strong",
              !state.isSelected && !state.isFocused && "text-foreground",
            ),
        }}
        formatOptionLabel={(option, { context }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{option.label}</div>
            {option.description ? (
              <div
                className={cn(
                  "mt-0.5 line-clamp-2 text-xs leading-relaxed",
                  context === "menu"
                    ? option.value === selected?.value
                      ? "text-white/85"
                      : "text-muted"
                    : "text-muted",
                )}
              >
                {option.description}
              </div>
            ) : null}
          </div>
        }}
      />
    </div>
  );
}
