<?php
declare(strict_types=1);

// Choose driver via env, default to MySQL for XAMPP
$driver = getenv('DB_DRIVER') ?: 'mysql'; // 'mysql' | 'pgsql'
$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'aerolux';
// Defaults per driver
if ($driver === 'pgsql') {
    $port = getenv('DB_PORT') ?: '5432';
    $username = getenv('DB_USER') ?: 'postgres';
    $password = getenv('DB_PASS') ?: '';
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbName};";
} else { // mysql
    $port = getenv('DB_PORT') ?: '3306';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASS') ?: '';
    $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
}

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    throw new RuntimeException('Database connection failed: ' . $e->getMessage());
}

return $pdo;
