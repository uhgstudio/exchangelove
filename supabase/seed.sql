-- 기본 데이터 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 시즌 생성
INSERT INTO seasons (title, code, start_date, end_date, is_active) VALUES
('환승연애4', 'EXCHANGE_LOVE_4', '2024-01-01', '2024-03-31', true);

-- 2. 회차 생성 (시즌 ID는 위에서 생성된 ID를 사용)
INSERT INTO episodes (season_id, number, title, open_at, close_at, status) VALUES
((SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), 1, '첫 만남', '2024-01-01T00:00:00Z', '2024-01-08T20:00:00Z', 'closed'),
((SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), 2, '첫 선택', '2024-01-08T21:00:00Z', '2024-01-15T20:00:00Z', 'closed'),
((SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), 3, '환승의 시작', '2024-01-15T21:00:00Z', '2024-01-22T20:00:00Z', 'open'),
((SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), 4, '새로운 만남', '2024-01-22T21:00:00Z', '2024-01-29T20:00:00Z', 'scheduled');

-- 3. 출연자 생성 (남성)
INSERT INTO participants (name, gender, season_id, image_url, is_active) VALUES
('김민수', 'M', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true),
('박지훈', 'M', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true),
('이준호', 'M', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true),
('최성민', 'M', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true);

-- 4. 출연자 생성 (여성)
INSERT INTO participants (name, gender, season_id, image_url, is_active) VALUES
('김지영', 'F', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true),
('박서연', 'F', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true),
('이하늘', 'F', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true),
('최유진', 'F', (SELECT id FROM seasons WHERE code = 'EXCHANGE_LOVE_4'), null, true);

-- 데이터 확인
SELECT 'Seasons' as table_name, count(*) as count FROM seasons
UNION ALL
SELECT 'Episodes' as table_name, count(*) as count FROM episodes
UNION ALL
SELECT 'Participants' as table_name, count(*) as count FROM participants;
