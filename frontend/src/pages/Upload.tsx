import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X } from "lucide-react";
import { useNewRun } from "@/context/NewRunContext";
import { useNavigate } from "react-router-dom";

const UploadPage = () => {
  const { files, addFiles, removeFile } = useNewRun();
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const csvFiles = newFiles.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
      addFiles(csvFiles);
    }
  };

  const handleProceed = () => {
    navigate('/mapping');
  };

  return (
    <Layout title="New Run: Upload Metadata">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV Files</CardTitle>
            <CardDescription>
              Upload one or more metadata files in CSV (UTF-8) format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV files only (UTF-8 encoded)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <Button size="lg" onClick={handleProceed}>Proceed to Mapping</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UploadPage;