import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <Layout title="Dashboard">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Welcome, Alex!</h2>
          <Button asChild>
            <Link to="/upload">
              <PlusCircle className="mr-2 h-4 w-4" /> Start New Run
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Runs</CardTitle>
              <CardDescription>Your most recent harmonization runs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent runs found.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Saved Mappings</CardTitle>
              <CardDescription>Your saved mapping configurations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No saved mappings found.</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Ready to harmonize your data?</h3>
            <p className="text-muted-foreground mb-4">
                Start a new run to upload, map, and validate your multiomic metadata.
            </p>
            <Button asChild size="lg">
                <Link to="/upload">
                <PlusCircle className="mr-2 h-4 w-4" /> Start New Run
                </Link>
            </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;