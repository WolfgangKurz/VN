# Starling Atlas generation: make_starling_atlas.py
# Recursively loads images from directory and arranges them into one big png file with xml decription
# Reqirement: PIL
# ported from https://github.com/Gamua/Sparrow-Framework/blob/master/sparrow/util/atlas_generator/generate_atlas.rb
# ********* ************* *******
# MODIFIED by Wolfgang Kurz (to simplified json)

import json
import sys
import os
from PIL import Image


if len(sys.argv) < 3:
    print('Error: Not enough parameters')
    print('Usage: python3 make_starling_atlas.py <src_folderPath> <target_json_filePath> <optional_options> ')
    print('Option: --scale <scale_factor>')
    print('Option: --padding <padding_in_pixels>')
    print('Option: --maxsize <WIDTHxHEIGHT>')
    sys.exit(0)

scr_folder = sys.argv[1]
trg_filepath_json = sys.argv[2]
if not os.path.exists(scr_folder):
    print('Error: input folder does not exist:', scr_folder)
if not os.path.exists(os.path.dirname(trg_filepath_json)):
    print('Error: Output folder does not exist:', trg_filepath_json)
    sys.exit(0)

opts = {"scale": 1.0, "padding": 1, "maxsize": [4096, 4096]}
for i, arg in enumerate(sys.argv):
    if arg == "--scale" and (i+1) < len(sys.argv):
        opts["scale"] = float(sys.argv[i+1])
    if arg == "--padding" and (i+1) < len(sys.argv):
        opts["padding"] = int(float(sys.argv[i+1]))
    if arg == "--maxsize" and (i+1) < len(sys.argv):
        maxsizePair = sys.argv[i+1].split("x")
        opts["maxsize"][0] = int(float(maxsizePair[0]))
        opts["maxsize"][1] = int(float(maxsizePair[1]))

print("- source:", scr_folder)
print("- target:", trg_filepath_json)
print("- opts:", opts)

# ********* ************* *******


def allFilesWithSubd(path, extensions):
    # exr_files = os.listdir(exr_folder) # not recursive
    files = []
    # r=root, d=directories, f = files
    for r, d, f in os.walk(path):
        for file_name in f:
            for extn in extensions:
                if '.'+extn.lower() in file_name.lower():
                    files.append(os.path.join(r, file_name))
                    break
    return files


def fileNameNoExt(filepath):
    img_path = filepath
    img_base = os.path.basename(img_path)
    # image name, no extension
    return os.path.splitext(img_base)[0]


class Rectangle:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height


class TextureNode:
    def __init__(self, x, y, width, height):
        self.Orect = Rectangle(x, y, width, height)
        self.Oimage = None
        self.Ochildren = []

    def insert_image(self, image, scale, padding):
        if self.Oimage is None:
            img_width = int(image.width * scale + padding*2)
            img_height = int(image.height * scale + padding*2)
            if (img_width <= self.Orect.width and img_height <= self.Orect.height):
                self.Oimage = image
                self.Ochildren = []
                rest_width = self.Orect.width - img_width
                rest_height = self.Orect.height - img_height
                if (rest_width > rest_height):
                    tn = TextureNode(self.Orect.x, self.Orect.y + img_height, img_width, self.Orect.height - img_height)
                    self.Ochildren.append(tn)
                    tn = TextureNode(self.Orect.x + img_width, self.Orect.y, self.Orect.width - img_width, self.Orect.height)
                    self.Ochildren.append(tn)
                else:
                    tn = TextureNode(self.Orect.x + img_width, self.Orect.y, self.Orect.width - img_width, img_height)
                    self.Ochildren.append(tn)
                    tn = TextureNode(self.Orect.x, self.Orect.y + img_height, self.Orect.width, self.Orect.height - img_height)
                    self.Ochildren.append(tn)
                return self
            else:
                return None
        else:
            new_node = self.Ochildren[0].insert_image(image, scale, padding)
            if new_node is not None:
                return new_node
            else:
                return self.Ochildren[1].insert_image(image, scale, padding)

    def image_name(self):
        if self.Oimage is None:
            return None
        return fileNameNoExt(self.Oimage.filename)

# ********* ************* *******


src_image_paths = allFilesWithSubd(scr_folder, ['png', 'jpg', 'jpeg', 'tif', 'tiff'])
print("- found images:", len(src_image_paths))
src_images = []
for img_path in src_image_paths:
    try:
        im = Image.open(img_path)
        src_images.append(im)
    except Exception as e:
        print("- error: failed to load image:", img_path)

# sorting by size: biggest first, smallest last
src_images.sort(key=lambda im: im.width*im.height, reverse=True)

# Start with a small atlas and make it bigger until all textures fit.
image_nodes = []
current_width = 32
current_height = 32
loop_count = 0
textures_fit = False
padding = opts["padding"]
ascale = opts["scale"]

while textures_fit == False:
    textures_fit = True
    root_node = TextureNode(0, 0, current_width + padding, current_height + padding)
    image_nodes = []
    for image in src_images:
        new_node = root_node.insert_image(image, ascale, padding)
        if new_node is None:
            textures_fit = False
            break
        else:
            image_nodes.append(new_node)

    if textures_fit == False:
        loop_count += 1
        if (loop_count % 3) < 2:
            current_width = int(current_width * 2)
        else:
            current_width = int(current_width / 2)
            current_height = int(current_height * 2)

if current_width > opts["maxsize"][0] or current_height > opts["maxsize"][1]:
    print("- Error: Textures did not fit into maxsize", opts["maxsize"])
    exit(0)

# Drawing atlas
image_filename = fileNameNoExt(trg_filepath_json) + ".png"
trg_filepath_png = os.path.join(os.path.dirname(trg_filepath_json), image_filename)
trg_img = Image.new('RGBA', (current_width, current_height))
for imn in image_nodes:
    im = imn.Oimage

    if abs(ascale - 1.0) > 0.01:
        size2 = (int(im.width*ascale), int(im.height*ascale))
        im = im.resize(size2, Image.ANTIALIAS)

    trg_img.paste(im, (imn.Orect.x + padding, imn.Orect.y + padding))
trg_img.save(trg_filepath_png, 'PNG')

if False:
    output = {}
    output["meta"] = {
        "image": image_filename,
        "size": {
            "w": trg_img.width,
            "h": trg_img.height
        },
        "scale": 1
    }
    output["frames"] = {}
    for imn in image_nodes:
        output["frames"][f"{imn.image_name()}.png"] = {
            "frame": {
                "x": imn.Orect.x + padding,
                "y": imn.Orect.y + padding,
                "w": int(imn.Oimage.width * ascale),
                "h": int(imn.Oimage.height * ascale),
            },
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {
                "x": 0,
                "y": 0,
                "w": int(imn.Oimage.width * ascale),
                "h": int(imn.Oimage.height * ascale),
            },
            "sourceSize": {
                "w": int(imn.Oimage.width * ascale),
                "h": int(imn.Oimage.height * ascale),
            },
        }
else:
    output = {}
    for imn in image_nodes:
        output[f"{imn.image_name()}.png"] = {
            "x": imn.Orect.x + padding,
            "y": imn.Orect.y + padding,
            "w": int(imn.Oimage.width * ascale),
            "h": int(imn.Oimage.height * ascale),
        }

# saving JSON
text_file = open(trg_filepath_json, "w")
text_file.write(json.dumps(output, ensure_ascii=False, indent="\t"))
text_file.close()
print("- Done. json:", trg_filepath_json, "png:", trg_filepath_png)
