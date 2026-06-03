import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Survey from "@/pages/survey";
import Results from "@/pages/results";
import PreferencesSurvey from "@/pages/preferences-survey";
import Purchase from "@/pages/purchase";
import Dashboard from "@/pages/dashboard";
import PlanView from "@/pages/plan";
import NotFound from "@/pages/not-found";

export const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/survey" component={Survey} />
      <Route path="/results" component={Results} />
      <Route path="/survey/preferences" component={PreferencesSurvey} />
      <Route path="/plan/purchase" component={Purchase} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/plan/:planId" component={PlanView} />
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
