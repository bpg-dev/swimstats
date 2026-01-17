import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';

/**
 * Settings page - user preferences and profile settings.
 */
export function Settings() {
  const { user, canWrite } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your account and preferences.
        </p>
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
    </div>
  );
}

export default Settings;
