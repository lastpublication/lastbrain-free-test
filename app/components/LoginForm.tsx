"use client";
import { Button, Card, CardBody, Input } from "@heroui/react";
import axios from "axios";
import { Form, Formik } from "formik";
import { Triangle, TriangleAlert } from "lucide-react";
import { useState } from "react";

import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
export const LoginForm = () => {
  const { setUser } = useAuth();
  const validationSchema = Yup.object({
    email: Yup.string().required("Email requis"),
    password: Yup.string().required("Mot de passe requis"),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (
    values: { email: string; password: string },
    {
      setFieldValue,
      setFieldError,
    }: {
      setFieldValue: (field: string, value: any) => void;
      setFieldError: (field: string, message: string) => void;
    }
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth", values, {
        withCredentials: true,
      });
      // Stocke l'utilisateur dans le localStorage
      if (response.data) {
        setUser(response.data);
        router.push("/private");
      }
    } catch (error: any) {
      setFieldError(
        "password",
        error.response?.data?.details || "Une erreur est survenue"
      );
      setIsLoading(false);
    }
  };
  return (
    <Card className="w-full mt-5">
      <CardBody className="flex flex-col items-center justify-center p-6">
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({
            values,
            handleChange,
            errors,
            touched,
            submitCount,
            setFieldValue,
          }) => (
            <Form className=" w-full">
              <Input
                size="lg"
                name="email"
                type="text"
                placeholder="Email"
                label="Email *"
                className="mb-4"
                isInvalid={Boolean(
                  (touched.email || submitCount > 0) && errors.email
                )}
                errorMessage={
                  ((touched.email || submitCount > 0) && errors.email) || ""
                }
                value={values.email}
                onChange={handleChange}
              />
              <Input
                size="lg"
                type="password"
                name="password"
                placeholder="Mot de passe"
                label="Mot de passe *"
                className="mb-4"
                isInvalid={Boolean(
                  (touched.password || submitCount > 0) && errors.password
                )}
                errorMessage={
                  ((touched.password || submitCount > 0) && errors.password) ||
                  ""
                }
                value={values.password}
                onChange={handleChange}
              />

              <Button
                variant="solid"
                type="submit"
                color="success"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Se connecter
              </Button>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
};
