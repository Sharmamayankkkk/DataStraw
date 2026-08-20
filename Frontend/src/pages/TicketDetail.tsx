import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, Clock, PlayCircle, CheckCircle2, User, Mail, Calendar, ChevronDown, MessageSquare, Trash2, Pin, Paperclip, X } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Note {
  id: string;
  note_text: string;
  created_at: string;
  attachments?: string[];
}

interface Ticket {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  created_at: string;
  is_pinned?: boolean;
  attachments?: string[];
  notes: Note[];
}

const StatusIcon = ({ status, className }: { status: string, className?: string }) => {
  switch (status) {
    case 'Open': return <Clock className={className} />;
    case 'In Progress': return <PlayCircle className={className} />;
    case 'Closed': return <CheckCircle2 className={className} />;
    default: return null;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  
  if (status === 'Open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold bg-status-info-bg text-status-info border-status-info/20 whitespace-nowrap">
        <StatusIcon status={status} className="w-3.5 h-3.5" />
        {t('Open')}
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold bg-status-warning-bg text-status-warning border-status-warning/20 whitespace-nowrap">
        <StatusIcon status={status} className="w-3.5 h-3.5" />
        {t('In Progress')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold bg-status-success-bg text-status-success border-status-success/20 whitespace-nowrap">
      <StatusIcon status={status} className="w-3.5 h-3.5" />
      {t('Closed')}
    </span>
  );
};


export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('Admin');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const name = userEmail.split('@')[0];
      setCurrentUser(name.charAt(0).toUpperCase() + name.slice(1));
    }
    
    const storedTeam = localStorage.getItem('teamMembers');
    if (storedTeam) {
      setTeamMembers(JSON.parse(storedTeam));
    } else {
      setTeamMembers([
        { name: 'Admin User', email: 'admin@support.com', role: 'Administrator' },
        { name: 'Sarah Lee', email: 'sarah.lee@support.com', role: 'Support Agent' },
        { name: 'Alice Green', email: 'alice.green@support.com', role: 'Support Agent' },
      ]);
    }

    fetchTicket();
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`${API_URL}/tickets/${id}`);
      setTicket(response.data);
      setStatus(response.data.status);
      setPriority(response.data.priority || 'Low');
      setAssignee(response.data.assignee || 'Unassigned');
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!status && !newNote.trim() && !priority && !assignee) return;
    
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/tickets/${id}`, {
        status: status !== ticket?.status ? status : undefined,
        priority: priority !== ticket?.priority ? priority : undefined,
        assignee: assignee !== ticket?.assignee ? assignee : undefined,
        notes: newNote.trim() ? JSON.stringify({ author: currentUser, text: newNote.trim() }) : undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });
      setNewNote('');
      setAttachments([]);
      fetchTicket();
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert(t('Failed to update ticket.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinTicket = async () => {
    if (!ticket) return;
    try {
      await axios.put(`${API_URL}/tickets/${id}`, { is_pinned: !ticket.is_pinned });
      fetchTicket();
    } catch (error) {
      console.error('Failed to pin ticket:', error);
      alert(t('Failed to pin ticket.'));
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm(t('Are you sure you want to delete this ticket?'))) return;
    try {
      await axios.delete(`${API_URL}/tickets/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert(t('Failed to delete ticket.'));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm(t('Are you sure you want to delete this note?'))) return;
    try {
      await axios.delete(`${API_URL}/tickets/${id}/notes/${noteId}`);
      fetchTicket();
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert(t('Failed to delete note.'));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const response = await axios.post(`${API_URL}/upload`, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
        
      setAttachments(prev => [...prev, response.data.publicUrl]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('Failed to upload file.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-secondary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 sm:py-20 flat-panel max-w-lg mx-auto m-4">
        <h3 className="text-lg font-medium text-text-primary mb-2">{t('Ticket not found')}</h3>
        <p className="text-sm text-text-secondary mb-6">{t('The ticket you are looking for does not exist.')}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-brand-secondary font-medium hover:text-brand-primary">
          <ArrowLeft className="w-4 h-4" /> {t('Back to Tickets')}
        </Link>
      </div>
    );
  }

  const statusOptions = [
    { value: 'Open', label: 'Open', icon: <Clock className="w-4 h-4 text-status-warning" /> },
    { value: 'In Progress', label: 'In Progress', icon: <PlayCircle className="w-4 h-4 text-brand-secondary" /> },
    { value: 'Closed', label: 'Closed', icon: <CheckCircle2 className="w-4 h-4 text-status-success" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Link to="/" className="mt-1 sm:mt-0 p-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <StatusBadge status={ticket.status} />
             <span className="text-xs sm:text-sm text-text-secondary flex items-center gap-1.5">
               <Calendar className="w-3.5 h-3.5" />
               {format(new Date(ticket.created_at), "MMM d, yyyy")}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePinTicket}
            className={`p-2 rounded-lg border transition-colors ${ticket.is_pinned ? 'bg-brand-primary/20 text-brand-secondary border-brand-primary/30' : 'bg-bg-secondary text-text-secondary border-border-subtle hover:text-text-primary'}`}
            title={ticket.is_pinned ? t('Unpin Ticket') : t('Pin Ticket')}
          >
            <Pin className={`w-4 h-4 ${ticket.is_pinned ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleDeleteTicket}
            className="p-2 bg-bg-secondary border border-border-subtle rounded-lg text-status-danger hover:bg-status-danger-bg transition-colors"
            title={t('Delete Ticket')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <div className="flat-panel overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight mb-6">{ticket.subject}</h2>
              <div className="bg-bg-primary/50 p-4 sm:p-6 rounded border border-border-subtle">
                <p className="text-sm sm:text-base text-text-primary whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </p>
              </div>
              
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    {t('Attachments')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.attachments.map((url, idx) => {
                      const filename = url.split('/').pop()?.split('-').slice(1).join('-') || `Attachment ${idx + 1}`;
                      return (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-bg-secondary border border-border-subtle px-3 py-1.5 rounded-full text-xs hover:bg-bg-primary transition-colors">
                          <Paperclip className="w-3 h-3 text-text-muted" />
                          <span className="truncate max-w-[200px] text-text-primary hover:underline">{filename}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="flat-panel overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border-subtle bg-bg-secondary/50">
              <h3 className="text-base font-medium text-text-primary flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-text-secondary" />
                {t('Notes')} ({ticket.notes.length})
              </h3>
            </div>
            <div className="divide-y divide-border-subtle/50">
              {ticket.notes && ticket.notes.length > 0 ? (
                ticket.notes.map((note) => {
                  let author = 'Unknown';
                  let parsedNote = note.note_text;
                  try {
                    const data = JSON.parse(note.note_text);
                    if (data.author && data.text) {
                      author = data.author;
                      parsedNote = data.text;
                    }
                  } catch (e) {
                    author = 'Unknown';
                  }
                  
                  return (
                    <div key={note.id} className="p-4 sm:p-5 bg-bg-secondary">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded bg-border-subtle flex items-center justify-center">
                            <span className="text-xs font-bold text-text-primary uppercase">{author.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="bg-bg-primary/50 p-3 sm:p-4 rounded border border-border-subtle">
                            <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{parsedNote}</p>
                            
                            {note.attachments && note.attachments.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border-subtle/50 flex flex-wrap gap-2">
                                {note.attachments.map((url, idx) => {
                                  const filename = url.split('/').pop()?.split('-').slice(1).join('-') || `Attachment ${idx + 1}`;
                                  return (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-bg-secondary border border-border-subtle px-2 py-1 rounded text-[10px] hover:bg-bg-primary transition-colors">
                                      <Paperclip className="w-2.5 h-2.5 text-text-muted" />
                                      <span className="truncate max-w-[150px] text-text-primary hover:underline">{filename}</span>
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2 ml-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-text-secondary">{author}</span>
                              <span className="text-xs font-medium text-text-muted">
                                &middot; {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            {author === currentUser && (
                              <button 
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-xs text-text-muted hover:text-status-danger transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                {t('Delete')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 sm:p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-bg-primary/50 border border-border-subtle text-text-primary0 flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-text-secondary font-medium">{t('No notes have been added yet.')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="flat-panel p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">{t('Customer Info')}</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-bg-primary/50 border border-border-subtle rounded text-text-secondary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-0.5">{t('Customer Name')}</p>
                  <p className="font-medium text-text-primary text-sm break-words">{ticket.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-bg-primary/50 border border-border-subtle rounded text-text-secondary">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-text-secondary mb-0.5">{t('Email')}</p>
                  <a href={`mailto:${ticket.customer_email}`} className="font-medium text-brand-secondary hover:text-brand-primary hover:underline transition-colors block truncate text-sm">
                    {ticket.customer_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Update Section */}
          <div className="flat-panel p-5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">{t('Update Status')}</h3>
            
            <div className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">{t('Status')}</label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flat-input flex items-center justify-between w-full rounded-lg py-2.5 px-3 text-sm text-left"
                >
                  <span className="truncate flex items-center gap-2">
                    {statusOptions.find(opt => opt.value === status)?.icon}
                    {t(status || 'Select Status')}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-text-primary0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-bg-secondary border border-border-subtle rounded-lg shadow-lg py-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatus(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-border-subtle text-text-primary text-sm"
                      >
                        {option.icon}
                        {t(option.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t('Priority')}
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm cursor-pointer"
                >
                  <option value="Low">{t('Low')}</option>
                  <option value="Med">{t('Med')}</option>
                  <option value="High">{t('High')}</option>
                  <option value="Urgent">{t('Urgent')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="assignee" className="block text-xs font-medium text-text-secondary mb-1.5">
                  {t('Assignee')}
                </label>
                <select
                  id="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm cursor-pointer"
                >
                  <option value="Unassigned">{t('Unassigned')}</option>
                  {teamMembers.map(member => (
                    <option key={member.name} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">{t('Add Note')}</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="flat-input block w-full rounded-lg py-3 px-3 text-sm resize-none mb-3"
                  placeholder={t('Type your note here...')}
                />
                
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer w-fit text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />
                    {uploading ? t('Uploading...') : t('Attach File')}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachments.map((url, idx) => {
                        const filename = url.split('/').pop()?.split('-').slice(1).join('-') || `Attachment ${idx + 1}`;
                        return (
                          <div key={idx} className="flex items-center gap-1.5 bg-bg-secondary border border-border-subtle px-2 py-1 rounded text-[10px]">
                            <span className="truncate max-w-[120px]" title={filename}>{filename}</span>
                            <button type="button" onClick={() => removeAttachment(idx)} className="text-text-muted hover:text-status-danger">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <button
                onClick={handleUpdate}
                disabled={submitting || (status === ticket.status && priority === ticket.priority && assignee === ticket.assignee && !newNote.trim() && attachments.length === 0)}
                className="flat-button w-full flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('Save')}
                  </>
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
