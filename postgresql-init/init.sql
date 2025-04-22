-- 注意: PostgreSQLではデータベースはすでに作成されているので、USE文は不要です

-- ユーザーテーブルの作成
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- updated_atを自動更新するための関数とトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 住所テーブルの作成
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  prefecture VARCHAR(20) NOT NULL,
  city VARCHAR(50) NOT NULL,
  street_address VARCHAR(100) NOT NULL,
  building VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 商品カテゴリテーブル
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  parent_id INTEGER,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- 商品テーブル
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- productsのupdated_atを自動更新するトリガー
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ENUMタイプの作成（PostgreSQLでのENUM実装）
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'canceled');

-- 注文テーブル
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address_id INTEGER NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE RESTRICT
);

-- 注文詳細テーブル
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- サンプルデータの挿入
-- ユーザーデータ
INSERT INTO users (username, email, password_hash, is_active) VALUES
('yamada_taro', 'yamada@example.com', '$2a$12$1234567890123456789012', true),
('tanaka_hanako', 'tanaka@example.com', '$2a$12$0987654321098765432109', true),
('suzuki_ichiro', 'suzuki@example.com', '$2a$12$abcdefghijklmnopqrstuv', true);

-- 住所データ
INSERT INTO addresses (user_id, postal_code, prefecture, city, street_address, building, is_primary) VALUES
(1, '100-0001', '東京都', '千代田区', '千代田1-1-1', 'マンション千代田101', true),
(2, '460-0008', '愛知県', '名古屋市中区', '栄3-1-1', 'ビル名古屋8F', true),
(3, '530-0001', '大阪府', '大阪市北区', '梅田2-2-2', 'グランドタワー15F', true),
(1, '160-0022', '東京都', '新宿区', '新宿4-4-4', 'アパート新宿201', false);

-- 商品カテゴリ
INSERT INTO product_categories (name, description) VALUES
('電子機器', '各種電子機器・ガジェット'),
('書籍', '書籍・雑誌・電子書籍'),
('食品', '食料品・飲料');

INSERT INTO product_categories (name, description, parent_id) VALUES
('スマートフォン', 'スマートフォン本体・アクセサリー', 1),
('パソコン', 'デスクトップPC・ノートPC・タブレット', 1),
('小説', 'フィクション作品', 2),
('ビジネス書', 'ビジネス関連書籍', 2);

-- 商品データ
INSERT INTO products (category_id, name, description, price, stock_quantity) VALUES
(4, 'スマートフォンX', '最新モデルのハイエンドスマートフォン', 89800.00, 50),
(5, 'ノートPCプロ', '高性能ノートパソコン', 128000.00, 30),
(6, '夏の物語', '夏を舞台にした青春小説', 1500.00, 100),
(7, '成功への道', 'ビジネス成功法則を解説', 2200.00, 75),
(3, 'プレミアムコーヒー', '高級豆100%使用', 980.00, 200);

-- 注文データ
INSERT INTO orders (user_id, total_amount, status, shipping_address_id, payment_method) VALUES
(1, 91300.00, 'delivered', 1, 'credit_card'),
(2, 128000.00, 'shipped', 2, 'bank_transfer'),
(3, 3700.00, 'processing', 3, 'credit_card'),
(1, 980.00, 'pending', 1, 'convenience_store');

-- 注文明細データ
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 89800.00),
(1, 3, 1, 1500.00),
(2, 2, 1, 128000.00),
(3, 3, 1, 1500.00),
(3, 4, 1, 2200.00),
(4, 5, 1, 980.00);