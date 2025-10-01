"use client";
import { Image } from "@heroui/react";
import { LBButton } from "../../components/ui/Primitives";
import { Trash2 } from "lucide-react";

export default function CartStep({
  cart,
  onNext,
  onChangeQuantity,
  onRemove,
}: any) {
  return (
    <div>
      <ul className="divide-y">
        {cart.map((item: any, index: number) => (
          <li
            key={`${item.product_id}-${index}`}
            className="py-4 flex items-center gap-4"
          >
            <div className="w-20 h-20 shrink-0">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-cover rounded"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              {item.attributs_grouped && (
                <div className="text-xs text-gray-500 mt-1">
                  {Object.entries(item.attributs_grouped)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" • ")}
                </div>
              )}
            </div>
            <div className="w-40 text-right">
              <input
                className="w-16 border rounded px-2 py-1 text-center"
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  onChangeQuantity(index, Number(e.target.value))
                }
              />
            </div>
            <div className="w-24 text-right font-semibold">
              {item.price_ttc.toFixed(2)} €
            </div>
            <div>
              <LBButton
                isIconOnly
                color="danger"
                onPress={() => onRemove(index)}
              >
                <Trash2 size={16} />
              </LBButton>
            </div>
          </li>
        ))}
      </ul>
      {/* <div className="mt-6 flex justify-end">
        <LBButton
          color="success"
          onPress={onNext}
          isDisabled={cart.length === 0}
        >
          Continuer
        </LBButton>
      </div> */}
    </div>
  );
}
