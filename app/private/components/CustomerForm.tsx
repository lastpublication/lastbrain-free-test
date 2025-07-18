import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Input,
  Button,
  Card,
  CardBody,
  Switch,
  Spinner,
  addToast,
} from "@heroui/react";
import { useEffect } from "react";
import axios from "axios";
import { Avatar } from "./Avatar";

const initialValues = {
  siret: "",
  vat_number: "",
  address: "",
  zip_code: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  industry: "",
  society: "",
  last_name: "",
  first_name: "",
  avatar: "",
  code_client: "",
  newsletter: false,
};

const validationSchema = Yup.object({
  siret: Yup.string().max(20),
  vat_number: Yup.string().max(20),
  address: Yup.string(),
  zip_code: Yup.string().max(10),
  city: Yup.string(),
  country: Yup.string(),
  phone: Yup.string().max(20),
  email: Yup.string().email("Email invalide"),
  website: Yup.string(),
  industry: Yup.string(),
  society: Yup.string(),
  last_name: Yup.string(),
  first_name: Yup.string(),

  code_client: Yup.string(),
  newsletter: Yup.boolean(),

  note: Yup.string(),
});

export default function CustomerForm({
  customer = initialValues,
  setCustomer,
}: {
  customer?: typeof initialValues;
  setCustomer: (customer: typeof initialValues) => void;
}) {
  // useEffect supprimé, Formik gère la mise à jour avec enableReinitialize

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner className="mb-4" />
      </div>
    );
  }
  return (
    <Card className="w-full mt-5 p-2 md:p-8">
      <CardBody>
        <Formik
          initialValues={customer}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log("Form submitted with values:", values);
            axios
              .put("/api/customer", values)
              .then((response) => {
                console.log("Form submitted successfully:", response.data);
                setCustomer(response.data);
                addToast({
                  title: "Succès",
                  description:
                    "Les informations du client ont été mises à jour.",
                  shouldShowTimeoutProgress: true,
                });
              })
              .catch((error) => {
                console.error("Error submitting form:", error);
              });
          }}
          enableReinitialize
        >
          {({ values, handleChange, errors, touched, submitCount }) => (
            <Form className="flex flex-col gap-4">
              <Avatar
                src={values.avatar}
                upload={(url: string) => (values.avatar = url)}
              />

              <Input
                name="code_client"
                readOnly
                className="cursor-not-allowed"
                label="Code client"
                value={values.code_client}
                onChange={handleChange}
                errorMessage={
                  touched.code_client && errors.code_client
                    ? errors.code_client
                    : ""
                }
              />
              <Input
                name="email"
                readOnly
                className="cursor-not-allowed"
                label="Email"
                value={values.email}
                onChange={handleChange}
                errorMessage={touched.email && errors.email ? errors.email : ""}
              />
              <Input
                name="society"
                label="Société"
                readOnly
                className="cursor-not-allowed"
                value={values.society}
                onChange={handleChange}
                errorMessage={
                  touched.society && errors.society ? errors.society : ""
                }
              />
              <Input
                name="last_name"
                label="Nom"
                value={values.last_name}
                onChange={handleChange}
                errorMessage={
                  touched.last_name && errors.last_name ? errors.last_name : ""
                }
              />
              <Input
                name="first_name"
                label="Prénom"
                value={values.first_name}
                onChange={handleChange}
                errorMessage={
                  touched.first_name && errors.first_name
                    ? errors.first_name
                    : ""
                }
              />
              <Input
                name="phone"
                label="Téléphone"
                value={values.phone}
                onChange={handleChange}
                errorMessage={touched.phone && errors.phone ? errors.phone : ""}
              />
              <Input
                name="address"
                label="Adresse"
                value={values.address}
                onChange={handleChange}
                errorMessage={
                  touched.address && errors.address ? errors.address : ""
                }
              />
              <Input
                name="zip_code"
                label="Code postal"
                value={values.zip_code}
                onChange={handleChange}
                errorMessage={
                  touched.zip_code && errors.zip_code ? errors.zip_code : ""
                }
              />
              <Input
                name="city"
                label="Ville"
                value={values.city}
                onChange={handleChange}
                errorMessage={touched.city && errors.city ? errors.city : ""}
              />
              <Input
                name="country"
                label="Pays"
                value={values.country}
                onChange={handleChange}
                errorMessage={
                  touched.country && errors.country ? errors.country : ""
                }
              />

              <Input
                name="siret"
                label="SIRET"
                value={values.siret}
                onChange={handleChange}
                errorMessage={touched.siret && errors.siret ? errors.siret : ""}
              />
              <Input
                name="vat_number"
                label="Numéro TVA"
                value={values.vat_number}
                onChange={handleChange}
                errorMessage={
                  touched.vat_number && errors.vat_number
                    ? errors.vat_number
                    : ""
                }
              />

              <Input
                name="website"
                label="Site web"
                value={values.website}
                onChange={handleChange}
                errorMessage={
                  touched.website && errors.website ? errors.website : ""
                }
              />
              <Input
                name="industry"
                label="Secteur"
                value={values.industry}
                onChange={handleChange}
                errorMessage={
                  touched.industry && errors.industry ? errors.industry : ""
                }
              />
              <div className=" flex items-center justify-center gap-8">
                <label htmlFor="newsletter">Newsletter</label>
                <Switch
                  name="newsletter"
                  color="success"
                  size="lg"
                  isSelected={values.newsletter}
                  onChange={handleChange}
                />
              </div>

              {/* <Input
                name="mp"
                label="MP"
                value={values.mp}
                onChange={handleChange}
                errorMessage={touched.mp && errors.mp ? errors.mp : ""}
              /> */}
              <Button
                type="submit"
                size="lg"
                color="success"
                className="w-full mt-8"
              >
                Enregistrer
              </Button>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
}
