-- 환승연애4 X예측 데이터베이스 스키마

-- 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 시즌 테이블
CREATE TABLE seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 출연자 테이블
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  image_url TEXT,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회차 테이블
CREATE TABLE episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title VARCHAR(100),
  open_at TIMESTAMP WITH TIME ZONE,
  close_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(season_id, number)
);

-- 커플 조합 테이블 (공식 결과 포함)
CREATE TABLE couple_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  male_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  female_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  is_official_result BOOLEAN DEFAULT false,
  decided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(episode_id, male_id, female_id)
);

-- 사용자 예측 테이블
CREATE TABLE user_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  pairs JSONB NOT NULL, -- [{"maleId": "uuid", "femaleId": "uuid"}]
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  UNIQUE(user_id, episode_id, version)
);

-- 사용자 점수 테이블
CREATE TABLE user_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank_cache INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- 회차별 집계 테이블
CREATE TABLE agg_episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  pair_pick_counts JSONB, -- {"maleId-femaleId": count}
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(episode_id)
);

-- 인덱스 생성
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_participants_season ON participants(season_id);
CREATE INDEX idx_episodes_season ON episodes(season_id);
CREATE INDEX idx_episodes_status ON episodes(status);
CREATE INDEX idx_couple_pairs_episode ON couple_pairs(episode_id);
CREATE INDEX idx_user_predictions_user_episode ON user_predictions(user_id, episode_id);
CREATE INDEX idx_user_scores_user ON user_scores(user_id);
CREATE INDEX idx_user_scores_episode ON user_scores(episode_id);

-- RLS (Row Level Security) 정책
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agg_episodes ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 예측 데이터는 자신의 것만 조회/수정 가능
CREATE POLICY "Users can view own predictions" ON user_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictions" ON user_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON user_predictions FOR UPDATE USING (auth.uid() = user_id);

-- 점수 데이터는 자신의 것만 조회 가능
CREATE POLICY "Users can view own scores" ON user_scores FOR SELECT USING (auth.uid() = user_id);

-- 공개 데이터는 모든 인증된 사용자가 조회 가능
CREATE POLICY "Authenticated users can view seasons" ON seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view participants" ON participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view episodes" ON episodes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view couple_pairs" ON couple_pairs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view agg_episodes" ON agg_episodes FOR SELECT TO authenticated USING (true);

-- 관리자 정책 (추후 구현)
-- CREATE POLICY "Admins can manage all data" ON ... FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
