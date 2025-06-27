export function calculPriceTTC(price_ht: number, tva_tx: number): number {
  const tva = isNaN(tva_tx) ? 20 : tva_tx || 0;

  return parseFloat((price_ht * (1 + tva / 100)).toFixed(2));
}

/**
 * Calcule le prix HT à partir du TTC et du taux de TVA
 * @param priceTTC Prix toutes taxes comprises
 * @param tva Taux de TVA en %
 * @returns Prix hors taxe
 */
export function calculPriceHT(priceTTC: number, tva: number): number {
  return priceTTC / (1 + tva / 100);
}
