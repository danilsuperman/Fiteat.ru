import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Survey from "@/pages/survey";
import Result from "@/pages/results";
import NutritionSurvey from "@/pages/preferences-survey";
import Payment from "@/pages/purchase";
import Dashboard from "@/pages/dashboard";
import PlanView from "@/pages/plan";
import Calculator from "@/pages/calculator";
import Blog from "@/pages/blog";
import Admin from "@/pages/admin";
import ExtendedSurvey from "@/pages/extended-survey";
import NotFound from "@/pages/not-found";

export const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/survey/metabolism" component={Survey} />
      <Route path="/result" component={Result} />
      <Route path="/survey/nutrition" component={NutritionSurvey} />
      <Route path="/payment" component={Payment} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/plan/:planId" component={PlanView} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/blog" component={Blog} />
      <Route path="/admin" component={Admin} />
      <Route path="/survey/extended" component={ExtendedSurvey} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
