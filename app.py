from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Airtable API
BASE_ID = "your_base_id_here"
API_KEY = "your_api_token_here"

@app.route('/add_stock', methods=['POST'])
def add_stock():
    data = request.json
    product_name = data.get("product_name")
    quantity = data.get("quantity")

    # Запрос к Airtable API для добавления поступления
    url = f"https://api.airtable.com/v0/{BASE_ID}/Поступления"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "records": [
            {
                "fields": {
                    "Товар": [product_name],
                    "Количество": quantity
                }
            }
        ]
    }
    response = requests.post(url, headers=headers, json=payload)
    return jsonify(response.json()), response.status_code

@app.route('/subtract_stock', methods=['POST'])
def subtract_stock():
    data = request.json
    product_name = data.get("product_name")
    quantity = data.get("quantity")

    # Запрос к Airtable API для добавления списания
    url = f"https://api.airtable.com/v0/{BASE_ID}/Списания"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "records": [
            {
                "fields": {
                    "Товар": [product_name],
                    "Количество": quantity
                }
            }
        ]
    }
    response = requests.post(url, headers=headers, json=payload)
    return jsonify(response.json()), response.status_code

if __name__ == "__main__":
    app.run(debug=True)