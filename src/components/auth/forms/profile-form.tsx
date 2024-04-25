"use client";

import { FormError } from "@/components/auth/forms/form-error";
import { FormSuccess } from "@/components/auth/forms/form-success";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import MultipleSelector, {
  type Option,
} from "@/components/ui/multiple-selector";
import { PasswordInput } from "@/components/ui/password-input";
import { useCurrentUser } from "@/hooks/user/use-current-user";
import { updateProfile } from "@/lib/auth/actions/update-profile";
import { userProfileParamsSchema, type UserRole } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { type z } from "zod";

interface ProfileFormProps {
  closeModal: () => void;
}

export function ProfileForm({ closeModal }: ProfileFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const user = useCurrentUser();

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  interface RoleOption extends Option {
    value: UserRole;
  }

  const rolesOptions: RoleOption[] = [
    { value: "RADIOLOGIST", label: "Radiólogo", disable: true, fixed: true },
    { value: "ML_ENGINEER", label: "Ingeniero ML" },
    { value: "ADMIN", label: "Administrador" },
  ];

  const form = useForm<z.infer<typeof userProfileParamsSchema>>({
    resolver: zodResolver(userProfileParamsSchema),
    defaultValues: {
      id: user?.id ?? "",
      name: user?.name ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      password: "",
      newPassword: "",
      confirmNewPassword: "",
      roles: user?.roles
        ? rolesOptions.filter((rolOption) =>
            user.roles.includes(rolOption.value),
          )
        : [],
    },
  });

  useEffect(() => {
    const resetPassword = () => {
      form.setValue("password", undefined);
      form.setValue("newPassword", undefined);
      form.setValue("confirmNewPassword", undefined);
    };

    if (!isOpen) {
      resetPassword();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof userProfileParamsSchema>) => {
    startTransition(() => {
      const roles = values.roles?.map((rolOption) => rolOption.value);

      updateProfile({ ...values, roles })
        .then(async (data) => {
          if (data.error) {
            setError(data.error);
            setSuccess(undefined);
          }
          if (data.success) {
            router.refresh();
            setSuccess(data.success);
            setError(undefined);
          }
        })
        .catch(() => {
          setSuccess(undefined);
          setError("Algo salio mal");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre(s)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Anita Maria"
                    disabled={isPending}
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido(s)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Muñoz" disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="correo_ejemplo@gmail.com"
                    type="email"
                    autoComplete="email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center space-x-4">
              <h4 className=" font-semibold">¿Deseas cambiar tu contraseña?</h4>
              <CollapsibleTrigger asChild>
                <Button variant={"ghost"}>
                  <span>{isOpen ? "No" : "Si"}</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="current-password"
                        placeholder="******"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="new-password"
                        placeholder="******"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="confirm-new-password"
                        placeholder="******"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>

          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={field.value}
                      onChange={field.onChange}
                      options={rolesOptions}
                      placeholder="Selecciona tus roles"
                      hidePlaceholderWhenSelected
                      inputProps={{ name: field.name }}
                      maxSelected={rolesOptions.length}
                      // emptyIndicator={
                      //   <p className="text-center leading-10 text-muted-foreground">
                      //     No existen roles con los criterios de busqueda
                      //   </p>
                      // }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant={"outline"}
            onClick={() => closeModal()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            // disabled={isCreating || isUpdating || !isValid}
            disabled={isPending}
          >
            {`Edita${isPending ? "ndo..." : "r"}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
