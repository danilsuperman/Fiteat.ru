import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout";
import { useRegister, useSubmitBasicSurvey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export default function Register() {
  const registerMutation = useRegister();
  const submitSurveyMutation = useSubmitBasicSurvey();
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        setToken(data.token);
        
        // If we have saved survey data, submit it now
        const savedSurveyStr = localStorage.getItem("fitit_pending_survey_1");
        if (savedSurveyStr) {
          try {
            const surveyData = JSON.parse(savedSurveyStr);
            submitSurveyMutation.mutate({ data: surveyData }, {
              onSuccess: () => {
                localStorage.removeItem("fitit_pending_survey_1");
                setLocation("/results");
              },
              onError: () => {
                // Ignore error, just redirect to dashboard or results
                setLocation("/results");
              }
            });
          } catch (e) {
            setLocation("/dashboard");
          }
        } else {
          const redirectUrl = localStorage.getItem("fitit_redirect_after_login");
          if (redirectUrl) {
            localStorage.removeItem("fitit_redirect_after_login");
            setLocation(redirectUrl);
          } else {
            setLocation("/dashboard");
          }
        }
      },
      onError: (error) => {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось зарегистрироваться",
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
            <h1 className="text-3xl font-bold tracking-tight">Регистрация</h1>
            <p className="text-muted-foreground mt-2">
              Создайте аккаунт, чтобы сохранить ваши результаты
            </p>
          </div>

          <div className="bg-card border shadow-sm rounded-xl p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя</FormLabel>
                      <FormControl>
                        <Input placeholder="Иван Иванов" {...field} />
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

                <Button type="submit" className="w-full" disabled={registerMutation.isPending || submitSurveyMutation.isPending}>
                  {(registerMutation.isPending || submitSurveyMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать аккаунт
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Уже есть аккаунт? </span>
              <Link href="/login" className="text-primary font-medium hover:underline">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
