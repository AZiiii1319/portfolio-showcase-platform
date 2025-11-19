# Supabase Backend Setup

This directory contains the database schema, migrations, and configuration for the Portfolio Showcase Platform.

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Set up your environment variables in `.env.local`:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Run Migrations
Execute the migration files in order in your Supabase SQL editor:

1. `001_initial_schema.sql` - Creates the main tables (profiles, portfolios, interactions)
2. `002_rls_policies.sql` - Sets up Row Level Security policies
3. `003_functions_and_triggers.sql` - Creates database functions and triggers
4. `004_storage_setup.sql` - Sets up storage buckets and policies

### 3. Storage Configuration
The setup creates two storage buckets:
- `avatars` - For user profile pictures
- `portfolios` - For portfolio images

Both buckets are configured as public with appropriate RLS policies.

### 4. Authentication Setup
In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable email authentication
3. Configure email templates if needed
4. Set up any additional auth providers if required

## Database Schema

### Tables
- **profiles** - User profile information
- **portfolios** - User portfolio/artwork entries
- **interactions** - Likes and comments on portfolios

### Key Features
- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on user signup
- Automatic timestamp updates
- View count tracking
- Optimized queries with proper indexing

### Functions
- `handle_new_user()` - Creates profile when user signs up
- `handle_updated_at()` - Updates timestamp on record changes
- `increment_portfolio_views()` - Increments view count for portfolios
- `get_portfolio_with_stats()` - Returns portfolio with like/comment counts

## Security
- All tables have RLS policies
- Users can only modify their own data
- Portfolio owners can delete comments on their portfolios
- Storage buckets have appropriate access controls
- Public read access for viewing content