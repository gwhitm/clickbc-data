import os
import pandas as pd
from firebase_functions import https_fn
from flask import jsonify, request, make_response
import firebase_admin
from firebase_admin import credentials, storage
from io import StringIO

# Initialize Firebase Admin SDK
# cred = credentials.Certificate('./path/to/your-service-account-file.json')
app = firebase_admin.initialize_app()

# Enable CORS for Firebase Functions
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Function to get the list of data types (telem or fpga)
@https_fn.on_request()
def list_data_types(request):
    response = make_response(jsonify(['telem', 'fpga']))
    return add_cors_headers(response)

# Function to get the list of CSV files for a given data type
@https_fn.on_request()
def list_csv_files(request):
    data_type = request.args.get('data_type')
    bucket = storage.bucket()

    # List all files in the directory in the Firebase Storage bucket
    blobs = bucket.list_blobs(prefix=f"clicka-data/{data_type}/")

    files = [blob.name for blob in blobs if blob.name.endswith('.csv')]
    response = make_response(jsonify(files))
    return add_cors_headers(response)

# Function to get the available columns of a specific CSV
@https_fn.on_request()
def list_csv_columns(request):
    data_type = request.args.get('data_type')
    filename = request.args.get('filename')

    bucket = storage.bucket()
    blob = bucket.blob(f"{filename}")

    if not blob.exists():
        response = make_response(jsonify({"error": "File not found"}), 404)
        return add_cors_headers(response)

    # Read CSV directly from the blob
    csv_data = blob.download_as_text()
    df = pd.read_csv(StringIO(csv_data))
    columns = df.columns.tolist()
    
    response = make_response(jsonify(columns))
    return add_cors_headers(response)

# Function to get data from a specific column
@https_fn.on_request()
def get_csv_data(request):
    data_type = request.args.get('data_type')
    filename = request.args.get('filename')
    column = request.args.get('column')

    bucket = storage.bucket()
    blob = bucket.blob(f"{filename}")

    if not blob.exists():
        response = make_response(jsonify({"error": "File not found"}), 404)
        return add_cors_headers(response)

    # Read CSV directly from the blob
    csv_data = blob.download_as_text()
    df = pd.read_csv(StringIO(csv_data))

    if column not in df.columns:
        response = make_response(jsonify({"error": "Column not found"}), 404)
        return add_cors_headers(response)

    data = df[column].tolist()
    response = make_response(jsonify(data))
    return add_cors_headers(response)
