import { Layout } from "@/components/Layout";
import { useNewRun } from "@/context/NewRunContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Download, ShieldAlert, Info } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const ValidationPage = () => {
  const { validationIssues, resetRun } = useNewRun();
  const navigate = useNavigate();

  const { blockers, warnings, infos } = useMemo(() => {
    const blockers = validationIssues.filter(i => i.severity === 'Blocker');
    const warnings = validationIssues.filter(i => i.severity === 'Warning');
    const infos = validationIssues.filter(i => i.severity === 'Info');
    return { blockers, warnings, infos };
  }, [validationIssues]);

  const handleDownloadReport = () => {
    const csv = Papa.unparse(validationIssues);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'validation_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewRun = () => {
    resetRun();
    navigate('/upload');
  }

  const isReadyForExport = blockers.length === 0;

  return (
    <Layout title="New Run: Validation Results">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blockers</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{blockers.length}</div>
              <p className="text-xs text-muted-foreground">Must be resolved before export</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warnings.length}</div>
              <p className="text-xs text-muted-foreground">Recommended to review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{infos.length}</div>
              <p className="text-xs text-muted-foreground">General information</p>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Readiness Gate</CardTitle>
                        <CardDescription>
                            {isReadyForExport 
                                ? "All critical issues resolved. Ready for export." 
                                : "Please resolve all 'Blocker' issues to enable export."}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadReport}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Report
                        </Button>
                        <Button disabled={!isReadyForExport}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Export Bundle
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Issues</CardTitle>
            <CardDescription>A detailed list of all issues found during the validation run.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationIssues.length > 0 ? validationIssues.map(issue => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Badge variant={issue.severity === 'Blocker' ? 'destructive' : issue.severity === 'Warning' ? 'secondary' : 'default'}>
                        {issue.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{issue.fileName}</TableCell>
                    <TableCell>{issue.rowIndex || 'N/A'}</TableCell>
                    <TableCell>{issue.columnName || 'N/A'}</TableCell>
                    <TableCell>{issue.description}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No issues found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button variant="secondary" onClick={handleNewRun}>Start a New Run</Button>
        </div>
      </div>
    </Layout>
  );
};

export default ValidationPage;