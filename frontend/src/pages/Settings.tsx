import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useSwimmer } from '@/hooks/useSwimmer';
import { SwimmerSetupForm } from '@/components/swimmer';
import { Loading } from '@/components/ui/Loading';
import { get, post } from '@/services/api';

/**
 * Settings page - user preferences and profile settings.
 */
interface ImportPreview {
  will_replace_swimmer: boolean;
  current_meets_count: number;
  current_times_count: number;
  current_standards_count: number;
  new_meets_count: number;
  new_times_count: number;
  new_standards_count: number;
}

export function Settings() {
  const { user, canWrite } = useAuthStore();
  const { data: swimmer, isLoading: swimmerLoading, refetch } = useSwimmer();
  const [isEditingSwimmer, setIsEditingSwimmer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importData, setImportData] = useState<unknown | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await get<unknown>('/v1/data/export');

      // Create a blob and download it
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swimstats-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      setErrorMessage('Failed to export data. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);

      // Call preview endpoint
      const preview = await post<ImportPreview>('/v1/data/import/preview', data);
      setImportPreview(preview);
      setImportData(data);
    } catch (error) {
      console.error('Failed to preview import:', error);
      setErrorMessage('Failed to read or preview import file. Please check the file format.');
      setShowErrorDialog(true);
      setImportPreview(null);
      setImportData(null);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!importData) return;

    try {
      setIsImporting(true);
      await post('/v1/data/import', { data: importData, confirmed: true });
      setImportPreview(null);
      setImportData(null);
      setShowSuccessDialog(true);
      refetch(); // Refresh swimmer data
    } catch (error) {
      console.error('Failed to import data:', error);
      setErrorMessage('Failed to import data. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setImportData(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your account, swimmer profile, and preferences.
        </p>
      </div>

      {/* Swimmer Profile Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Swimmer Profile</h2>
        {swimmerLoading ? (
          <Card>
            <CardContent className="py-8">
              <Loading />
            </CardContent>
          </Card>
        ) : isEditingSwimmer || !swimmer ? (
          <div className="max-w-xl">
            <SwimmerSetupForm 
              initialData={swimmer || undefined}
              onSuccess={() => {
                setIsEditingSwimmer(false);
                refetch();
              }}
              onCancel={swimmer ? () => setIsEditingSwimmer(false) : undefined}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {swimmer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{swimmer.name}</div>
                    <div className="text-sm text-slate-500">
                      {swimmer.current_age} years old • {swimmer.current_age_group} • {swimmer.gender}
                    </div>
                    <div className="text-sm text-slate-500">
                      Born: {new Date(swimmer.birth_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {canWrite() && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingSwimmer(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Email</label>
                <p className="text-slate-900">{user?.email || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Name</label>
                <p className="text-slate-900">{user?.name || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Access Level</label>
                <p className="text-slate-900">
                  {canWrite() ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Full Access
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      View Only
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <p>Additional preferences coming soon.</p>
              <p className="text-sm mt-2">
                Configure &ldquo;almost there&rdquo; threshold and other settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-2">Export Data</h3>
              <p className="text-sm text-slate-600 mb-4">
                Download all your swimmer data, meets, times, and custom standards as a JSON file.
                This backup can be imported later to restore your data.
              </p>
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Data
                  </>
                )}
              </Button>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-2">Import Data</h3>
              <p className="text-sm text-slate-600 mb-4">
                Import a previously exported JSON file. This will <strong>replace</strong> the data sections present in the file.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={isImporting || !canWrite()}
                className="hidden"
                id="import-file-input"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting || !canWrite()}
                variant="outline"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Select Import File
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      {importPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-lg w-full mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">Confirm Data Import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-700">
                  This import will <strong>replace</strong> the following data:
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-2 text-sm">
                  {importPreview.will_replace_swimmer && (
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-amber-900">
                        <strong>Swimmer profile</strong> will be replaced
                      </span>
                    </div>
                  )}

                  {importPreview.new_meets_count > 0 && (
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-amber-900">
                        <strong>{importPreview.current_meets_count} existing meets</strong> and <strong>{importPreview.current_times_count} times</strong> will be deleted
                        <br />
                        <strong>{importPreview.new_meets_count} new meets</strong> and <strong>{importPreview.new_times_count} times</strong> will be imported
                      </div>
                    </div>
                  )}

                  {importPreview.new_standards_count > 0 && (
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-amber-900">
                        <strong>{importPreview.current_standards_count} existing custom standards</strong> will be deleted
                        <br />
                        <strong>{importPreview.new_standards_count} new standards</strong> will be imported
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-sm text-red-700 font-medium">
                  This action cannot be undone. Are you sure you want to continue?
                </p>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelImport}
                    disabled={isImporting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isImporting ? 'Importing...' : 'Confirm Import'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Import Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-700">
                  Data imported successfully!
                </p>
                <div className="flex justify-end">
                  <Button onClick={() => setShowSuccessDialog(false)}>
                    OK
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-700">
                  {errorMessage}
                </p>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowErrorDialog(false);
                      setErrorMessage('');
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Settings;
