"use client";
import { LBButton } from "../../components/ui/Primitives";

export default function DeliveryStep({ cart, onNext, onBack, onSelect }: any) {
  const subtotalTTC = cart.reduce(
    (acc: number, it: any) => acc + Number(it.price_ttc) * Number(it.quantity),
    0
  );

  const shippingOptions = [
    { id: "pickup", label: "Retrait en magasin (gratuit)", fee_ttc: 0 },
    { id: "standard", label: "Livraison standard (3-5j)", fee_ttc: 5 },
    { id: "express", label: "Livraison express (1-2j)", fee_ttc: 12 },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Livraison</h3>
      <p className="text-sm text-gray-500 mb-4">
        Choisissez un mode de retrait ou de livraison.
      </p>
      <div className="space-y-3">
        {shippingOptions.map((opt) => (
          <div
            key={opt.id}
            className="p-4 border rounded flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{opt.label}</div>
              <div className="text-sm text-gray-500">
                Frais: {opt.fee_ttc.toFixed(2)} €
              </div>
            </div>
            <div>
              <LBButton color="primary" onPress={() => onSelect(opt)}>
                Sélectionner
              </LBButton>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between">
        <LBButton color="default" onPress={onBack}>
          Retour
        </LBButton>
        <LBButton color="success" onPress={onNext}>
          Continuer
        </LBButton>
      </div>
    </div>
  );
}
