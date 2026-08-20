import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Ticket as TicketIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Ticket {
  ticket_id: string;
  subject: string;
  status: string;
  priority: string;
  updated_at: string;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'hi' ? hi : enUS;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail') || '';
  const currentUser = userEmail 
    ? userEmail.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') 
    : '';

  // Get user role
  const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
  const userMember = teamMembers.find((m: any) => m.email === userEmail);
  const isAgent = userMember?.role === 'Support Agent' || !userEmail.includes('admin');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const params = new URLSearchParams();
        if (isAgent && currentUser) {
          params.append('assignee', currentUser);
        }
        
        const response = await axios.get(`${API_URL}/tickets?${params.toString()}`);
        setTickets(response.data);
      } catch (error) {
        console.error('Failed to fetch tickets for analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [isAgent, currentUser]);

  // Compute Data for Status Chart
  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.keys(statusCounts).map(status => ({
    name: t(status),
    value: statusCounts[status]
  }));
  const STATUS_COLORS = ['var(--color-status-info)', 'var(--color-status-warning)', 'var(--color-status-success)']; // Open, In Progress, Closed

  // Compute Data for Priority Chart
  const priorityCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityData = [
    { name: t('Low'), count: priorityCounts['Low'] || 0, fill: 'var(--color-priority-low)' },
    { name: t('Med'), count: priorityCounts['Med'] || 0, fill: 'var(--color-priority-med)' },
    { name: t('High'), count: priorityCounts['High'] || 0, fill: 'var(--color-priority-high)' },
    { name: t('Urgent'), count: priorityCounts['Urgent'] || 0, fill: 'var(--color-priority-urgent)' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Pie Chart */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">{t('Tickets by Status')}</h2>
          <div className="h-[300px] w-full">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, t(name as string)]}
                    contentStyle={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-primary0">No data available</div>
            )}
          </div>
        </div>

        {/* Priority Bar Chart */}
        <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">{t('Tickets by Priority')}</h2>
          <div className="h-[300px] w-full">
            {tickets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
                  <YAxis stroke="var(--color-text-secondary)" allowDecimals={false} />
                  <Tooltip 
                    formatter={(value, name) => [value, t(name as string)]}
                    cursor={{ fill: 'var(--color-border-subtle)', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-text-primary)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                     {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-primary0">No data available</div>
            )}
          </div>
        </div>
        
      </div>

      {/* Recent Activity List */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
         <h2 className="text-lg font-semibold text-white mb-4">{t('Recently Updated Tickets')}</h2>
         <div className="divide-y divide-border-subtle">
            {tickets.slice(0, 5).map(ticket => (
               <div key={ticket.ticket_id} className="py-3 flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center shrink-0">
                     <TicketIcon className="w-4 h-4 text-brand-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-text-primary truncate">{ticket.subject}</p>
                     <p className="text-xs text-text-secondary mt-0.5">
                        {ticket.ticket_id} &middot; {t(ticket.status)} &middot; {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true, locale: dateLocale })}
                     </p>
                  </div>
               </div>
            ))}
            {tickets.length === 0 && (
               <p className="py-4 text-sm text-text-primary0">{t('No recent tickets.')}</p>
            )}
         </div>
      </div>
    </div>
  );
}
