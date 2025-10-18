<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // GET /api/flights or /api/flights?id=1 or search
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        $q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
        $from = isset($_GET['from']) ? trim((string)$_GET['from']) : '';
        $to = isset($_GET['to']) ? trim((string)$_GET['to']) : '';
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM flights WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) return json_response(['error' => 'Not found'], 404);
            return json_response($row);
        }
        $sql = 'SELECT * FROM flights WHERE 1=1';
        $params = [];
        if ($q !== '') {
            $sql .= ' AND (flight_number LIKE ? OR airline LIKE ? OR departure LIKE ? OR arrival LIKE ?)';
            $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%"; $params[] = "%$q%";
        }
        if ($from !== '') { $sql .= ' AND departure LIKE ?'; $params[] = "%$from%"; }
        if ($to !== '') { $sql .= ' AND arrival LIKE ?'; $params[] = "%$to%"; }
        $sql .= ' ORDER BY created_at DESC LIMIT 200';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return json_response($stmt->fetchAll());

    case 'POST':
        $data = json_input();
        $stmt = $pdo->prepare('INSERT INTO flights (flight_number, airline, departure, arrival, departure_date, departure_time, price, image_url, is_first_class) VALUES (?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $data['flightNumber'] ?? null,
            $data['airline'] ?? null,
            $data['departure'] ?? null,
            $data['arrival'] ?? null,
            $data['date'] ?? null,
            $data['time'] ?? null,
            $data['price'] ?? 0,
            $data['imageUrl'] ?? null,
            !empty($data['isFirstClass']) ? 1 : 0,
        ]);
        $id = (int)$pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM flights WHERE id = ?');
        $stmt->execute([$id]);
        return json_response($stmt->fetch(), 201);

    case 'PUT':
    case 'PATCH':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) return json_response(['error' => 'Missing id'], 400);
        $data = json_input();
        $stmt = $pdo->prepare('UPDATE flights SET flight_number=?, airline=?, departure=?, arrival=?, departure_date=?, departure_time=?, price=?, image_url=?, is_first_class=? WHERE id=?');
        $stmt->execute([
            $data['flightNumber'] ?? null,
            $data['airline'] ?? null,
            $data['departure'] ?? null,
            $data['arrival'] ?? null,
            $data['date'] ?? null,
            $data['time'] ?? null,
            $data['price'] ?? 0,
            $data['imageUrl'] ?? null,
            !empty($data['isFirstClass']) ? 1 : 0,
            $id,
        ]);
        $stmt = $pdo->prepare('SELECT * FROM flights WHERE id = ?');
        $stmt->execute([$id]);
        return json_response($stmt->fetch());

    case 'DELETE':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) return json_response(['error' => 'Missing id'], 400);
        $stmt = $pdo->prepare('DELETE FROM flights WHERE id = ?');
        $stmt->execute([$id]);
        return json_response(['deleted' => true]);
}

json_response(['error' => 'Method not allowed'], 405);
