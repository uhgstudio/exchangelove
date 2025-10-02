-- user_predictions 테이블 RLS 정책 업데이트
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own predictions" ON user_predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON user_predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON user_predictions;

-- 새로운 정책 생성 (모든 인증된 사용자가 CRUD 가능)
CREATE POLICY "Authenticated users can manage user_predictions" ON user_predictions
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
WHERE schemaname = 'public' AND tablename = 'user_predictions'
ORDER BY policyname;
