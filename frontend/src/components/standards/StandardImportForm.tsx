import { useState, useRef } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorBanner } from '@/components/ui';
import { useImportFromJSON } from '@/hooks/useStandards';
import { JSONFileInput, JSONImportResult } from '@/types/standard';

interface StandardImportFormProps {
  onSuccess?: (result: JSONImportResult) => void;
  onCancel: () => void;
}

export function StandardImportForm({ onSuccess, onCancel }: StandardImportFormProps) {
  const [preview, setPreview] = useState<JSONFileInput | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<JSONImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportFromJSON();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setParseError(null);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text) as JSONFileInput;

      // Basic validation
      if (!data.course_type || !data.gender || !data.standards || !data.times) {
        throw new Error('Invalid JSON format: missing required fields');
      }

      setPreview(data);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse JSON file');
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    try {
      const importResult = await importMutation.mutateAsync(preview);
      setResult(importResult);
      onSuccess?.(importResult);
    } catch {
      // Error is handled by mutation
    }
  };

  const standardCount = preview ? Object.keys(preview.standards).length : 0;
  const eventCount = preview ? Object.keys(preview.times).length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Standards from JSON</CardTitle>
      </CardHeader>
      <CardContent>
        {/* File input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select JSON File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
            />
          </div>

          {/* Format help - collapsible */}
          <details className="bg-slate-50 rounded-lg">
            <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
              JSON Format Reference
            </summary>
            <div className="px-4 pb-4 text-xs text-slate-600 space-y-3">
              <div>
                <p className="font-medium text-slate-700 mb-1">Required fields:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>
                    <code className="bg-slate-200 px-1 rounded">course_type</code>: "25m" or "50m"
                  </li>
                  <li>
                    <code className="bg-slate-200 px-1 rounded">gender</code>: "female" or "male"
                  </li>
                  <li>
                    <code className="bg-slate-200 px-1 rounded">standards</code>: object with
                    standard codes as keys
                  </li>
                  <li>
                    <code className="bg-slate-200 px-1 rounded">age_groups</code>: array of age
                    group codes
                  </li>
                  <li>
                    <code className="bg-slate-200 px-1 rounded">times</code>: nested object (event →
                    age_group → standard_code → time)
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">Example:</p>
                <pre className="bg-slate-200 p-2 rounded text-[10px] overflow-x-auto whitespace-pre">
                  {`{
  "course_type": "25m",
  "gender": "female",
  "standards": {
    "OSC": { "name": "Ontario Swimming Championships" },
    "OAG": { "name": "Ontario Age Group", "description": "Age group times" }
  },
  "age_groups": ["10U", "11-12", "13-14", "15-17", "OPEN"],
  "times": {
    "50FR": {
      "10U": { "OSC": "32.50", "OAG": "35.00" },
      "11-12": { "OSC": "30.00", "OAG": "32.50" }
    },
    "100FR": {
      "10U": { "OSC": "1:12.00", "OAG": "1:18.00" }
    }
  }
}`}
                </pre>
              </div>
              <p className="text-slate-500">
                Time format: "M:SS.HH" or "SS.HH". Use{' '}
                <code className="bg-slate-200 px-1 rounded">null</code> for missing times. Optional{' '}
                <code className="bg-slate-200 px-1 rounded">source</code>/
                <code className="bg-slate-200 px-1 rounded">season</code> fields auto-generate
                names.
              </p>
            </div>
          </details>

          {parseError && <ErrorBanner message={parseError} />}

          {importMutation.error && (
            <ErrorBanner message={importMutation.error.message || 'Failed to import standards'} />
          )}

          {/* Preview */}
          {preview && !result && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-slate-900">Preview</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>
                  <strong>Source:</strong> {preview.source} {preview.season}
                </p>
                <p>
                  <strong>Course:</strong>{' '}
                  {preview.course_type === '25m' ? 'Short Course (25m)' : 'Long Course (50m)'}
                </p>
                <p>
                  <strong>Gender:</strong> {preview.gender === 'female' ? 'Female' : 'Male'}
                </p>
                <p>
                  <strong>Standards to import:</strong> {standardCount} (
                  {Object.keys(preview.standards).join(', ')})
                </p>
                <p>
                  <strong>Events:</strong> {eventCount}
                </p>
                <p>
                  <strong>Age groups:</strong> {preview.age_groups?.join(', ') || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className={`rounded-lg p-4 space-y-2 ${
                result.imported > 0 ? 'bg-green-50' : 'bg-amber-50'
              }`}
            >
              <h4 className="font-medium text-slate-900">Import Complete</h4>
              <div className="text-sm space-y-1">
                <p className="text-green-700">
                  <strong>Imported:</strong> {result.imported} standard(s)
                </p>
                {result.skipped > 0 && (
                  <p className="text-amber-700">
                    <strong>Skipped:</strong> {result.skipped} standard(s)
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-amber-700 font-medium">Warnings:</p>
                    <ul className="list-disc list-inside text-amber-600 text-xs mt-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li>...and {result.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onCancel}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {preview && !result && (
              <Button onClick={handleImport} disabled={importMutation.isPending}>
                {importMutation.isPending ? 'Importing...' : `Import ${standardCount} Standard(s)`}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StandardImportForm;
