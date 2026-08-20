import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Edit2, Eye, Reply, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { hi, enUS } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Ticket {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: string;
  priority: string;
  assignee: string;
  updated_at: string;
  is_pinned?: boolean;
}

interface TicketStats {
  total: number;
  open: number;
  urgent: number;
  inProgress: number;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const { t } = useTranslation();
  let bgClass = "bg-priority-low-bg text-priority-low border border-priority-low/20"; // Low
  
  if (priority === 'Urgent') bgClass = "bg-priority-urgent-bg text-priority-urgent border border-priority-urgent/20";
  else if (priority === 'High') bgClass = "bg-priority-high-bg text-priority-high border border-priority-high/20";
  else if (priority === 'Med') bgClass = "bg-priority-med-bg text-priority-med border border-priority-med/20";

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgClass}`}>
      {t(priority)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  let bgClass = "bg-status-success-bg text-status-success border border-status-success/20"; // Resolved / Closed
  
  if (status === 'Open') bgClass = "bg-status-info-bg text-status-info border border-status-info/20";
  else if (status === 'In Progress') bgClass = "bg-status-warning-bg text-status-warning border border-status-warning/20";

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bgClass}`}>
      {t(status)}
    </span>
  );
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'hi' ? hi : enUS;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, urgent: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [search, statusFilter, priorityFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const [ticketsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/tickets?${params.toString()}`),
        axios.get(`${API_URL}/tickets/stats`)
      ]);

      setTickets(ticketsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header & Insights */}
      <div className="mb-6 w-full">
        {/* Insight Stats (matching Mockup) */}
        <div className="grid grid-cols-4 divide-x divide-border-subtle bg-bg-secondary/50 rounded-xl border border-border-subtle/50 p-2 w-full">
          <div className="px-2 py-2 text-center flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text-secondary mb-1 whitespace-nowrap">{t('Total Tickets')}</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="px-2 py-2 text-center flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text-secondary mb-1 whitespace-nowrap">{t('Open')}</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.open}</p>
          </div>
          <div className="px-2 py-2 text-center flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text-secondary mb-1 whitespace-nowrap">{t('Urgent')}</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.urgent}</p>
          </div>
          <div className="px-2 py-2 text-center flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-text-secondary mb-1 whitespace-nowrap">{t('In Progress')}</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{stats.inProgress}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-secondary p-3 rounded-t-xl border border-b-0 border-border-subtle">
         <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-secondary" />
            </div>
            <input
              type="text"
              placeholder={t('Search...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-bg-primary border border-border-subtle text-text-primary block w-full pl-9 pr-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-text-secondary transition-colors"
            />
          </div>
          
          <div className="flex w-full sm:w-auto items-center gap-3">
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-bg-primary border border-border-subtle text-text-primary text-sm rounded-lg focus:outline-none focus:border-text-secondary block w-full sm:w-auto px-3 py-1.5 transition-colors appearance-none"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
             >
               <option value="">{t('All Statuses')}</option>
               <option value="Open">{t('Open')}</option>
               <option value="In Progress">{t('In Progress')}</option>
               <option value="Resolved">{t('Resolved')}</option>
               <option value="Closed">{t('Closed')}</option>
             </select>
             
             <select 
               value={priorityFilter}
               onChange={(e) => setPriorityFilter(e.target.value)}
               className="bg-bg-primary border border-border-subtle text-text-primary text-sm rounded-lg focus:outline-none focus:border-text-secondary block w-full sm:w-auto px-3 py-1.5 transition-colors appearance-none"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
             >
               <option value="">{t('All Priorities')}</option>
               <option value="Low">{t('Low')}</option>
               <option value="Med">{t('Med')}</option>
               <option value="High">{t('High')}</option>
               <option value="Urgent">{t('Urgent')}</option>
             </select>
          </div>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-b-xl overflow-hidden mt-0">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Search className="w-8 h-8 text-text-secondary mb-4" />
            <h3 className="text-base font-medium text-text-primary mb-1">{t('No tickets found')}</h3>
            <p className="text-sm text-text-secondary">{t("We couldn't find any tickets matching your current filters.")}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider bg-bg-secondary border-b border-border-subtle">
                  <tr>
                    <th scope="col" className="px-6 py-4">{t('Ticket ID')}</th>
                    <th scope="col" className="px-6 py-4">{t('Subject')}</th>
                    <th scope="col" className="px-6 py-4">{t('Customer')}</th>
                    <th scope="col" className="px-6 py-4">{t('Priority')}</th>
                    <th scope="col" className="px-6 py-4">{t('Status')}</th>
                    <th scope="col" className="px-6 py-4">{t('Assignee')}</th>
                    <th scope="col" className="px-6 py-4">{t('Last Updated')}</th>
                    <th scope="col" className="px-6 py-4 text-center">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {tickets.map((ticket) => (
                    <tr key={ticket.ticket_id} className="hover:bg-bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                        <div className="flex items-center gap-2">
                          {ticket.is_pinned && <Pin className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
                          {ticket.ticket_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-primary">
                        <div className="max-w-[150px] lg:max-w-[200px] truncate" title={ticket.subject}>{ticket.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                        {ticket.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                        {t(ticket.assignee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">
                         {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true, locale: dateLocale })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         <div className="flex items-center justify-center gap-3 text-text-secondary">
                            <Link to={`/ticket/${ticket.ticket_id}`} className="hover:text-brand-secondary transition-colors" title={t('Edit')}>
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <Link to={`/ticket/${ticket.ticket_id}`} className="hover:text-brand-secondary transition-colors" title={t('View')}>
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link to={`/ticket/${ticket.ticket_id}`} className="hover:text-brand-secondary transition-colors" title={t('Reply')}>
                              <Reply className="w-4 h-4" />
                            </Link>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (No horizontal scroll) */}
            <div className="md:hidden divide-y divide-border-subtle">
              {tickets.map((ticket) => (
                <div key={ticket.ticket_id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      {ticket.is_pinned && <Pin className="w-3.5 h-3.5 text-brand-secondary fill-current" />}
                      <span className="text-text-primary text-sm font-medium">{ticket.ticket_id}</span>
                    </div>
                    <div className="flex gap-2">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-text-primary font-medium line-clamp-2 leading-tight">{ticket.subject}</h3>
                    <p className="text-text-secondary text-sm mt-1">{ticket.customer_name} &middot; {t(ticket.assignee)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-text-secondary">
                      {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true, locale: dateLocale })}
                    </span>
                    <Link 
                      to={`/ticket/${ticket.ticket_id}`} 
                      className="text-sm font-medium text-brand-secondary hover:text-brand-primary"
                    >
                      {t('View Details')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
