<?php
// ======================================
// SakuNovel Authentication System
// ======================================

// PASTIKAN TIDAK ADA SPASI DI ATAS <?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// ======================================
// HEADER
// ======================================

// Ganti sesuai alamat frontend kamu
header("Access-Control-Allow-Origin: http://127.0.0.1:8089");

header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ======================================
// DATABASE CONFIG
// ======================================

$host = "127.0.0.1";
$user = "admin";
$pass = "Purple!Sky@87";
$db   = "sakunovel_db";

// ======================================
// RECAPTCHA CONFIG
// ======================================

$recaptcha_secret = "6Lf_8MIsAAAAAFxwElPcJj_Q1kpBX92xZYn4imj7";

// ======================================
// CONNECT DATABASE
// ======================================

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {

    echo json_encode([
        "status" => "error",
        "message" => "Koneksi Database Gagal: " . mysqli_connect_error()
    ]);

    exit;
}

// ======================================
// AMBIL DATA FRONTEND
// ======================================

$action   = $_POST['action'] ?? '';

$username = mysqli_real_escape_string(
    $conn,
    trim($_POST['username'] ?? '')
);

$email = mysqli_real_escape_string(
    $conn,
    trim($_POST['email'] ?? '')
);

$password = $_POST['password'] ?? '';

$g_response = $_POST['g-recaptcha-response'] ?? '';

// ======================================
// VALIDASI CAPTCHA
// ======================================

if (empty($g_response)) {

    echo json_encode([
        "status" => "error",
        "message" => "Harap selesaikan CAPTCHA!"
    ]);

    exit;
}

// ======================================
// VERIFIKASI RECAPTCHA
// ======================================

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL,
    "https://www.google.com/recaptcha/api/siteverify"
);

curl_setopt($ch, CURLOPT_POST, true);

curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'secret'   => $recaptcha_secret,
    'response' => $g_response
]));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_TIMEOUT, 10);

// Penting untuk localhost / HP server
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$verify_response = curl_exec($ch);

// curl_close() sudah deprecated di PHP terbaru
// jadi tidak perlu dipakai lagi

$response_data = json_decode($verify_response);

if (!$response_data || !$response_data->success) {

    echo json_encode([
        "status" => "error",
        "message" => "Verifikasi CAPTCHA gagal!"
    ]);

    exit;
}

// ======================================
// REGISTER
// ======================================

if ($action == 'register') {

    // VALIDASI INPUT
    if (
        empty($username) ||
        empty($email) ||
        empty($password)
    ) {

        echo json_encode([
            "status" => "error",
            "message" => "Semua field wajib diisi!"
        ]);

        exit;
    }

    // HASH PASSWORD
    $hashed_password = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    // GENERATE RANDOM ACCOUNT ID
    do {

        $account_id =
            mt_rand(1000000000, 2147483647) .
            mt_rand(1000, 9999);

        $check_query = mysqli_query(
            $conn,
            "SELECT id FROM users
             WHERE account_id = '$account_id'"
        );

    } while(mysqli_num_rows($check_query) > 0);

    // INSERT USER
    $sql = "INSERT INTO users
            (
                account_id,
                username,
                email,
                password
            )
            VALUES
            (
                '$account_id',
                '$username',
                '$email',
                '$hashed_password'
            )";

    if (mysqli_query($conn, $sql)) {

        echo json_encode([
            "status" => "success",
            "message" => "Akun berhasil dibuat!"
        ]);

    } else {

        if (mysqli_errno($conn) == 1062) {

            echo json_encode([
                "status" => "error",
                "message" => "Username atau Email sudah digunakan."
            ]);

        } else {

            echo json_encode([
                "status" => "error",
                "message" => "Terjadi kesalahan database."
            ]);
        }
    }
}

// ======================================
// LOGIN
// ======================================

elseif ($action == 'login') {

    // LOGIN DENGAN EMAIL ATAU USERNAME
    $sql = "SELECT * FROM users
            WHERE email = '$email'
            OR username = '$email'
            LIMIT 1";

    $result = mysqli_query($conn, $sql);

    $user_data = mysqli_fetch_assoc($result);

    // CEK PASSWORD
    if (
        $user_data &&
        password_verify(
            $password,
            $user_data['password']
        )
    ) {

        // SESSION LOGIN
        $_SESSION['user_id'] = $user_data['id'];

        $_SESSION['username'] = $user_data['username'];

        $_SESSION['logged_in'] = true;

        // UPDATE LAST LOGIN
        mysqli_query(
            $conn,
            "UPDATE users
             SET last_login = NOW()
             WHERE id = " . $user_data['id']
        );

        // RESPONSE SUCCESS
        echo json_encode([
            "status" => "success",
            "message" => "Selamat Datang, " . $user_data['username'] . "!",
            "data" => [
                "username"   => $user_data['username'],
                "account_id" => $user_data['account_id']
            ]
        ]);

    } else {

        echo json_encode([
            "status" => "error",
            "message" => "Email/Username atau Password salah."
        ]);
    }
}

// ======================================
// INVALID ACTION
// ======================================

else {

    echo json_encode([
        "status" => "error",
        "message" => "Action tidak valid."
    ]);
}
?>