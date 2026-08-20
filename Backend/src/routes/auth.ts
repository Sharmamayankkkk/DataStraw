import { Router, Request, Response } from 'express';
import { supabase, supabaseAuth } from '../supabaseClient';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    
    // Get client IP using Express's built-in req.ip (respects 'trust proxy')
    let clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    // Normalize IPv6 loopback and IPv4-mapped IPv6 to standard IPv4 for readable logs
    if (clientIp === '::1') {
      clientIp = '127.0.0.1';
    } else if (typeof clientIp === 'string' && clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    } else if (Array.isArray(clientIp)) {
      clientIp = clientIp[0];
    }
    
    // Check login attempts table
    const { data: attemptRecord, error: attemptError } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('ip_address', clientIp)
      .single();

    if (attemptRecord && attemptRecord.is_banned) {
      return res.status(403).json({ error: 'Your IP is permanently banned due to too many failed login attempts.' });
    }

    // Attempt login with Supabase using the Auth client (so we don't mutate the global Service Role client)
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Login failed, increment attempt counter
      const currentAttempts = attemptRecord ? attemptRecord.attempts + 1 : 1;
      const isBanned = currentAttempts >= 5;

      await supabase
        .from('login_attempts')
        .upsert({
          ip_address: clientIp,
          attempts: currentAttempts,
          is_banned: isBanned,
          last_attempt_at: new Date().toISOString()
        });

      if (isBanned) {
        return res.status(403).json({ error: 'Your IP is permanently banned due to too many failed login attempts.' });
      }

      return res.status(401).json({ error: 'Invalid credentials. Attempts remaining: ' + (5 - currentAttempts) });
    }

    // Login successful, reset attempts
    await supabase
      .from('login_attempts')
      .upsert({
        ip_address: clientIp,
        attempts: 0,
        is_banned: false,
        last_attempt_at: new Date().toISOString()
      });

    return res.status(200).json({ session: authData.session, user: authData.user });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
