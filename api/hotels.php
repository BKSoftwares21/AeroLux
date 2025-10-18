<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $q = trim($_GET['q'] ?? '');
  if ($q !== '') {
    $stmt = $pdo->prepare('SELECT * FROM hotels WHERE name LIKE :q OR location LIKE :q ORDER BY id DESC');
    $stmt->execute([':q' => "%$q%"]);
    send_json(['hotels' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }
  $stmt = $pdo->query('SELECT * FROM hotels ORDER BY id DESC');
  send_json(['hotels' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($method === 'POST') {
  require_admin($pdo);
  $data = read_json();
  $stmt = $pdo->prepare('INSERT INTO hotels (name, location, description, price_per_night, rating, bed_type, image_url) VALUES (:name, :location, :description, :price, :rating, :bed, :image)');
  $stmt->execute([
    ':name' => $data['name'] ?? '',
    ':location' => $data['location'] ?? '',
    ':description' => $data['description'] ?? '',
    ':price' => (float)($data['pricePerNight'] ?? 0),
    ':rating' => (int)($data['rating'] ?? 0),
    ':bed' => $data['bedType'] ?? '',
    ':image' => $data['imageUrl'] ?? null,
  ]);
  $id = (int)$pdo->lastInsertId();
  $stmt = $pdo->prepare('SELECT * FROM hotels WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['hotel' => $stmt->fetch(PDO::FETCH_ASSOC)], 201);
}

if ($method === 'PUT') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $data = read_json();
  $stmt = $pdo->prepare('UPDATE hotels SET name=:name, location=:location, description=:description, price_per_night=:price, rating=:rating, bed_type=:bed, image_url=:image WHERE id=:id');
  $stmt->execute([
    ':id' => $id,
    ':name' => $data['name'] ?? '',
    ':location' => $data['location'] ?? '',
    ':description' => $data['description'] ?? '',
    ':price' => (float)($data['pricePerNight'] ?? 0),
    ':rating' => (int)($data['rating'] ?? 0),
    ':bed' => $data['bedType'] ?? '',
    ':image' => $data['imageUrl'] ?? null,
  ]);
  $stmt = $pdo->prepare('SELECT * FROM hotels WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['hotel' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

if ($method === 'DELETE') {
  require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $pdo->prepare('DELETE FROM hotels WHERE id = :id')->execute([':id' => $id]);
  send_json(['ok' => true]);
}

send_json(['error' => 'Method not allowed'], 405);
