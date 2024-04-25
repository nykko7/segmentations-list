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
import { PasswordInput } from "@/components/ui/password-input";
import { register } from "@/lib/auth/actions/register";
import { userRegisterSchema } from "@/server/db/schema";
import { useState, useTransition } from "react";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof userRegisterSchema>>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      lastName: "",
      confirmPassword: "",
      roles: ["RADIOLOGIST"],
    },
  });

  const onSubmit = (values: z.infer<typeof userRegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      await register(values).then((data) => {
        setSuccess(data.success);
        setError(data.error);
        if (data.success) form.reset();
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Crear una cuenta"
      backButtonLabel="¿Ya tienes una cuenta?"
      backButtonHref="/auth/login"
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
                      {...field}
                      placeholder="correo_ejemplo@gmail.com"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Anita María"
                      type="text"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="lastName">Apellido</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Muñoz"
                      type="text"
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
                    <PasswordInput
                      {...field}
                      placeholder="******"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Add confirm password */}
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">
                    Confirmar contraseña
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="******"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Crear una cuenta
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
