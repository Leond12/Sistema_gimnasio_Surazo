<?php
// api/generic_crud.php
require_once 'db.php';

function handleCrud($conn, $table, $columns, $idField) {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $action = $_GET['action'] ?? '';
        if ($action === 'read') {
            $stmt = $conn->prepare("SELECT * FROM $table");
            $stmt->execute();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
            exit();
        }
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'create') {
            $fieldsToInsert = [];
            $values = [];
            foreach ($columns as $col) {
                if (isset($data[$col])) {
                    $fieldsToInsert[] = $col;
                    $values[":$col"] = $data[$col] !== '' ? $data[$col] : null;
                }
            }
            if (!empty($fieldsToInsert)) {
                $colsStr = implode(',', $fieldsToInsert);
                $valsStr = implode(',', array_map(function($c) { return ":$c"; }, $fieldsToInsert));
                $stmt = $conn->prepare("INSERT INTO $table ($colsStr) VALUES ($valsStr)");
                try {
                    $stmt->execute($values);
                    echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
                } catch(PDOException $e) {
                    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
                }
            }
            exit();
        }

        if ($action === 'update') {
            $id = $data['id'] ?? null;
            if (!$id) {
                echo json_encode(['success' => false, 'error' => 'ID missing for update']);
                exit();
            }

            $setFields = [];
            $values = [":id" => $id];
            foreach ($columns as $col) {
                if (isset($data[$col])) {
                    $setFields[] = "$col = :$col";
                    // If inserting empty string but null is preferred, logic might differ. Kept simple:
                    $values[":$col"] = $data[$col] !== '' ? $data[$col] : null; 
                }
            }
            if (!empty($setFields)) {
                $setStr = implode(',', $setFields);
                $stmt = $conn->prepare("UPDATE $table SET $setStr WHERE $idField = :id");
                try {
                    $stmt->execute($values);
                    echo json_encode(['success' => true]);
                } catch(PDOException $e) {
                    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
                }
            }
            exit();
        }

        if ($action === 'delete') {
            $id = $data['id'] ?? null;
            if ($id) {
                $stmt = $conn->prepare("DELETE FROM $table WHERE $idField = :id");
                try {
                    $stmt->execute([':id' => $id]);
                    echo json_encode(['success' => true]);
                } catch(PDOException $e) {
                    echo json_encode(['success' => false, 'error' => 'Cannot delete record, might be in use']);
                }
            }
            exit();
        }
    }
}
?>
