"use client";

import React from "react";

// HeroUI
import HInput, {
  Input,
  Textarea,
  TextAreaProps,
  type InputProps,
} from "@heroui/input";
import HButton, { Button, type ButtonProps } from "@heroui/button";
import HCard, { Card, type CardProps } from "@heroui/card";

import HSelect, { Select, type SelectProps } from "@heroui/select";
import HChip, { Chip as BaseChip, type ChipProps } from "@heroui/chip";
import { Tab, Tabs, type TabsProps } from "@heroui/tabs";
import { useGlobal } from "../../context/GlobalContext";

// 1) Input
export const LBInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ radius, variant, ...rest }, ref) => {
    const { radius: r, variantComponent } = useGlobal();
    return (
      <Input
        ref={ref}
        radius={(radius ?? (r as any)) as any}
        variant={(variant ?? (variantComponent as any)) as any}
        {...rest}
      />
    );
  }
);
LBInput.displayName = "LBInput";

// 2) Button
export const LBButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ radius, variant, ...rest }, ref) => {
    const { radius: r, variantBtn } = useGlobal();

    return (
      <Button
        ref={ref}
        radius={(radius ?? (r as any)) as any}
        variant={(variant ?? (variantBtn as any)) as any}
        {...rest}
      />
    );
  }
);
LBButton.displayName = "LBButton";

// 3) Card
export const LBCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ radius, ...rest }, ref) => {
    const { radius: r } = useGlobal();
    return <Card ref={ref} radius={(radius ?? (r as any)) as any} {...rest} />;
  }
);
LBCard.displayName = "LBCard";

// 4) Textarea
export const LBTextarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ radius, variant, ...rest }, ref) => {
    const { radius: r, variantComponent } = useGlobal();
    return (
      <Textarea
        ref={ref}
        radius={(radius ?? (r as any)) as any}
        variant={(variant ?? (variantComponent as any)) as any}
        {...rest}
      />
    );
  }
);
LBTextarea.displayName = "LBTextarea";

// 5) Select
export const LBSelect = React.forwardRef<HTMLDivElement, SelectProps<any>>(
  ({ radius, variant, ...rest }, ref) => {
    const { radius: r, variantComponent } = useGlobal();
    return (
      <Select
        radius={(radius ?? (r as any)) as any}
        variant={(variant ?? (variantComponent as any)) as any}
        {...rest}
      />
    );
  }
);
LBSelect.displayName = "LBSelect";

// 6) Chip
export const LBChip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ radius, variant, children, ...rest }, ref) => {
    const { radius: r, variantBtn } = useGlobal();
    return (
      <BaseChip
        ref={ref as any}
        radius={(radius ?? (r as any)) as any}
        variant={(variant ?? (variantBtn as any)) as any}
        {...rest}
      >
        {children}
      </BaseChip>
    );
  }
);
LBChip.displayName = "LBChip";

// 6) Chip
export const LBTabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ radius, variant, children, ...rest }, ref) => {
    const { radius: r, variantComponent } = useGlobal();

    return (
      <Tabs
        radius={(radius ?? (r as any)) as any}
        variant={(variant ?? (variantComponent as any)) as any}
        {...rest}
      >
        {children}
      </Tabs>
    );
  }
);
LBChip.displayName = "LBChip";
