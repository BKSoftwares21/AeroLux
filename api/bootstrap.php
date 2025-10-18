<?php
declare(strict_types=1);

// Basic CORS for local dev and Expo
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// JSON helpers
function json_input(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
}

/** @var PDO $pdo */
$pdo = require __DIR__ . '/../connection.php';

// Ensure basic tables exist (dev convenience)
$driver = getenv('DB_DRIVER') ?: 'mysql';

if ($driver === 'pgsql') {
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS hotels (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      price_per_night NUMERIC(10,2) NOT NULL DEFAULT 0,
      rating SMALLINT,
      bed_type TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS flights (
      id BIGSERIAL PRIMARY KEY,
      flight_number TEXT NOT NULL,
      airline TEXT NOT NULL,
      departure TEXT NOT NULL,
      arrival TEXT NOT NULL,
      departure_date DATE,
      departure_time TIME,
      price NUMERIC(10,2) NOT NULL DEFAULT 0,
      image_url TEXT,
      is_first_class BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    SQL);
} else {
    $pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS hotels (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      description TEXT NULL,
      price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
      rating TINYINT UNSIGNED NULL,
      bed_type VARCHAR(50) NULL,
      image_url TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS flights (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      flight_number VARCHAR(50) NOT NULL,
      airline VARCHAR(120) NOT NULL,
      departure VARCHAR(120) NOT NULL,
      arrival VARCHAR(120) NOT NULL,
      departure_date DATE NULL,
      departure_time TIME NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      image_url TEXT NULL,
      is_first_class TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    SQL);
}
