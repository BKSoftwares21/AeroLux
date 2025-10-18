<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
$type = isset($_GET['type']) ? trim((string)$_GET['type']) : '';

$results = [
    'hotels' => [],
    'flights' => [],
];

if ($type === '' || $type === 'hotels') {
    $sql = 'SELECT * FROM hotels WHERE 1=1';
    $params = [];
    if ($q !== '') {
        $sql .= ' AND (name LIKE ? OR location LIKE ? OR description LIKE ?)';
        $params = ["%$q%", "%$q%", "%$q%"];
    }
    $sql .= ' ORDER BY created_at DESC LIMIT 50';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results['hotels'] = $stmt->fetchAll();
}

if ($type === '' || $type === 'flights') {
    $sql = 'SELECT * FROM flights WHERE 1=1';
    $params = [];
    if ($q !== '') {
        $sql .= ' AND (flight_number LIKE ? OR airline LIKE ? OR departure LIKE ? OR arrival LIKE ?)';
        $params = ["%$q%", "%$q%", "%$q%", "%$q%"];
    }
    $sql .= ' ORDER BY created_at DESC LIMIT 50';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results['flights'] = $stmt->fetchAll();
}

json_response($results);
