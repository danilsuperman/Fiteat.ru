import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export default function Login() {
  const loginMutation = useLogin();
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setToken(data.token);
        const redirectUrl = localStorage.getItem("fitit_redirect_after_login");
        if (redirectUrl) {
          localStorage.removeItem("fitit_redirect_after_login");
          setLocation(redirectUrl);
        } else {
          setLocation("/dashboard");
        }
      },
      onError: (error) => {
        toast({
          title: "Ошибка",
          description: error.message || "Неверный email или пароль",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">С возвращением</h1>
            <p className="text-muted-foreground mt-2">
              Войдите в аккаунт, чтобы продолжить работу над собой
            </p>
          </div>

          <div className="bg-card border shadow-sm rounded-xl p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Войти
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Нет аккаунта? </span>
              <Link href="/register" className="text-primary font-medium hover:underline">
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
