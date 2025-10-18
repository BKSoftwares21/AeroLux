<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
  if ($userId > 0) {
    $stmt = $pdo->prepare('SELECT p.* FROM payments p JOIN bookings b ON b.id = p.booking_id WHERE b.user_id = :uid ORDER BY p.id DESC');
    $stmt->execute([':uid' => $userId]);
    send_json(['payments' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }
  $stmt = $pdo->query('SELECT * FROM payments ORDER BY id DESC');
  send_json(['payments' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($method === 'PUT') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $data = read_json();
  $fields = [];
  $params = [':id' => $id];
  foreach (['status','amount','paymentMethod'] as $key) {
    $col = $key === 'paymentMethod' ? 'payment_method' : $key;
    if (array_key_exists($key, $data)) { $fields[] = "$col = :$col"; $params[":$col"] = $data[$key]; }
  }
  if (!$fields) send_json(['error' => 'No fields to update'], 400);
  $pdo->prepare('UPDATE payments SET '.implode(',', $fields).' WHERE id=:id')->execute($params);
  $stmt = $pdo->prepare('SELECT * FROM payments WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['payment' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

send_json(['error' => 'Method not allowed'], 405);
