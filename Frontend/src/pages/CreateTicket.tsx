import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, MessageSquare, Tag, Send, Paperclip, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CreateTicket() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Low',
    assignee: 'Unassigned',
    attachments: [] as string[]
  });
  const [uploading, setUploading] = useState(false);

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
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, response.data.publicUrl]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('Failed to upload file.'));
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be selected again if needed
      e.target.value = '';
    }
  };
  
  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/tickets`, formData);
      navigate('/');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert(t('Failed to create ticket. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        <Link to="/" className="p-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="flat-panel overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="customer_name" className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <User className="w-4 h-4 text-text-primary0" />
                {t('Customer Name')}
              </label>
              <input
                type="text"
                name="customer_name"
                id="customer_name"
                required
                placeholder={t('e.g. John Doe')}
                value={formData.customer_name}
                onChange={handleChange}
                className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="customer_email" className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Mail className="w-4 h-4 text-text-primary0" />
                {t('Email')}
              </label>
              <input
                type="email"
                name="customer_email"
                id="customer_email"
                required
                placeholder={t('john@example.com')}
                value={formData.customer_email}
                onChange={handleChange}
                className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium text-text-primary">
                {t('Priority')}
              </label>
              <select
                name="priority"
                id="priority"
                value={formData.priority}
                onChange={handleChange}
                className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm sm:text-base cursor-pointer"
              >
                <option value="Low">{t('Low')}</option>
                <option value="Med">{t('Med')}</option>
                <option value="High">{t('High')}</option>
                <option value="Urgent">{t('Urgent')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="assignee" className="flex items-center gap-2 text-sm font-medium text-text-primary">
                {t('Assignee')}
              </label>
              <select
                name="assignee"
                id="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm sm:text-base cursor-pointer"
              >
                <option value="Unassigned">{t('Unassigned')}</option>
                <option value="Sarah Lee">Sarah Lee</option>
                <option value="Alice Green">Alice Green</option>
                <option value="Admin User">Admin User</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <Tag className="w-4 h-4 text-text-primary0" />
              {t('Subject')}
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              required
              placeholder={t('Brief summary of the issue')}
              value={formData.subject}
              onChange={handleChange}
              className="flat-input block w-full rounded-lg py-2.5 px-3 text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <MessageSquare className="w-4 h-4 text-text-primary0" />
              {t('Description')}
            </label>
            <textarea
              name="description"
              id="description"
              rows={5}
              required
              placeholder={t('Please provide detailed information about the issue...')}
              value={formData.description}
              onChange={handleChange}
              className="flat-input block w-full rounded-lg py-3 px-3 text-sm sm:text-base resize-none"
            />
            
            <div className="mt-3">
              <label className="flex items-center gap-2 cursor-pointer w-fit text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                <Paperclip className="w-4 h-4" />
                {uploading ? t('Uploading...') : t('Attach File')}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
              
              {formData.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.attachments.map((url, idx) => {
                    const filename = url.split('/').pop()?.split('-').slice(1).join('-') || `Attachment ${idx + 1}`;
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-bg-secondary border border-border-subtle px-3 py-1.5 rounded-full text-xs">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="truncate max-w-[150px] hover:underline" title={filename}>{filename}</a>
                        <button type="button" onClick={() => removeAttachment(idx)} className="text-text-muted hover:text-status-danger">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border-subtle flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flat-button w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('Submit Ticket')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
