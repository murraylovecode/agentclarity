-- Create enums
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE public.asset_type AS ENUM ('cash', 'public_equity', 'private_shares', 'fund', 'real_estate', 'crypto', 'vehicle', 'art_collectible', 'manual');
CREATE TYPE public.deal_status AS ENUM ('draft', 'analyzing', 'analyzed', 'archived');
CREATE TYPE public.email_template_type AS ENUM ('email_confirmation', 'welcome', 'password_reset', 'onboarding_reminder');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  ticker TEXT,
  current_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  quantity DECIMAL(18,8),
  cost_basis DECIMAL(18,2),
  acquisition_date DATE,
  liquidity_score INTEGER CHECK (liquidity_score >= 1 AND liquidity_score <= 5),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own assets" ON public.assets
  FOR ALL USING (auth.uid() = user_id);

-- Asset sources table
CREATE TABLE public.asset_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT,
  external_id TEXT,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.asset_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own asset sources" ON public.asset_sources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.assets WHERE assets.id = asset_sources.asset_id AND assets.user_id = auth.uid())
  );

-- Asset valuations table (historical)
CREATE TABLE public.asset_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  value DECIMAL(18,2) NOT NULL,
  valuation_date DATE NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.asset_valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own valuations" ON public.asset_valuations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.assets WHERE assets.id = asset_valuations.asset_id AND assets.user_id = auth.uid())
  );

-- Liabilities table
CREATE TABLE public.liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  current_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
  interest_rate DECIMAL(5,2),
  monthly_payment DECIMAL(18,2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own liabilities" ON public.liabilities
  FOR ALL USING (auth.uid() = user_id);

-- Deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(18,2),
  horizon_months INTEGER,
  liquidity_expectation TEXT,
  risk_level TEXT,
  description TEXT,
  external_links TEXT[],
  status deal_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deals" ON public.deals
  FOR ALL USING (auth.uid() = user_id);

-- Deal analyses table
CREATE TABLE public.deal_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  diversification_impact TEXT,
  risk_flags TEXT[],
  suggested_sizing TEXT,
  narrative TEXT,
  ai_model TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deal_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analyses" ON public.deal_analyses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.deals WHERE deals.id = deal_analyses.deal_id AND deals.user_id = auth.uid())
  );

-- Anonymized profiles for sharing
CREATE TABLE public.anonymized_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alias TEXT NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  allocation_ranges JSONB DEFAULT '{}',
  liquidity_profile JSONB DEFAULT '{}',
  risk_concentration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.anonymized_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own anonymized profiles" ON public.anonymized_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active profiles by share code" ON public.anonymized_profiles
  FOR SELECT USING (is_active = TRUE);

-- Comparisons table
CREATE TABLE public.comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anonymized_profile_id UUID REFERENCES public.anonymized_profiles(id) ON DELETE CASCADE NOT NULL,
  comparison_type TEXT DEFAULT 'peer',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own comparisons" ON public.comparisons
  FOR ALL USING (auth.uid() = user_id);

-- Email templates (admin managed)
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type email_template_type NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  delay_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can view enabled templates" ON public.email_templates
  FOR SELECT USING (is_enabled = TRUE);

-- Email events (logs)
CREATE TABLE public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type email_template_type,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email events" ON public.email_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Admin audit logs (immutable)
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert audit logs" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- Trigger for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON public.liabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_anonymized_profiles_updated_at BEFORE UPDATE ON public.anonymized_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed default email templates
INSERT INTO public.email_templates (template_type, subject, body_html, body_text) VALUES
  ('email_confirmation', 'Confirm your AgentVig.ai account', '<h1>Welcome to AgentVig.ai</h1><p>Please confirm your email address.</p>', 'Welcome to AgentVig.ai. Please confirm your email address.'),
  ('welcome', 'Welcome to AgentVig.ai', '<h1>Welcome!</h1><p>Your account is ready.</p>', 'Welcome! Your account is ready.'),
  ('password_reset', 'Reset your AgentVig.ai password', '<h1>Password Reset</h1><p>Click the link to reset your password.</p>', 'Click the link to reset your password.'),
  ('onboarding_reminder', 'Complete your AgentVig.ai setup', '<h1>Almost there!</h1><p>Complete your profile setup.</p>', 'Complete your profile setup.');