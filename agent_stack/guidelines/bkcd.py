import os
folder_path = "pdfs/"

pdf_files = []
# The os.walk() function will go through the main folder and all its subfolders.
for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.lower().endswith(".pdf"):
            pdf_files.append(os.path.join(root, file))

print(pdf_files)