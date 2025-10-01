"use client";
import { LBButton } from "../../components/ui/Primitives";

export default function PurchaseStep({
  cart,
  shipping,
  totalTTC,
  onBack,
  onPay,
  isLoading,
}: any) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
      <div className="space-y-2">
        {cart.map((it: any, i: number) => (
          <div key={i} className="flex justify-between">
            <div>
              {it.name} x{it.quantity}
            </div>
            <div>
              {(Number(it.price_ttc) * Number(it.quantity)).toFixed(2)} €
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-2">
          <div>Frais de port</div>
          <div>{shipping?.fee_ttc?.toFixed(2) || "0.00"} €</div>
        </div>
      </div>

      <div className="border-t mt-4 pt-4 flex justify-between items-center">
        <div className="font-semibold">Total (TTC)</div>
        <div className="text-xl font-bold">{Number(totalTTC).toFixed(2)} €</div>
      </div>

      <div className="mt-6 flex justify-between">
        <LBButton color="default" onPress={onBack}>
          Retour
        </LBButton>
        <LBButton color="success" isLoading={isLoading} onPress={onPay}>
          Payer
        </LBButton>
      </div>
    </div>
  );
}
