<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  $q = trim($_GET['q'] ?? '');
  if ($id > 0) {
    $stmt = $pdo->prepare('SELECT id, name, email, phone, dob, id_or_passport, role, created_at FROM users WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    send_json(['user' => $user]);
  }
  if ($q !== '') {
    $stmt = $pdo->prepare('SELECT id, name, email, phone, dob, id_or_passport, role, created_at FROM users WHERE name LIKE :q OR email LIKE :q ORDER BY id DESC');
    $stmt->execute([':q' => "%$q%"]);
    send_json(['users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
  }
  $stmt = $pdo->query('SELECT id, name, email, phone, dob, id_or_passport, role, created_at FROM users ORDER BY id DESC');
  send_json(['users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($method === 'POST') {
  $actor = require_admin($pdo);
  $data = read_json();
  $name = trim($data['name'] ?? '');
  $email = trim($data['email'] ?? '');
  $phone = trim($data['phone'] ?? '');
  $dob = trim($data['dob'] ?? '');
  $idp = trim($data['idOrPassport'] ?? '');
  $role = in_array(($data['role'] ?? 'user'), ['user','admin'], true) ? $data['role'] : 'user';
  $password = (string)($data['password'] ?? 'changeme');
  if ($name === '' || $email === '') send_json(['error' => 'Missing required fields'], 400);
  $hash = password_hash($password, PASSWORD_BCRYPT);
  $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, dob, id_or_passport, role, password_hash) VALUES (:name, :email, :phone, NULLIF(:dob, ""), :idp, :role, :hash)');
  $stmt->execute([':name'=>$name, ':email'=>$email, ':phone'=>$phone, ':dob'=>$dob, ':idp'=>$idp, ':role'=>$role, ':hash'=>$hash]);
  $id = (int)$pdo->lastInsertId();
  $stmt = $pdo->prepare('SELECT id, name, email, phone, dob, id_or_passport, role, created_at FROM users WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['user' => $stmt->fetch(PDO::FETCH_ASSOC)], 201);
}

if ($method === 'PUT') {
  $actor = require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $data = read_json();
  $fields = [];
  $params = [':id' => $id];
  foreach ([
    'name' => 'name',
    'email' => 'email',
    'phone' => 'phone',
    'dob' => 'dob',
    'id_or_passport' => 'idOrPassport',
    'role' => 'role',
  ] as $column => $key) {
    if (array_key_exists($key, $data)) {
      $fields[] = "$column = :$column";
      $params[":$column"] = $data[$key];
    }
  }
  if (isset($data['password'])) {
    $fields[] = 'password_hash = :password_hash';
    $params[':password_hash'] = password_hash((string)$data['password'], PASSWORD_BCRYPT);
  }
  if (!$fields) send_json(['error' => 'No fields to update'], 400);
  $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $stmt = $pdo->prepare('SELECT id, name, email, phone, dob, id_or_passport, role, created_at FROM users WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['user' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}

if ($method === 'DELETE') {
  $actor = require_admin($pdo);
  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) send_json(['error' => 'Missing id'], 400);
  $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
  $stmt->execute([':id' => $id]);
  send_json(['ok' => true]);
}

send_json(['error' => 'Method not allowed'], 405);
