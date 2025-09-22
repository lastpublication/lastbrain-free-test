import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

export const PaiemnentTab = ({ paiements }: { paiements: any }) => {
  /*[{"id":"d3369724-3f41-484a-9c22-927ce942265c","owner_id":"9905679c-f0ec-4b79-97ae-bd251a0b58bb","user_create":"9905679c-f0ec-4b79-97ae-bd251a0b58bb","ref":"PAY2509-00001","amount":20,"project_id":"7b123b20-087a-47b6-8f89-c80ebd74a8c7","created_at":"2025-09-05T15:56:00.297496+00:00","updated_at":"2025-09-05T15:56:00.297496+00:00","date_p":"2025-09-05T00:00:00+00:00","payment_type":"ESP","invoice_id":"333441e4-cab9-4e16-858c-2bc2700dafd4","avoir_id":null,"stripe_paiement_id":null,"platform_fee_cents":0,"amount_text":"20.00"}]*/
  return (
    <div>
      <h1>PaiementTab</h1>

      <Table>
        <TableHeader>
          <TableColumn>Id</TableColumn>
          <TableColumn>Montant</TableColumn>
          <TableColumn>Date</TableColumn>
        </TableHeader>
        <TableBody>
          {paiements &&
            paiements.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{p.ref}</TableCell>
                <TableCell>{p.amount_text} €</TableCell>
                <TableCell>
                  {/* afficher la date et l'heure en francais */}
                  {new Date(p.date_p).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};
