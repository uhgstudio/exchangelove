-- RLS 정책 수정 스크립트
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can view seasons" ON seasons;
DROP POLICY IF EXISTS "Authenticated users can view participants" ON participants;
DROP POLICY IF EXISTS "Authenticated users can view episodes" ON episodes;
DROP POLICY IF EXISTS "Authenticated users can view couple_pairs" ON couple_pairs;
DROP POLICY IF EXISTS "Authenticated users can view agg_episodes" ON agg_episodes;

-- 새로운 정책 생성 (모든 인증된 사용자가 CRUD 가능)
-- 시즌 정책
CREATE POLICY "Authenticated users can manage seasons" ON seasons
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 출연자 정책  
CREATE POLICY "Authenticated users can manage participants" ON participants
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 회차 정책
CREATE POLICY "Authenticated users can manage episodes" ON episodes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 커플 정책
CREATE POLICY "Authenticated users can manage couple_pairs" ON couple_pairs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 집계 데이터 정책
CREATE POLICY "Authenticated users can manage agg_episodes" ON agg_episodes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 확인용 쿼리
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
