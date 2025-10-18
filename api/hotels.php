<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // GET /api/hotels or /api/hotels?id=1 or search by q/location
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        $q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
        $location = isset($_GET['location']) ? trim((string)$_GET['location']) : '';
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM hotels WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) return json_response(['error' => 'Not found'], 404);
            return json_response($row);
        }
        $sql = 'SELECT * FROM hotels WHERE 1=1';
        $params = [];
        if ($q !== '') {
            $sql .= ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
            $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%";
        }
        if ($location !== '') {
            $sql .= ' AND location LIKE ?';
            $params[] = "%$location%";
        }
        $sql .= ' ORDER BY created_at DESC LIMIT 200';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return json_response($stmt->fetchAll());

    case 'POST':
        // Create hotel
        $data = json_input();
        $stmt = $pdo->prepare('INSERT INTO hotels (name, location, description, price_per_night, rating, bed_type, image_url) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([
            $data['name'] ?? null,
            $data['location'] ?? null,
            $data['description'] ?? null,
            $data['pricePerNight'] ?? 0,
            $data['rating'] ?? null,
            $data['bedType'] ?? null,
            $data['imageUrl'] ?? null,
        ]);
        $id = (int)$pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM hotels WHERE id = ?');
        $stmt->execute([$id]);
        return json_response($stmt->fetch(), 201);

    case 'PUT':
    case 'PATCH':
        // Update hotel by id
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) return json_response(['error' => 'Missing id'], 400);
        $data = json_input();
        $stmt = $pdo->prepare('UPDATE hotels SET name=?, location=?, description=?, price_per_night=?, rating=?, bed_type=?, image_url=? WHERE id=?');
        $stmt->execute([
            $data['name'] ?? null,
            $data['location'] ?? null,
            $data['description'] ?? null,
            $data['pricePerNight'] ?? 0,
            $data['rating'] ?? null,
            $data['bedType'] ?? null,
            $data['imageUrl'] ?? null,
            $id,
        ]);
        $stmt = $pdo->prepare('SELECT * FROM hotels WHERE id = ?');
        $stmt->execute([$id]);
        return json_response($stmt->fetch());

    case 'DELETE':
        // Delete by id
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) return json_response(['error' => 'Missing id'], 400);
        $stmt = $pdo->prepare('DELETE FROM hotels WHERE id = ?');
        $stmt->execute([$id]);
        return json_response(['deleted' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
