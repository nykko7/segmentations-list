"use client";
import { CardWrapper } from "./card-wrapper";

import type * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth/actions/login";
import { cn } from "@/lib/utils";
import { userLoginSchema } from "@/server/db/schema";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";

export const LoginForm = () => {
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "El email ya está registrado con una cuenta de Google o GitHub."
      : "";

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof userLoginSchema>>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof userLoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      await login(values, callbackUrl).then((data) => {
        if (data) {
          // setSuccess("Sesión iniciada correctamente. Redirigiendo...");
          setError(data.error);
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Bienvenid@ de nuevo"
      backButtonLabel="¿No tienes una cuenta?"
      backButtonHref="/auth/register"
      showSocial={false}
      isPending={isPending}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      {...field}
                      placeholder="correo_ejemplo@gmail.com"
                      autoComplete="email"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      {...field}
                      placeholder="******"
                      type="password"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* <Button
                    asChild
                    variant={"link"}
                    className="px-0 font-normal"
                    size={"sm"}
                  >
                    <Link href="/auth/reset-password">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </Button> */}
                </FormItem>
              )}
            />
          </div>
          <FormError message={error ?? urlError} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && (
              <Loader2 className={cn("mr-2 h-4 w-4 animate-spin")} />
            )}
            Iniciar sesión
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
