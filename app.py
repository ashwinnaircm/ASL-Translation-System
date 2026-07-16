from flask import Flask, render_template, request, jsonify
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image

# ✅ Model matching your trained .pth file (conv3 included, correct fc1 size)
class ASLModel(nn.Module):
    def __init__(self, num_classes=29):
        super(ASLModel, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.relu1 = nn.ReLU()
        self.pool = nn.MaxPool2d(2, 2)

        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.relu2 = nn.ReLU()

        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.relu3 = nn.ReLU()

        # NOTE: image input assumed to be 128x128 for correct shape
        self.fc1 = nn.Linear(128 * 28 * 28, 512)  # = 100352
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x):
        x = self.pool(self.relu1(self.conv1(x)))
        x = self.pool(self.relu2(self.conv2(x)))
        x = self.pool(self.relu3(self.conv3(x)))
        x = x.view(x.size(0), -1)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Flask setup
app = Flask(__name__)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
model = ASLModel(num_classes=29)
model.load_state_dict(torch.load("asl_model.pth", map_location=device))
model.to(device)
model.eval()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),   # This gets pooled down to 28x28
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/frame')
def frame():
    return render_template('translator.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    img = Image.open(file).convert('RGB')
    img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img)
        predicted_index = torch.argmax(output, axis=1).item()

    class_labels = {i: chr(65 + i) for i in range(26)}
    class_labels[26] = " "  # Space
    class_labels[27] = "⌫"  # Delete
    class_labels[28] = ""   # Nothing

    predicted_label = class_labels.get(predicted_index, "?")
    return jsonify({'prediction': predicted_label})

if __name__ == '__main__':
    app.run(debug=True)
