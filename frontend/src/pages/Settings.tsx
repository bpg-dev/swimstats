import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useSwimmer } from '@/hooks/useSwimmer';
import { SwimmerSetupForm } from '@/components/swimmer';
import { Loading } from '@/components/ui/Loading';
import { get } from '@/services/api';

/**
 * Settings page - user preferences and profile settings.
 */
export function Settings() {
  const { user, canWrite } = useAuthStore();
  const { data: swimmer, isLoading: swimmerLoading, refetch } = useSwimmer();
  const [isEditingSwimmer, setIsEditingSwimmer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
              <p className="text-sm text-slate-600">
                To import data, use the command-line scripts in the <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">scripts/</code> directory.
                See <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">IMPORT-GUIDE.md</code> for details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
