<?php
// Secure PHP reverse proxy for Aruba Shared Hosting to VPS (IPv6)

// Configure the VPS Cloudflare subdomain endpoint
$target_url = "http://api.matteoberga.com/api" . ($_SERVER['PATH_INFO'] ?? '');

if (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '') {
    $target_url .= '?' . $_SERVER['QUERY_STRING'];
}

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $target_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

// Forward request method
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward request body (for POST, PUT, DELETE, etc.)
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

// Robust Headers extraction fallback for Apache/PHP-FPM on Shared Hosting
$headers = [];
$source_headers = function_exists('getallheaders') ? getallheaders() : [];

// If getallheaders is empty or doesn't have custom headers, extract from $_SERVER
if (empty($source_headers) || !isset($source_headers['X-Admin-Passphrase'])) {
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            // Convert HTTP_X_ADMIN_PASSPHRASE -> X-Admin-Passphrase
            $header_name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
            $source_headers[$header_name] = $value;
        } elseif ($key === 'CONTENT_TYPE') {
            $source_headers['Content-Type'] = $value;
        } elseif ($key === 'CONTENT_LENGTH') {
            $source_headers['Content-Length'] = $value;
        }
    }
}

// Build headers array for cURL
foreach ($source_headers as $key => $value) {
    if (strtolower($key) !== 'host') {
        $headers[] = "$key: $value";
    }
}

// Add client tracing headers
$headers[] = "X-Forwarded-For: " . ($_SERVER['REMOTE_ADDR'] ?? '');
$headers[] = "X-Forwarded-Proto: https";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Execute cURL request
$response = curl_exec($ch);

if ($response === false) {
    $error = curl_error($ch);
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Bad Gateway: Failed to connect to the backend server.",
        "debug" => $error
    ]);
    curl_close($ch);
    exit;
}

// Separate headers and body from cURL output
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$resp_headers_str = substr($response, 0, $header_size);
$resp_body = substr($response, $header_size);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

// Set HTTP response status code
http_response_code($http_code);

// Forward response headers to client
$resp_headers = explode("\r\n", $resp_headers_str);
foreach ($resp_headers as $header) {
    if (strpos($header, 'HTTP/') !== 0 && !empty($header)) {
        if (stripos($header, 'transfer-encoding:') === false) {
            header($header);
        }
    }
}

// Output response body
echo $resp_body;