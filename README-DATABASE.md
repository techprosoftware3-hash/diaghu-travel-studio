# Database Setup Guide - DIAGHU Asesor Migratorio

## Overview
This project uses Supabase (PostgreSQL) as the database with direct SQL queries (no ORM).

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/log in and create a new project
3. Wait for the project to be ready (2-3 minutes)
4. Copy your project URL and anon key from Settings > API

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Migrations

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration
5. Repeat with `supabase/migrations/002_admin_user.sql`

#### Option B: Using Supabase CLI
1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Run migrations:
```bash
supabase db push
```

### 5. Set Admin Password
After running the admin user migration, you need to set a secure password:

```javascript
// Run this in Node.js to generate a bcrypt hash
const bcrypt = require('bcryptjs');
const password = 'your_secure_password';
const hash = bcrypt.hashSync(password, 12);
console.log(hash);
```

Then update the `002_admin_user.sql` file with the generated hash and re-run the migration, or update directly in the Supabase dashboard:

```sql
UPDATE users 
SET password_hash = '$2b$12$your_generated_hash_here' 
WHERE email = 'admin@diaghu.com';
```

### 6. Configure Auth (Optional)
If you want to use Supabase Auth:

1. Enable Authentication in Supabase Dashboard > Authentication
2. Configure email templates
3. Set up social providers if needed

## Database Schema

### Tables

#### users
- User accounts with roles (admin, staff, client)
- Stores authentication credentials and profile info

#### pre_consultations
- Pre-consultation form submissions
- Linked to users (optional, allows anonymous submissions)

#### appointments
- Appointment requests
- Status tracking (pending, confirmed, completed, cancelled)

#### destinations
- Destination countries/regions
- Multi-language support (fr, es, ht)

#### services
- Service offerings
- Multi-language descriptions

### Security
- Row Level Security (RLS) enabled on all tables
- Admins and staff can view all data
- Clients can only view their own data
- Public read access for destinations and services

## API Usage Examples

### Create Pre-consultation
```typescript
import { supabase } from '@/supabase/client';

const { data, error } = await supabase
  .from('pre_consultations')
  .insert({
    full_name: 'John Doe',
    email: 'john@example.com',
    whatsapp: '+1234567890',
    destination_country: 'France',
    service_type: 'tourist_visa',
    message: 'I need help with tourist visa'
  });
```

### Create Appointment
```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    full_name: 'John Doe',
    contact: '+1234567890',
    country: 'Haiti',
    service_type: 'Visas',
    preferred_date: '2024-03-15',
    message: 'Need consultation'
  });
```

### Get Services
```typescript
const { data: services } = await supabase
  .from('services')
  .select('*')
  .order('order_index');
```

### Get Destinations
```typescript
const { data: destinations } = await supabase
  .from('destinations')
  .select('*');
```

## Important Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Change default admin password** immediately after setup
3. **Use RLS policies** - They protect your data at the database level
4. **Backup regularly** - Supabase provides automated backups
5. **Monitor usage** - Check Supabase dashboard for performance metrics

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key in `.env`
- Check that your project is active in Supabase dashboard
- Ensure your IP is not blocked (if using IP restrictions)

### RLS Policy Errors
- Make sure migrations have been run
- Check that RLS is enabled on tables
- Verify user authentication state

### Migration Failures
- Check for syntax errors in SQL
- Ensure you have proper permissions
- Try running migrations individually

## Support
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://supabase.com/discord
