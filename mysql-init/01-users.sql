-- 接続許可を設定
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- アプリケーション用のユーザーも作成
CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON testdb.* TO 'appuser'@'%';

-- 権限の反映
FLUSH PRIVILEGES;