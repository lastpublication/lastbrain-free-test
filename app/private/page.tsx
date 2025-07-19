"use client";
import { Card, CardBody, Spinner, Tab, Tabs } from "@heroui/react";
import axios from "axios";
import { Field, Form } from "formik";
import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import CustomerForm from "./components/CustomerForm";
import { ProjectTab } from "./components/ProjectTab";

type CustomerFormType = {
  siret: string;
  vat_number: string;
  address: string;
  zip_code: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  industry: string;
  society: string;
  last_name: string;
  first_name: string;
  avatar: string;
  code_client: string;
  newsletter: boolean;
};
export default function Page() {
  const [projects, setProjects] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<[]>([]);
  const [avoirs, setAvoirs] = useState<[]>([]);
  const [customer, setCustomer] = useState<CustomerFormType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fetchInfo = async () => {
    setIsLoading(true);
    axios
      .get("/api/customer")
      .then((response) => {
        setProjects(response.data.projects || []);
        setCustomer(response.data.customer || []);
        setInvoices(response.data.invoices || []);
        setAvoirs(response.data.avoirs || []);
        console.log("customer:", response);
        setIsLoading(false);
      })
      .catch((error) => {
        setProjects([]);
        setAvoirs([]);
        setCustomer(null);
        setInvoices([]);
        setError(
          error.response.data.message || "Erreur lors de la récupération"
        );
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (projects) return;
    fetchInfo();
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner className="mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <TriangleAlert size={128} className="text-danger mb-4" />
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-danger font-bold">{error}</p>
      </div>
    );
  }
  return (
    <div className="mt-8 w-full ">
      <Tabs aria-label="Options" className="flex justify-center" size="lg">
        <Tab key="profil" title="Profil">
          <div className="w-full max-w-2xl mx-auto mt-10">
            {customer && (
              <CustomerForm setCustomer={setCustomer} customer={customer} />
            )}
          </div>
        </Tab>
        <Tab key="contact" title="Contact">
          contact
        </Tab>
        <Tab key="project" title="Project">
          <div className="w-full container mx-auto mt-10">
            <ProjectTab
              avoirs={avoirs}
              invoices={invoices}
              projects={projects}
              setProjects={setProjects}
            />
          </div>
        </Tab>
        <Tab key="payment" title="Paiement">
          <div className="w-full container mx-auto mt-10">
            <Card className="w-full ">
              <CardBody>Paiement</CardBody>
            </Card>
          </div>
        </Tab>
        <Tab key="stat" title="Stat">
          <div className="w-full container mx-auto mt-10">
            <Card className="w-full">
              <CardBody>Stat</CardBody>
            </Card>
          </div>
        </Tab>
        <Tab key="message" title="Message">
          <div className="w-full container mx-auto mt-10">
            <Card className="w-full">
              <CardBody>Message</CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
