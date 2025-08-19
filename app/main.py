import os
import json
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static')

DATA_FILE = 'memos.json'

def read_memos():
    """memos.jsonからメモを読み込む"""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []

def write_memos(memos):
    """メモをmemos.jsonに書き込む"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(memos, f, ensure_ascii=False, indent=4)

@app.route('/')
def index():
    """フロントエンドのindex.htmlを返す"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """staticディレクトリの他のファイルを返す (e.g., css, js)"""
    return send_from_directory(app.static_folder, path)

@app.route('/api/memos', methods=['GET'])
def get_memos():
    """保存されているすべてのメモをJSONで返す"""
    memos = read_memos()
    return jsonify(memos)

@app.route('/api/memos', methods=['POST'])
def add_memo():
    """新しいメモを追加する"""
    if not request.json or 'memo' not in request.json:
        return jsonify({'error': 'memo content is missing'}), 400

    memos = read_memos()
    new_memo = request.json['memo'].strip()

    if not new_memo:
        return jsonify({'error': 'memo content cannot be empty'}), 400

    memos.append(new_memo)
    write_memos(memos)

    return jsonify({'success': True, 'memo': new_memo}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
