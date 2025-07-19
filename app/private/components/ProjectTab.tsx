"use client";
import {
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { Check, X } from "lucide-react";

export const ProjectTab = ({
  projects,
  invoices,
  avoirs,
  setProjects,
}: {
  projects: any[];

  invoices: [];
  avoirs: [];
  setProjects: (projects: any[]) => void;
}) => {
  return (
    <>
      {projects.length > 0 ? (
        <Table selectionMode="single">
          <TableHeader>
            <TableColumn>Devis</TableColumn>
            <TableColumn>Commande</TableColumn>
            <TableColumn align="end">Facture</TableColumn>
            <TableColumn align="end">Avoir</TableColumn>
          </TableHeader>
          <TableBody>
            {projects.map((p: any, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  {p.propal?.ref || <X size={24} className="text-danger" />}
                </TableCell>
                <TableCell>
                  <div className="flex  gap-5  items-end justify-end">
                    <span>
                      {p.order?.ref || <X size={24} className="text-danger" />}
                    </span>
                    <span className="text-muted">
                      {p.order?.amount_ttc.toFixed(2)} €
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col  items-end justify-end">
                    {invoices
                      .filter((i: any) => i.project_id === p.id)
                      .map((invoice: any) => (
                        <div
                          key={invoice.id}
                          className="flex items-center gap-2"
                        >
                          <span className="text-muted"> {invoice.ref}</span>{" "}
                          <span>{invoice.amount_ttc.toFixed(2)} €</span>
                          <div>
                            {invoice.status === "paid" ? (
                              <Tooltip content="Payé">
                                <Check size={24} className="text-success" />
                              </Tooltip>
                            ) : (
                              <Tooltip content="Non payé">
                                <X size={24} className="text-danger" />
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col  items-end justify-end">
                    {avoirs
                      .filter((i: any) => i.project_id === p.id)
                      .map((avoir: any) => (
                        <div key={avoir.id} className="flex items-center gap-2">
                          <span className="text-muted"> {avoir.ref}</span>{" "}
                          <span>{avoir.amount_ttc.toFixed(2)} €</span>
                          <div>
                            {avoir.status === "payed" ? (
                              <Tooltip content="Payé">
                                <Check size={24} className="text-success" />
                              </Tooltip>
                            ) : (
                              <Tooltip content="Non payé">
                                <X size={24} className="text-danger" />
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center">Aucun projet trouvé.</p>
      )}
    </>
  );
};
