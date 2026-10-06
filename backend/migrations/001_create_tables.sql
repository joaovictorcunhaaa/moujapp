-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  weight NUMERIC(5, 2),
  height NUMERIC(5, 2),

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  medication_type VARCHAR(100),

  -- Preferences
  theme VARCHAR(50) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- ===== DOSES TABLE =====
CREATE TABLE IF NOT EXISTS public.doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE CASCADE,

  -- Dose data
  dateISO TIMESTAMP WITH TIME ZONE NOT NULL,
  dosageMg NUMERIC(4, 2) NOT NULL,
  medication VARCHAR(100) NOT NULL,
  site VARCHAR(100),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_dosage CHECK (dosageMg > 0 AND dosageMg <= 10)
);

-- ===== LIFESTYLE DATA TABLE =====
CREATE TABLE IF NOT EXISTS public.lifestyle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users ON DELETE CASCADE,

  -- Activity
  activity_level VARCHAR(50),
  calories_goal NUMERIC(5, 0),
  water_goal_ml NUMERIC(5, 0),

  -- Weight tracking
  current_weight NUMERIC(5, 2),
  weight_loss_speed VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== WEIGHT HISTORY TABLE =====
CREATE TABLE IF NOT EXISTS public.weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE CASCADE,

  date_iso TIMESTAMP WITH TIME ZONE NOT NULL,
  weight_kg NUMERIC(5, 2) NOT NULL,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_weight_per_day UNIQUE(user_id, date_iso)
);

-- ===== SYNC LOGS TABLE (para rastreamento de sincronização) =====
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users ON DELETE CASCADE,

  device_id VARCHAR(255),
  action VARCHAR(50),
  entity_type VARCHAR(50),
  entity_count NUMERIC(5, 0),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== INDICES =====
CREATE INDEX IF NOT EXISTS idx_doses_user_id ON public.doses(user_id);
CREATE INDEX IF NOT EXISTS idx_doses_date ON public.doses(dateISO DESC);
CREATE INDEX IF NOT EXISTS idx_doses_user_date ON public.doses(user_id, dateISO DESC);

CREATE INDEX IF NOT EXISTS idx_lifestyle_user_id ON public.lifestyle(user_id);

CREATE INDEX IF NOT EXISTS idx_weight_history_user_id ON public.weight_history(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_history_date ON public.weight_history(date_iso DESC);
CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON public.weight_history(user_id, date_iso DESC);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);

-- ===== ENABLE RLS (Row Level Security) =====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- Users: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Doses: Usuários podem ver/editar apenas suas próprias doses
CREATE POLICY "Users can view their own doses"
  ON public.doses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doses"
  ON public.doses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doses"
  ON public.doses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own doses"
  ON public.doses FOR DELETE
  USING (auth.uid() = user_id);

-- Lifestyle: Usuários podem ver/editar apenas seus dados
CREATE POLICY "Users can view their own lifestyle"
  ON public.lifestyle FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lifestyle"
  ON public.lifestyle FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lifestyle"
  ON public.lifestyle FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Weight history: Mesmas políticas
CREATE POLICY "Users can view their own weight history"
  ON public.weight_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight history"
  ON public.weight_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight history"
  ON public.weight_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight history"
  ON public.weight_history FOR DELETE
  USING (auth.uid() = user_id);

-- Sync logs: Apenas para logging
CREATE POLICY "Users can view their own sync logs"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON public.sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
