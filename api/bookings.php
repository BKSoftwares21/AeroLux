<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : 0;
  if ($userId > 0) {
    $stmt = $pdo->prepare('SELECT * FROM bookings WHERE user_id = :uid ORDER BY id DESC');
    $stmt->execute([':uid' => $userId]);
    send_json(['bookings' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }
  $stmt = $pdo->query('SELECT * FROM bookings ORDER BY id DESC');
  send_json(['bookings' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($method === 'POST') {
  $user = require_user($pdo);
  $data = read_json();
  $stmt = $pdo->prepare('INSERT INTO bookings (user_id, type, reference, status, flight_id, hotel_id) VALUES (:uid, :type, :ref, :status, :fid, :hid)');
  $stmt->execute([
    ':uid' => (int)$user['id'],
    ':type' => ($data['type'] ?? 'FLIGHT') === 'HOTEL' ? 'HOTEL' : 'FLIGHT',
    ':ref' => $data['reference'] ?? '',
    ':status' => $data['status'] ?? 'PENDING',
    ':fid' => isset($data['flightId']) ? (int)$data['flightId'] : null,
    ':hid' => isset($data['hotelId']) ? (int)$data['hotelId'] : null,
  ]);
  $id = (int)$pdo->lastInsertId();
  $stmt = $pdo->prepare('SELECT * FROM bookings WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['booking' => $stmt->fetch(PDO::FETCH_ASSOC)], 201);
}

if ($method === 'PUT') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $data = read_json();
  $fields = [];
  $params = [':id' => $id];
  foreach (['status','reference'] as $col) {
    if (array_key_exists($col, $data)) { $fields[] = "$col = :$col"; $params[":$col"] = $data[$col]; }
  }
  if (!$fields) send_json(['error' => 'No fields to update'], 400);
  $pdo->prepare('UPDATE bookings SET '.implode(',',$fields).' WHERE id=:id')->execute($params);
  $stmt = $pdo->prepare('SELECT * FROM bookings WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['booking' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

if ($method === 'DELETE') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $pdo->prepare('DELETE FROM bookings WHERE id = :id')->execute([':id' => $id]);
  send_json(['ok' => true]);
}

send_json(['error' => 'Method not allowed'], 405);
