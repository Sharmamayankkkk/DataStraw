import { Router, Request, Response } from 'express';
import { supabase } from '../supabaseClient';
import crypto from 'crypto';

const router = Router();

// Helper to generate a random ticket ID
function generateTicketId() {
  return 'TKT-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// POST /api/tickets
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { customer_name, customer_email, subject, description, priority, assignee, attachments } = req.body;

    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticket_id = generateTicketId();

    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ticket_id,
          customer_name,
          customer_email,
          subject,
          description,
          priority: priority || 'Low',
          assignee: assignee || 'Unassigned',
          attachments: attachments || []
        },
      ])
      .select('ticket_id, created_at')
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tickets/stats
router.get('/stats', async (req: Request, res: Response): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('status, priority');

    if (error) throw error;

    const total = data.length;
    const open = data.filter(t => t.status === 'Open').length;
    const urgent = data.filter(t => t.priority === 'Urgent').length;
    const inProgress = data.filter(t => t.status === 'In Progress').length;

    return res.status(200).json({ total, open, urgent, inProgress });
  } catch (error: any) {
    console.error('Error fetching ticket stats:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tickets
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('tickets')
      .select('ticket_id, customer_name, subject, status, priority, assignee, created_at, updated_at, is_pinned')
      .order('is_pinned', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as string);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`customer_name.ilike.${searchTerm},customer_email.ilike.${searchTerm},subject.ilike.${searchTerm},description.ilike.${searchTerm},ticket_id.ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tickets/:ticket_id
router.get('/:ticket_id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { ticket_id } = req.params;

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticket_id)
      .single();

    if (ticketError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, note_text, attachments, created_at')
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true });

    if (notesError) throw notesError;

    return res.status(200).json({ ...ticket, notes });
  } catch (error: any) {
    console.error('Error fetching ticket details:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/tickets/:ticket_id
router.put('/:ticket_id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { ticket_id } = req.params;
    const { status, priority, assignee, notes, attachments, is_pinned } = req.body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (assignee) updates.assignee = assignee;
    if (is_pinned !== undefined) updates.is_pinned = is_pinned;

    // Update ticket if fields are provided
    if (status || priority || assignee || is_pinned !== undefined) {
      const { error: updateError } = await supabase
        .from('tickets')
        .update(updates)
        .eq('ticket_id', ticket_id);

      if (updateError) throw updateError;
    }

    // Add note if provided
    if (notes) {
      const { error: noteError } = await supabase
        .from('notes')
        .insert([{ 
          ticket_id, 
          note_text: notes,
          attachments: attachments || []
        }]);

      if (noteError) throw noteError;
    }

    return res.status(200).json({ success: true, updated_at: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/tickets/:ticket_id/notes/:note_id
router.delete('/:ticket_id/notes/:note_id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { ticket_id, note_id } = req.params;
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', note_id)
      .eq('ticket_id', ticket_id);

    if (error) throw error;
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/tickets/:ticket_id
router.delete('/:ticket_id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { ticket_id } = req.params;
    
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('ticket_id', ticket_id);

    if (error) throw error;
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
