<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
  $path = $_GET['action'] ?? '';
  $input = read_json();

  if ($path === 'login') {
    $email = trim($input['email'] ?? '');
    $password = (string)($input['password'] ?? '');
    if ($email === '' || $password === '') send_json(['error' => 'Email and password required'], 400);

    $stmt = $pdo->prepare('SELECT id, name, email, phone, dob, id_or_passport, role, password_hash FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || !password_verify($password, (string)$user['password_hash'])) {
      send_json(['error' => 'Invalid credentials'], 401);
    }

    $token = bin2hex(random_bytes(32));
    $stmt = $pdo->prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (:uid, :token, DATE_ADD(NOW(), INTERVAL 7 DAY))');
    $stmt->execute([':uid' => $user['id'], ':token' => $token]);

    unset($user['password_hash']);
    send_json(['token' => $token, 'user' => $user]);
  }

  if ($path === 'signup') {
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = (string)($input['password'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $dob = trim($input['dob'] ?? '');
    $idOrPassport = trim($input['idOrPassport'] ?? '');

    if ($name === '' || $email === '' || $password === '') {
      send_json(['error' => 'Name, email and password required'], 400);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email');
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) send_json(['error' => 'Email already registered'], 409);

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, dob, id_or_passport, role, password_hash) VALUES (:name, :email, :phone, NULLIF(:dob, ""), :idp, "user", :hash)');
    $stmt->execute([
      ':name' => $name,
      ':email' => $email,
      ':phone' => $phone,
      ':dob' => $dob,
      ':idp' => $idOrPassport,
      ':hash' => $hash,
    ]);

    $userId = (int)$pdo->lastInsertId();
    $token = bin2hex(random_bytes(32));
    $pdo->prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (:uid, :token, DATE_ADD(NOW(), INTERVAL 7 DAY))')
        ->execute([':uid' => $userId, ':token' => $token]);

    $stmt = $pdo->prepare('SELECT id, name, email, phone, dob, id_or_passport, role FROM users WHERE id = :id');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    send_json(['token' => $token, 'user' => $user], 201);
  }

  if ($path === 'logout') {
    $token = get_bearer_token();
    if ($token) {
      $pdo->prepare('DELETE FROM sessions WHERE token = :token')->execute([':token' => $token]);
    }
    send_json(['ok' => true]);
  }

  send_json(['error' => 'Unknown action'], 404);
}

if ($method === 'GET') {
  if (($_GET['action'] ?? '') === 'me') {
    $user = current_user($pdo);
    if (!$user) send_json(['user' => null]);
    send_json(['user' => $user]);
  }
}

send_json(['error' => 'Method not allowed'], 405);
