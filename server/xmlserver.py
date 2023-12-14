from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder='client')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>ChordMania</title>
    </head>
    <body>
        <h1>Welcome to ChordMania</h1>
        <p>This page is under construction.</p>
    </body>
    </html>
    '''
#    if path != "" and os.path.exists(app.static_folder + '/' + path):
#        return send_from_directory(app.static_folder, path)
#    else:
#        return send_from_directory(app.static_folder, 'index.html')

@app.route('/xmlgen', methods=['POST'])
def process_image():
#    # Extract the image data URL from the request
#    image_data_url = request.json.get('imageData')
#    header, encoded = image_data_url.split(",", 1)
#    image_data = base64.b64decode(encoded)
#    image = Image.open(io.BytesIO(image_data))
#
#    current_script_dir = os.path.dirname(os.path.abspath(__file__))
#    model_path = os.path.join(current_script_dir, 'model.pt')
#    model = YOLO(model_path)
#    results = model(image, verbose=False)[0]  # predict on an image
#
#    # Convert the tensor to a list for JSON serialization
#    predictions = []
#    for box in results.boxes.xyxy.cpu().numpy():
#        x, y, x1, y1 = map(float, box[:4]) # Extract bounding box coordinates
#        predictions.append({"x": x, "y": y, "w": x1-x, "h": y1-y})

    return jsonify([])

if __name__ == '__main__':
    app.run('localhost',4999,debug=True)
