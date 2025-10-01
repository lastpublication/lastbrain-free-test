"use client";

import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { useEffect, useMemo, useState } from "react";
import { LBSelect } from "../../components/ui/Primitives";

type VariantItem = {
  id: string;
  sku: string;
  sale_price: number;
  stock: number;
};

export const VariantDetails = ({
  variant,
  onSelectionChange,
}: {
  variant: any;
  onSelectionChange?: (
    payload: {
      variant: VariantItem | null;
      attrs: Record<string, string>;
    } | null
  ) => void;
}) => {
  const attributes: Record<string, string[]> = variant?.attributes || {};
  const variants: VariantItem[] = variant?.variants || [];

  // store one selected value per attribute (ex: { couleur: 'NOIR', taille: 'M' })
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    () => {
      const init: Record<string, string> = {};
      Object.entries(attributes).forEach(([k, vals]) => {
        init[k] = vals?.[0] ?? "";
      });
      return init;
    }
  );

  // when variant.attributes change, reset defaults
  useEffect(() => {
    const init: Record<string, string> = {};
    Object.entries(attributes).forEach(([k, vals]) => {
      init[k] = vals?.[0] ?? "";
    });
    setSelectedAttrs(init);
  }, [variant]);

  // compute selected variant by matching all selected attribute values in SKU
  const selectedVariant = useMemo(() => {
    const values = Object.values(selectedAttrs).filter(
      (v) => v && v.length > 0
    );
    if (values.length === 0) return null;

    return (
      variants.find((v) => {
        const sku = (v.sku || "").toUpperCase();
        return values.every((val) => sku.includes(val.toUpperCase()));
      }) || null
    );
  }, [variants, selectedAttrs]);

  // notify parent when selection changes (send variant + selected attrs)
  useEffect(() => {
    if (onSelectionChange)
      onSelectionChange({ variant: selectedVariant, attrs: selectedAttrs });
  }, [selectedVariant, selectedAttrs, onSelectionChange]);

  return (
    <div>
      <div className="flex gap-4 mb-4 flex-col">
        {Object.entries(attributes).map(([attrName, options]) => (
          <div key={attrName} className="min-w-[160px]">
            <label className="block text-sm font-medium">
              {attrName.charAt(0).toUpperCase() + attrName.slice(1)}
            </label>
            <LBSelect
              size="lg"
              selectedKeys={new Set([selectedAttrs[attrName] || ""]) as any}
              onSelectionChange={(keys: any) => {
                const arr = Array.from(keys as Iterable<any>);
                const val = arr[0] ? String(arr[0]) : "";
                setSelectedAttrs((s) => ({ ...s, [attrName]: val }));
              }}
            >
              {options?.map((opt: string) => (
                <SelectItem key={opt}>{opt}</SelectItem>
              ))}
            </LBSelect>
          </div>
        ))}
      </div>

      <div className="mb-4">
        {selectedVariant ? (
          <div>
            <div className="flex flex-inline items-center justify-between">
              <p>Stock: {selectedVariant.stock}</p>
              {selectedVariant.stock > 0 ? (
                <Chip color="success">En stock</Chip>
              ) : (
                <Chip color="danger">Rupture</Chip>
              )}
            </div>
          </div>
        ) : (
          <p>Aucune variante correspondante</p>
        )}
      </div>
    </div>
  );
};
