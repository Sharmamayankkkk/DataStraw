import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Plus, X } from 'lucide-react';

const DEFAULT_TEAM = [
  { name: 'Admin User', email: 'admin@support.com', role: 'Administrator' },
  { name: 'Sarah Lee', email: 'sarah.lee@support.com', role: 'Support Agent' },
  { name: 'Alice Green', email: 'alice.green@support.com', role: 'Support Agent' },
];

export default function Team() {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState(DEFAULT_TEAM);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Support Agent');

  useEffect(() => {
    const stored = localStorage.getItem('teamMembers');
    if (stored) {
      setTeamMembers(JSON.parse(stored));
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    const newMember = { name: newName, email: newEmail, role: newRole };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    localStorage.setItem('teamMembers', JSON.stringify(updated));
    setNewName('');
    setNewEmail('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('Team Members')}</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flat-button flex items-center gap-2"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? t('Cancel') : t('Add Team Mate')}
        </button>
      </div>

      {isAdding && (
        <div className="flat-panel p-6">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">{t('Name')}</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="flat-input block w-full rounded-lg py-2 px-3 text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">{t('Email')}</label>
              <input required value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" className="flat-input block w-full rounded-lg py-2 px-3 text-sm" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">{t('Role')}</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="flat-input block w-full rounded-lg py-2 px-3 text-sm cursor-pointer">
                <option value="Support Agent">{t('Support Agent')}</option>
                <option value="Administrator">{t('Administrator')}</option>
              </select>
            </div>
            <div>
              <button type="submit" className="flat-button w-full py-2">{t('Save')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, i) => (
          <div key={i} className="bg-bg-secondary border border-border-subtle rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-border-subtle rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">{member.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-info-bg text-brand-secondary border border-brand-primary mt-2">
              {member.role}
            </span>
            <div className="mt-4 flex items-center gap-2 text-text-secondary text-sm">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${member.email}`} className="hover:text-brand-secondary transition-colors">{member.email}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
