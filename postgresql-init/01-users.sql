-- スーパーユーザー権限を持つユーザー作成（存在しない場合のみ）
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'root') THEN
    CREATE USER root WITH PASSWORD 'password' SUPERUSER;
  END IF;
END
$$;

-- アプリケーション用のユーザー作成（存在しない場合のみ）
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'appuser') THEN
    CREATE USER appuser WITH PASSWORD 'apppassword';
  END IF;
END
$$;

-- appuserにtestdbのアクセス権を付与
GRANT ALL PRIVILEGES ON DATABASE testdb TO appuser;

-- すべてのテーブル、シーケンス、関数への権限を付与
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO appuser;

-- 今後作成されるテーブル等への権限も自動的に付与
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO appuser;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO appuser;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON FUNCTIONS TO appuser;