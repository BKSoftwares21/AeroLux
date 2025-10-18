<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
  if ($userId > 0) {
    $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id = :uid ORDER BY id DESC');
    $stmt->execute([':uid' => $userId]);
    send_json(['notifications' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }
  $stmt = $pdo->query('SELECT * FROM notifications ORDER BY id DESC');
  send_json(['notifications' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

send_json(['error' => 'Method not allowed'], 405);
