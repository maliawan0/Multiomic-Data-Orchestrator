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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { getRuns } from "@/lib/api";

const Dashboard = () => {
  const { savedMappings, deleteMapping } = useMappings();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setIsLoadingRuns(true);
        const runsData = await getRuns();
        setRuns(runsData);
      } catch (error) {
        console.error("Failed to fetch runs:", error);
        toast({
          title: "Error",
          description: "Failed to load recent runs.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRuns(false);
      }
    };

    fetchRuns();
  }, [toast]);

  const handleDelete = (id: string, name: string) => {
    deleteMapping(id);
    toast({
      title: "Mapping Deleted",
      description: `Configuration "${name}" has been deleted.`,
    });
  };

  const getStatusBadge = (status: string, blockers: number) => {
    if (status === "complete") {
      if (blockers === 0) {
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" /> Ready
          </Badge>
        );
      } else {
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" /> Has Blockers
          </Badge>
        );
      }
    } else if (status === "pending" || status === "running") {
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" /> {status === "pending" ? "Pending" : "Running"}
        </Badge>
      );
    } else if (status === "failed") {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" /> Failed
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get display name from user context
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <Layout title="Dashboard">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Welcome, {displayName}!</h2>
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
              {isLoadingRuns ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : runs.length > 0 ? (
                <ul className="space-y-2">
                  {runs.map((run) => (
                    <li
                      key={run.id}
                      className="p-3 rounded-md bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
                      onClick={() => navigate(`/validation?runId=${run.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(run.status, run.validation_summary?.blockers || 0)}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(run.created_at)}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            {run.files?.length || 0} file{run.files?.length !== 1 ? 's' : ''}
                          </p>
                          {run.status === "complete" && run.validation_summary && (
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              {run.validation_summary.blockers > 0 && (
                                <span className="text-destructive">
                                  {run.validation_summary.blockers} blocker{run.validation_summary.blockers !== 1 ? 's' : ''}
                                </span>
                              )}
                              {run.validation_summary.warnings > 0 && (
                                <span className="text-yellow-600">
                                  {run.validation_summary.warnings} warning{run.validation_summary.warnings !== 1 ? 's' : ''}
                                </span>
                              )}
                              {run.validation_summary.total === 0 && (
                                <span className="text-green-600">No issues</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent runs found.</p>
              )}
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