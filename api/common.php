<?php
declare(strict_types=1);

// Basic CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function get_pdo(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;
  $pdo = require __DIR__ . '/../connection.php';
  return $pdo;
}

function send_json($data, int $code = 200): void {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json(): array {
  $raw = file_get_contents('php://input');
  if ($raw === false || $raw === '') return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function get_bearer_token(): ?string {
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$auth) return null;
  if (stripos($auth, 'Bearer ') === 0) {
    return substr($auth, 7);
  }
  return null;
}

function current_user(PDO $pdo): ?array {
  $token = get_bearer_token();
  if (!$token) return null;
  $stmt = $pdo->prepare('SELECT u.id, u.name, u.email, u.phone, u.dob, u.id_or_passport, u.role
                         FROM sessions s
                         JOIN users u ON u.id = s.user_id
                         WHERE s.token = :token AND s.expires_at > NOW()');
  $stmt->execute([':token' => $token]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  return $user ?: null;
}

function require_user(PDO $pdo): array {
  $user = current_user($pdo);
  if (!$user) send_json(['error' => 'Unauthorized'], 401);
  return $user;
}

function require_admin(PDO $pdo): array {
  $user = require_user($pdo);
  if (($user['role'] ?? 'user') !== 'admin') send_json(['error' => 'Forbidden'], 403);
  return $user;
}

function query_param(string $key, ?string $default = null): ?string {
  return isset($_GET[$key]) ? (string)$_GET[$key] : $default;
}
