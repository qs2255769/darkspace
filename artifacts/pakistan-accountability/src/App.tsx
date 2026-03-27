import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import Databases from "@/pages/databases";
import Officials from "@/pages/officials";
import OfficialDetail from "@/pages/official-detail";
import RiskScores from "@/pages/risk-scores";
import Alerts from "@/pages/alerts";
import Parties from "@/pages/parties";
import Toshakhana from "@/pages/toshakhana";
import ScraperAdmin from "@/pages/scraper";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/parties" component={Parties} />
        <Route path="/officials" component={Officials} />
        <Route path="/officials/:id" component={OfficialDetail} />
        <Route path="/risk-scores" component={RiskScores} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/toshakhana" component={Toshakhana} />
        <Route path="/scrapers" component={ScraperAdmin} />
        <Route path="/databases" component={Databases} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
