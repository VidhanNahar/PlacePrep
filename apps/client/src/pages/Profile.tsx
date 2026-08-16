import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ExperienceDTO } from '@placeprep/shared';
import { ExperienceCard } from '../components/experiences/ExperienceCard';
import { Button } from '../components/ui/Button';
import { User, GraduationCap, Building, ShieldCheck, Mail, Bookmark, PenSquare, Layers } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'bookmarks'>('submissions');
  const [userExperiences, setUserExperiences] = useState<ExperienceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      api.get(`/experiences?userId=${user.id}`)
        .then((res: any) => {
          if (res.success) setUserExperiences(res.data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Please sign in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Card Header */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-2xl font-bold text-indigo-300 flex-shrink-0 shadow-glow">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.fullName}</h1>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> {user.collegeName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Class of {user.graduationYear} ({user.branch})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300">
            Role: <strong>{user.role}</strong>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <PenSquare className="w-4 h-4" /> My Submitted Experiences
        </button>
      </div>

      {/* Tab content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : userExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 glass-panel rounded-xl border border-slate-800">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No interview experiences shared yet</h3>
          <p className="text-xs text-slate-400 mt-1">Help campus peers by documenting your placement rounds.</p>
        </div>
      )}
    </div>
  );
};
