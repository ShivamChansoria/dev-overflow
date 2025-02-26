"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValue,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z, ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";
import Link from "next/link";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ sucess: boolean }>;
  formType: "SIGN_IN" | "SIGN_UP";
}
const AuthForm = ({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) => {
  // 1. Define your form.
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  //Creating the button type passing the button as Sign-in / Sign-up
  const buttonText = formType === "SIGN_IN" ? "Sign in" : "Sign Up";

  // 2. Define a submit handler.
  const handleSubmit: SubmitHandler<T> = async () => {};
  return (
    <Form {...form}>
      {buttonText}
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-6">
        {Object.keys(defaultValues).map((field) => (
          <FormField
            key={field}
            control={form.control}
            name={field as Path<T>}
            render={({ field }) => (
              <FormItem className="flex-col flex w-full gap-2.5">
                <FormLabel className="paragraph-medium text-dark-400_light700">
                  {field.name === "email"
                    ? "Email Address"
                    : field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type={field.name === "password" ? "password" : "text"}
                    placeholder={`Your ${field.name}`}
                    {...field}
                    className="paragraph-regular background-light-900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? buttonText === "Sign Up"
              ? "Signin Up..."
              : "Signinig In..."
            : buttonText}
        </Button>
        {formType === "SIGN_IN" ? (
          <p>
            {" "}
            Don't have an account?{" "}
            <Link
              href={ROUTES.SIGN_UP}
              className="paragraph-semibold primary-text-gredient"
            >
              {" "}
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link
              href={ROUTES.SIGN_IN}
              className="paragraph-semibold primary-text-gredient"
            >
              {" "}
              Sign In
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
};

export default AuthForm;
