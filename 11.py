import zipfile
import os

# Path to the zip file
zip_file_path = 'Downloads/model_and_images.zip'

# Folder to extract to
extract_folder = 'Downloads/'

# Extract the zip file
with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
    zip_ref.extractall(extract_folder)

print("Zip file extracted to:", extract_folder)
