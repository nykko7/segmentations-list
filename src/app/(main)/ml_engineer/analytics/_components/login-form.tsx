"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
// import { loginInKeycloak } from "@/lib/auth/keycloak/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useState } from "react";

export function LoginForm() {
  const [accessToken, setAccessToken] = useState<string>("");

  const registerSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    // await loginInKeycloak(values.username, values.password)
    //   .then((data) => {
    //     setAccessToken(data.access_token);
    //     console.log(data);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="my-2 border p-2">Access Token: {accessToken}</div>
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="username">Username</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  {...field}
                  placeholder="usuario_1"
                  autoComplete="username"
                  type="text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel htmlFor="password">Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    {...field}
                    placeholder="******"
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
            );
          }}
        />
        <Button type="submit">Login</Button>
      </form>
    </Form>
  );
}
