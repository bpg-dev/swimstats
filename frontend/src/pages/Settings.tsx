import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useSwimmer } from '@/hooks/useSwimmer';
import { SwimmerSetupForm } from '@/components/swimmer';
import { Loading } from '@/components/ui/Loading';

/**
 * Settings page - user preferences and profile settings.
 */
export function Settings() {
  const { user, canWrite } = useAuthStore();
  const { data: swimmer, isLoading: swimmerLoading, refetch } = useSwimmer();
  const [isEditingSwimmer, setIsEditingSwimmer] = useState(false);

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
    </div>
  );
}

export default Settings;
