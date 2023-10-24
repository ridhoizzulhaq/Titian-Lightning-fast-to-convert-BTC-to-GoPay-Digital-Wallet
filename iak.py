import requests
import hashlib
import random
import string
import sys

# Fungsi untuk menghasilkan kode acak
def generate_random_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Fungsi untuk menghasilkan sign MD5
def generate_md5(username, ref_id):
    api_key = ""
    data_to_hash = username + api_key + ref_id
    md5_hash = hashlib.md5(data_to_hash.encode()).hexdigest()
    return md5_hash

# Cek apakah argumen customer_id diberikan
if len(sys.argv) < 2:
    print("Harap masukkan Customer ID sebagai argumen!")
    sys.exit()

# Isi dengan informasi yang sesuai
username = "081366725136"
customer_id = sys.argv[1]  # Ambil customer_id dari argumen baris perintah
ref_id = "order" + generate_random_code()
product_code = "go1"
sign = generate_md5(username, ref_id)

url = "https://prepaid.iak.dev/api/top-up"

payload = {
    "username": username,
    "customer_id": customer_id,
    "ref_id": ref_id,
    "product_code": product_code,
    "sign": sign
}

headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    print("Response code:", response.json().get("response_code"))
    print(response.json())
else:
    print("Failed to make the POST request.")
