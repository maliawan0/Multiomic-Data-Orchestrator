import { Layout } from "@/components/Layout";
import { useNewRun } from "@/context/NewRunContext";
import { schemaTemplates, SchemaTemplate } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { useMappings } from "@/context/MappingContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const MappingPage = () => {
  const { fileMappings, updateFileMapping, setFileColumns, runValidation, runStatus } = useNewRun();
  const { saveMapping } = useMappings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isParsing, setIsParsing] = useState(true);
  const [mappingName, setMappingName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    if (fileMappings.length === 0) {
      navigate('/upload');
      return;
    }

    const parseFiles = async () => {
      const promises = fileMappings.map(fm => {
        return new Promise<void>((resolve) => {
          if (fm.columns.length > 0) {
            resolve();
            return;
          }
          Papa.parse(fm.file, {
            header: true,
            preview: 1,
            complete: (results) => {
              setFileColumns(fm.file.name, results.meta.fields || []);
              resolve();
            },
          });
        });
      });
      await Promise.all(promises);
      setIsParsing(false);
    };

    parseFiles();
  }, [fileMappings, navigate, setFileColumns]);

  const handleTemplateChange = (fileName: string, templateId: string) => {
    updateFileMapping(fileName, { templateId, mapping: {} });
  };

  const handleColumnMapping = (fileName: string, canonicalField: string, csvColumn: string) => {
    const fileToUpdate = fileMappings.find(fm => fm.file.name === fileName);
    if (fileToUpdate) {
      const newMapping = { ...fileToUpdate.mapping, [canonicalField]: csvColumn };
      updateFileMapping(fileName, { mapping: newMapping });
    }
  };

  const getSelectedTemplate = (templateId?: string): SchemaTemplate | undefined => {
    return schemaTemplates.find(t => t.id === templateId);
  };

  const isMappingComplete = useMemo(() => {
    return fileMappings.every(fm => {
      const template = getSelectedTemplate(fm.templateId);
      if (!template) return false;
      return template.fields.every(field => !field.required || !!fm.mapping[field.name]);
    });
  }, [fileMappings]);

  const handleValidate = () => {
    runValidation();
    navigate('/validation');
  };

  const handleSaveMapping = () => {
    const templateMappings = fileMappings
      .filter(fm => fm.templateId)
      .map(fm => ({
        templateId: fm.templateId!,
        mapping: fm.mapping,
      }));
    
    saveMapping(mappingName, templateMappings);
    toast({
      title: "Mapping Saved",
      description: `Configuration "${mappingName}" has been saved successfully.`,
    });
    setMappingName("");
    setIsSaveDialogOpen(false);
  };

  if (isParsing) {
    return <Layout title="New Run: Map Metadata"><p>Parsing files...</p></Layout>;
  }

  return (
    <Layout title="New Run: Map Metadata">
      <div className="grid gap-6">
        {fileMappings.map(fm => {
          const selectedTemplate = getSelectedTemplate(fm.templateId);
          return (
            <Card key={fm.file.name}>
              <CardHeader>
                <CardTitle>{fm.file.name}</CardTitle>
                <CardDescription>Select a schema template and map the columns from your file to the canonical fields.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Schema Template</label>
                  <Select onValueChange={(value) => handleTemplateChange(fm.file.name, value)} value={fm.templateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {schemaTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} (v{template.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTemplate && (
                  <div>
                    <h3 className="font-semibold mb-2">Map Fields</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Canonical Field</TableHead>
                          <TableHead>CSV Column</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTemplate.fields.map(field => (
                          <TableRow key={field.name}>
                            <TableCell>
                              {field.name} {field.required && <Badge variant="destructive">Required</Badge>}
                              <p className="text-xs text-muted-foreground">{field.description}</p>
                            </TableCell>
                            <TableCell>
                              <Select onValueChange={(value) => handleColumnMapping(fm.file.name, field.name, value)} value={fm.mapping[field.name]}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a column..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {fm.columns.map(col => (
                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        <div className="flex justify-end gap-2">
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!isMappingComplete}>
                <Save className="mr-2 h-4 w-4" />
                Save Mapping
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Mapping Configuration</DialogTitle>
                <DialogDescription>
                  Give this mapping configuration a name for future use.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={mappingName}
                    onChange={(e) => setMappingName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSaveMapping} disabled={!mappingName}>Save configuration</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button size="lg" onClick={handleValidate} disabled={!isMappingComplete || runStatus === 'pending'}>
            {runStatus === 'pending' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Harmonize and Validate
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MappingPage;