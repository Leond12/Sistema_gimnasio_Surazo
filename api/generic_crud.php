<?php
// api/generic_crud.php
require_once 'db.php';

function handleCrud($conn, $table, $columns, $idField) {
    $method = $_SERVER['REQUEST_METHOD'];

    // Helper to insert automated notification
    $insertNotification = function($tipo, $texto) use ($conn) {
        try {
            $stmt = $conn->prepare("INSERT INTO notificaciones (tipo, texto) VALUES (?, ?)");
            $stmt->execute([$tipo, $texto]);
        } catch(PDOException $e) { /* ignore error during notification insert */ }
    };
    
    // Helper to dynamically find a name to display instead of just an ID
    $getNameForDisplay = function($data, $id = null) use ($conn, $table, $idField, $columns) {
        $nameCols = ['nombre', 'nombre_producto', 'nombre_empresa', 'nombre_plan', 'nombre_maquina', 'nombre_clase'];
        $displayCol = null;
        
        foreach ($nameCols as $col) {
            if (in_array($col, $columns)) {
                $displayCol = $col;
                break;
            }
        }
        
        // Return from $data if available (for create/update)
        if ($displayCol && !empty($data[$displayCol])) {
            return $data[$displayCol];
        }
        
        // Fetch from DB if not in $data (like during delete)
        if ($displayCol && $id) {
            try {
                $stmt = $conn->prepare("SELECT $displayCol FROM $table WHERE $idField = ?");
                $stmt->execute([$id]);
                $val = $stmt->fetchColumn();
                if ($val) return $val;
            } catch(PDOException $e) {}
        }
        
        return "ID: $id";
    };

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
                    $newId = $conn->lastInsertId();
                    
                    // Notificar
                    $tableNameCapitalized = ucfirst($table);
                    $displayName = $getNameForDisplay($data, $newId);
                    $insertNotification('success', "Nuevo registro en $tableNameCapitalized: $displayName");
                    
                    echo json_encode(['success' => true, 'id' => $newId]);
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
                    $values[":$col"] = $data[$col] !== '' ? $data[$col] : null; 
                }
            }
            // Obtain display name before updating in case it wasn't sent in $data but it exists
            $displayName = $getNameForDisplay($data, $id);
            
            if (!empty($setFields)) {
                $setStr = implode(',', $setFields);
                $stmt = $conn->prepare("UPDATE $table SET $setStr WHERE $idField = :id");
                try {
                    $stmt->execute($values);
                    
                    // Notificar
                    $tableNameCapitalized = ucfirst($table);
                    $insertNotification('info', "Registro actualizado en $tableNameCapitalized: $displayName");
                    
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
                $displayName = $getNameForDisplay([], $id); // Fetch before delete
                
                $stmt = $conn->prepare("DELETE FROM $table WHERE $idField = :id");
                try {
                    $stmt->execute([':id' => $id]);
                    
                    // Notificar
                    $tableNameCapitalized = ucfirst($table);
                    $insertNotification('warning', "Registro borrado en $tableNameCapitalized: $displayName");
                    
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
