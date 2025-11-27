import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMappings } from "@/context/MappingContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { savedMappings, deleteMapping } = useMappings();
  const { toast } = useToast();

  const handleDelete = (id: string, name: string) => {
    deleteMapping(id);
    toast({
      title: "Mapping Deleted",
      description: `Configuration "${name}" has been deleted.`,
    });
  };

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
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Saved Mappings</CardTitle>
              <CardDescription>Your saved mapping configurations for reuse.</CardDescription>
            </CardHeader>
            <CardContent>
              {savedMappings.length > 0 ? (
                <ul className="space-y-2">
                  {savedMappings.map(mapping => (
                    <li key={mapping.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                      <div>
                        <p className="font-medium">{mapping.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Saved on {new Date(mapping.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the "{mapping.name}" mapping configuration.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(mapping.id, mapping.name)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No saved mappings found.</p>
              )}
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