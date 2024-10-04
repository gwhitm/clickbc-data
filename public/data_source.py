from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Path to the directory containing CSV files
CSV_DIR = './csv_files'

# Endpoint to get the list of available CSV files
@app.route('/api/csv-files', methods=['GET'])
def list_csv_files():
    files = [f for f in os.listdir(CSV_DIR) if f.endswith('.csv')]
    return jsonify(files)

# Endpoint to get the available columns of a specific CSV
@app.route('/api/csv-columns', methods=['GET'])
def list_csv_columns():
    filename = request.args.get('filename')
    file_path = os.path.join(CSV_DIR, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(file_path)
    columns = df.columns.tolist()
    return jsonify(columns)

# Endpoint to get data from a specific column
@app.route('/api/csv-data', methods=['GET'])
def get_csv_data():
    filename = request.args.get('filename')
    column = request.args.get('column')
    file_path = os.path.join(CSV_DIR, filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(file_path)
    if column not in df.columns:
        return jsonify({"error": "Column not found"}), 404

    data = df[column].tolist()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
