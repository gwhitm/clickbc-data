from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Base directory containing the data
BASE_DIR = './data-storage'

# Endpoint to get the list of data types (telem or fpga)
@app.route('/api/data-types', methods=['GET'])
def list_data_types():
    return jsonify(['telem', 'fpga'])

# Endpoint to get the list of CSV files for a given data type
@app.route('/api/csv-files', methods=['GET'])
def list_csv_files():
    data_type = request.args.get('data_type')
    data_dir = os.path.join(BASE_DIR, data_type)

    if not os.path.exists(data_dir):
        return jsonify({"error": "Data type not found"}), 404

    files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    return jsonify(files)

# Endpoint to get the available columns of a specific CSV
@app.route('/api/csv-columns', methods=['GET'])
def list_csv_columns():
    data_type = request.args.get('data_type')
    filename = request.args.get('filename')
    file_path = os.path.join(BASE_DIR, data_type, filename)
    

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(file_path)
    columns = df.columns.tolist()
    return jsonify(columns)

# Endpoint to get data from a specific column
@app.route('/api/csv-data', methods=['GET'])
def get_csv_data():
    data_type = request.args.get('data_type')
    filename = request.args.get('filename')
    column = request.args.get('column')
    file_path = os.path.join(BASE_DIR, data_type, filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(file_path)
    if column not in df.columns:
        return jsonify({"error": "Column not found"}), 404

    data = df[column].tolist()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
