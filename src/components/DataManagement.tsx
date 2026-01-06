import { useRef, useState } from 'react';
import {
  Upload,
  Trash2,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DataManagementProps {
  onExportJSON: () => string;
  onExportCSV: () => string;
  onImport: (data: string) => boolean;

  // 🔑 NEW
  onResetProfile: () => void;
  onClearAll: () => void;
}

export function DataManagement({
  onExportJSON,
  onExportCSV,
  onImport,
  onResetProfile,
  onClearAll,
}: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleExport = (data: string, type: string, ext: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-backup-${new Date()
      .toISOString()
      .split('T')[0]}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const success = onImport(ev.target?.result as string);
      setImportError(success ? null : 'Invalid backup file');
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="stat-label">Settings</h3>

      {/* 🔁 RESET PROFILE */}
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={onResetProfile}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset profile & goals
      </Button>

      {/* EXPORT */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() =>
            handleExport(onExportJSON(), 'application/json', 'json')
          }
        >
          <FileJson className="w-4 h-4 mr-2" />
          Export JSON
        </Button>

        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() =>
            handleExport(onExportCSV(), 'text/csv', 'csv')
          }
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* IMPORT */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <Button
        size="sm"
        variant="secondary"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Import backup
      </Button>
      {importError && (
        <p className="text-xs text-destructive">{importError}</p>
      )}

      {/* ☠️ CLEAR EVERYTHING */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete all data
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete everything?
            </DialogTitle>
            <DialogDescription>
              This permanently deletes your profile and all logs.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowClearDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClearAll();
                setShowClearDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
