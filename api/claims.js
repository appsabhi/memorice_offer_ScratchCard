import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const { fullName, mobileNumber, email, offer, claimDateTime } = req.body || {};

    // Validate required fields
    if (!fullName || !mobileNumber || !offer) {
      return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
    }

    const trimmedName = fullName.trim();
    const trimmedMobile = mobileNumber.trim();
    const trimmedOffer = offer.trim();
    const cleanEmail = email ? email.trim() : 'Not Provided';
    const cleanClaimDate = claimDateTime ? new Date(claimDateTime) : new Date();

    if (!trimmedName || !trimmedMobile || !trimmedOffer) {
      return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
    }

    const client = await pool.connect();

    try {
      // First explicitly check if it exists (though UNIQUE constraint will also catch it)
      const checkResult = await client.query(
        'SELECT id FROM public.claims WHERE mobile_number = $1',
        [trimmedMobile]
      );

      if (checkResult.rows.length > 0) {
        client.release();
        return res.status(409).json({ success: false, error: 'ALREADY_CLAIMED' });
      }

      // Insert new claim
      await client.query(
        `INSERT INTO public.claims 
        (full_name, mobile_number, email, offer, claim_date_time, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())`,
        [trimmedName, trimmedMobile, cleanEmail, trimmedOffer, cleanClaimDate]
      );
      
      client.release();
      
      return res.status(200).json({ success: true });

    } catch (dbError) {
      client.release();
      
      // PostgreSQL unique violation error code
      if (dbError.code === '23505') {
        return res.status(409).json({ success: false, error: 'ALREADY_CLAIMED' });
      }
      
      throw dbError; // Rethrow to be caught by outer catch
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}
