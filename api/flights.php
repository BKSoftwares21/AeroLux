<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $q = trim($_GET['q'] ?? '');
  if ($q !== '') {
    $stmt = $pdo->prepare('SELECT * FROM flights WHERE airline LIKE :q OR departure LIKE :q OR arrival LIKE :q ORDER BY id DESC');
    $stmt->execute([':q' => "%$q%"]);
    send_json(['flights' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }
  $stmt = $pdo->query('SELECT * FROM flights ORDER BY id DESC');
  send_json(['flights' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($method === 'POST') {
  require_admin($pdo);
  $data = read_json();
  $stmt = $pdo->prepare('INSERT INTO flights (flight_number, airline, departure, arrival, date, time, price, image_url, is_first_class) VALUES (:flight_number, :airline, :departure, :arrival, NULLIF(:date, ""), NULLIF(:time, ""), :price, :image, :first)');
  $stmt->execute([
    ':flight_number' => $data['flightNumber'] ?? '',
    ':airline' => $data['airline'] ?? '',
    ':departure' => $data['departure'] ?? '',
    ':arrival' => $data['arrival'] ?? '',
    ':date' => $data['date'] ?? '',
    ':time' => $data['time'] ?? '',
    ':price' => (float)($data['price'] ?? 0),
    ':image' => $data['imageUrl'] ?? null,
    ':first' => !empty($data['isFirstClass']) ? 1 : 0,
  ]);
  $id = (int)$pdo->lastInsertId();
  $stmt = $pdo->prepare('SELECT * FROM flights WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['flight' => $stmt->fetch(PDO::FETCH_ASSOC)], 201);
}

if ($method === 'PUT') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $data = read_json();
  $stmt = $pdo->prepare('UPDATE flights SET flight_number=:flight_number, airline=:airline, departure=:departure, arrival=:arrival, date=NULLIF(:date, ""), time=NULLIF(:time, ""), price=:price, image_url=:image, is_first_class=:first WHERE id=:id');
  $stmt->execute([
    ':id' => $id,
    ':flight_number' => $data['flightNumber'] ?? '',
    ':airline' => $data['airline'] ?? '',
    ':departure' => $data['departure'] ?? '',
    ':arrival' => $data['arrival'] ?? '',
    ':date' => $data['date'] ?? '',
    ':time' => $data['time'] ?? '',
    ':price' => (float)($data['price'] ?? 0),
    ':image' => $data['imageUrl'] ?? null,
    ':first' => !empty($data['isFirstClass']) ? 1 : 0,
  ]);
  $stmt = $pdo->prepare('SELECT * FROM flights WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['flight' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

if ($method === 'DELETE') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $pdo->prepare('DELETE FROM flights WHERE id = :id')->execute([':id' => $id]);
  send_json(['ok' => true]);
}

send_json(['error' => 'Method not allowed'], 405);
