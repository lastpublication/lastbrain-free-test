"use client";
import { addToast } from "@heroui/react";
import axios from "axios";
import { Form, Formik } from "formik";

import { useEffect, useState, useRef } from "react";

import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

import { LBButton, LBCard, LBInput } from "./ui/Primitives";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export const LoginForm = () => {
  const { user, setUser } = useAuth();
  const validationSchema = Yup.object({
    email: Yup.string().required("Email requis"),
    password: Yup.string().required("Mot de passe requis"),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<any>(null);
  const onSubmit = async (
    values: { email: string; password: string; captchaToken: string },
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

      if (response.data.profile) {
        setUser(response.data.profile);

        setIsLoading(false);
        // router.push("/private");
        // router.refresh();
      } else {
        addToast({
          title: "Erreur",
          description: "Email ou mot de passe incorrect",
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error: any) {
      // upstream details can be a string or an object like { error: '...' } or { message: '...' }
      const details = error?.response?.data?.details;
      let message = "Une erreur est survenue";

      if (details) {
        if (typeof details === "string") {
          message = details;
        } else if (typeof details === "object") {
          // prefer common fields
          message = details.error || details.message || JSON.stringify(details);
        }
      } else if (error?.response?.data) {
        message = error.response.data.message || message;
      } else if (error?.message) {
        message = error.message;
      }

      setFieldError("password", message);
      setIsLoading(false);

      // reset captcha token so user must re-validate
      setCaptchaToken(null);
      try {
        hcaptchaRef.current?.resetCaptcha?.();
        hcaptchaRef.current?.reset?.();
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/private");
    }
  }, [user]);
  return (
    <LBCard>
      <div className="flex flex-col items-center justify-center p-6">
        <Formik
          initialValues={{ email: "", password: "", captchaToken: "" }}
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
              <LBInput
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
              <LBInput
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
              <div className="flex justify-center my-4">
                <HCaptcha
                  ref={hcaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={(token) => {
                    console.log("Captcha verified:", token);
                    setCaptchaToken(token);
                    // also set Formik field value so onSubmit receives it
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    setFieldValue?.("captchaToken", token);
                  }}
                />
              </div>
              <LBButton
                type="submit"
                color="default"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                isDisabled={!captchaToken}
              >
                Se connecter
              </LBButton>
            </Form>
          )}
        </Formik>
      </div>
    </LBCard>
  );
};
