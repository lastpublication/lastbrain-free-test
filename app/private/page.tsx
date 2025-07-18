"use client";
import { Card, CardBody, Spinner, Tab, Tabs } from "@heroui/react";
import axios from "axios";
import { Field, Form } from "formik";
import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import CustomerForm from "./components/CustomerForm";

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
  const [projects, setProjects] = useState<[] | null>(null);
  const [customer, setCustomer] = useState<CustomerFormType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fetchInfo = async () => {
    setIsLoading(true);
    axios
      .get("/api/customer")
      .then((response) => {
        console.log("successfully:", response.data);
        setProjects(response.data.projects || []);
        setCustomer(response.data.customer || []);
        console.log("customer:", response);
        setIsLoading(false);
      })
      .catch((error) => {
        setProjects([]);
        setCustomer(null);
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
          <div className="w-full max-w-2xl mx-auto mt-5">
            <h1 className="text-2xl font-thin text-center text-foreground/50">
              Profil
            </h1>

            {customer && (
              <CustomerForm setCustomer={setCustomer} customer={customer} />
            )}
          </div>
        </Tab>
        <Tab key="contact" title="Contact">
          contact
        </Tab>
        <Tab key="project" title="Project">
          <Card className="w-full mt-5">
            <CardBody>
              Project
              <pre>{JSON.stringify(projects, null, 2)}</pre>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="payment" title="Paiement">
          <Card className="w-full mt-5">
            <CardBody>Paiement</CardBody>
          </Card>
        </Tab>
        <Tab key="stat" title="Stat">
          <Card className="w-full mt-5">
            <CardBody>Stat</CardBody>
          </Card>
        </Tab>
        <Tab key="message" title="Message">
          <Card className="w-full mt-5">
            <CardBody>Message</CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
