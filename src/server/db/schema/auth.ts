// export type UserRoles = "USER" | "ADMIN" | "RADIOLOGIST" | "ML_ENGINEER";

import { relations } from "drizzle-orm";
import { index, json, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createTable } from "../utils";

export type UserRoles = "ADMIN" | "RADIOLOGIST" | "ML_ENGINEER";

export const UserRolesLabel: Record<UserRoles, string> = {
  ADMIN: "Administrador",
  RADIOLOGIST: "Radiólogo",
  ML_ENGINEER: "Ingeniero de ML",
};

// const rolesSchema = z.enum(["ADMIN", "RADIOLOGIST", "ML_ENGINEER"]);
const rolesSchema = z.enum<UserRoles, readonly [UserRoles, ...UserRoles[]]>([
  "ADMIN",
  "ML_ENGINEER",
  "RADIOLOGIST",
]);

const rolesParams = z.object({
  label: z.string(),
  value: rolesSchema,
  disable: z.boolean().optional(),
  fixed: z.boolean().optional(),
});

export const users = createTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    lastName: varchar("lastName", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),

    password: varchar("password", { length: 255 }),

    roles: json("roles")
      .$type<UserRoles[]>()
      .notNull()
      .default(["RADIOLOGIST"]),
    keycloakId: varchar("keycloak_id", { length: 255 }).notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("email_idx").on(t.email),
  }),
);

// export const usersRelations = relations(users, ({ many }) => ({
//   accounts: many(keys),
// }));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const keys = createTable("key", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: varchar("user_id", {
    length: 15,
  }).notNull(),

  // Required for Lucia Auth even if you don't use username/password auth
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});

export const keysRelations = relations(keys, ({ one }) => ({
  user: one(users, { fields: [keys.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    keycloak: json("keycloak").notNull().default({}),
  },
  (t) => ({
    userIdx: index("user_idx").on(t.userId),
  }),
);

export const userLoginSchema = z.object({
  email: z.string().email("Debes ingresar un correo válido"),
  password: z.string().min(1, "Debes ingresar una contraseña"),
});

// const emailDomainValidation = (email: string): boolean => {
//   return email.endsWith("@gmail.com");
// };

export const userRegisterParamsSchema = z
  .object({
    email: z.string().email("Debes ingresar un correo válido"),
    // .refine(emailDomainValidation, {
    //   message: "Debes ingresar un correo de Gmail (@gmail.com)",
    // }),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    name: z.string().min(1, "Debes ingresar un nombre"),
    lastName: z.string().min(1, "Debes ingresar un apellido"),

    roles: z.array(rolesParams).min(1, "Debes seleccionar al menos un rol"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export const userRegisterSchema = z
  .object({
    email: z.string().email("Debes ingresar un correo válido"),
    // .refine(emailDomainValidation, {
    //   message: "Debes ingresar un correo de Gmail (@gmail.com)",
    // }),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    name: z.string().min(1, "Debes ingresar un nombre"),
    lastName: z.string().min(1, "Debes ingresar un apellido"),

    roles: z.array(rolesSchema).min(1, "Debes seleccionar al menos un rol"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export const userResetPasswordSchema = z.object({
  email: z.string().email("Debes ingresar un correo válido"),
  // .refine(emailDomainValidation, {
  //   message: "Debes ingresar un correo de Gmail (@gmail.com)",
  // }),
});

export const userNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

export const userProfileBaseSchema = z.object({
  id: z.string(),
  name: z.optional(z.string()),
  lastName: z.optional(z.string()),
  roles: z.array(rolesSchema).min(1, "Debes seleccionar al menos un rol"),
  email: z.optional(z.string().email("Debes ingresar un correo válido")),
  password: z.optional(z.string().min(6, "Debe tener al menos 6 caracteres")),
  newPassword: z.optional(
    z.string().min(6, "Debe tener al menos 6 caracteres"),
  ),
  confirmNewPassword: z.optional(
    z.string().min(6, "Debe tener al menos 6 caracteres"),
  ),
});

export const userProfileParamsSchema = userProfileBaseSchema
  .merge(
    z.object({
      roles: z.array(rolesParams).min(1, "Debes seleccionar al menos un rol"),
    }),
  )
  .superRefine(({ password, newPassword, confirmNewPassword, roles }, ctx) => {
    if (password && !newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Si quieres cambiar tu contraseña, debes ingresar una nueva",
        path: ["newPassword"],
      });
    }

    if (!password && newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Debes ingresar tu contraseña actual",
        path: ["password"],
      });
    }

    if (password && newPassword && password === newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "La nueva contraseña debe ser diferente a la anterior",
        path: ["newPassword"],
      });
    }

    if (
      newPassword &&
      confirmNewPassword &&
      newPassword !== confirmNewPassword
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmNewPassword"],
      });
    }
  });

export const userProfileSchema = userProfileBaseSchema
  .merge(
    z.object({
      id: z.string(),
      roles: z.array(rolesSchema).min(1, "Debes seleccionar al menos un rol"),
    }),
  )
  .superRefine(({ password, newPassword, confirmNewPassword }, ctx) => {
    if (password && !newPassword) {
      return false;
    }

    if (!password && newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Debes ingresar tu contraseña actual",
        path: ["password"],
      });
    }

    if (password && newPassword && password === newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "La nueva contraseña debe ser diferente a la anterior",
        path: ["newPassword"],
      });
    }

    if (
      newPassword &&
      confirmNewPassword &&
      newPassword !== confirmNewPassword
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Las contraseñas no coinciden",
        path: ["confirmNewPassword"],
      });
    }
  });

export type updateUserSchema = z.infer<typeof userProfileSchema>;
export type updateUserParamsSchema = z.infer<typeof userProfileParamsSchema>;

export const userIdSchema = userProfileBaseSchema.pick({ id: true });
