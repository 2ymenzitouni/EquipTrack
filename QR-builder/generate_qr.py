import argparse
import json
import re
import sys
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


def load_font(size):
    for font_name in ("arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(font_name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def wrap_label(label, font, max_width, draw):
    words = label.split()
    lines = []
    current_line = ""

    for word in words:
        candidate = f"{current_line} {word}".strip()
        if current_line and draw.textbbox((0, 0), candidate, font=font)[2] > max_width:
            lines.append(current_line)
            current_line = word
        else:
            current_line = candidate

    if current_line:
        lines.append(current_line)
    return lines or [label]


def describe_changes(config):
    comments = []
    if config.get("reset") is True:
        return ["Reset all appearance settings to the app defaults"]

    theme_labels = {
        "backgroundColor": "App background",
        "background": "App background",
        "callButton": "Call button color",
        "primary": "Primary accent color",
        "primaryContainer": "Primary button color",
        "card": "Card background",
        "onSurface": "Main text color",
        "onSurfaceVariant": "Secondary text color",
    }

    for key, value in config.get("theme", {}).items():
        label = theme_labels.get(key, f"{key} color")
        comments.append(f"{label}: {value}")

    layout = config.get("layout", {})
    if "actions" in layout:
        action_layout = {
            "inline": "Action buttons side by side",
            "stacked": "Action buttons stacked",
        }.get(layout["actions"], f"Action button layout: {layout['actions']}")
        comments.append(action_layout)
    if "order" in layout:
        action_order = {
            "scan-first": "QR button appears before call button",
            "call-first": "Call button appears before QR button",
        }.get(layout["order"], f"Button order: {layout['order']}")
        comments.append(action_order)

    for original, replacement in config.get("text", {}).items():
        comments.append(f'Text: "{original}" -> "{replacement}"')

    return comments or ["No supported changes found"]


def next_config_number(output_dir):
    pattern = re.compile(r"config(\d+)\.jpg$", re.IGNORECASE)
    existing_numbers = []
    for path in output_dir.iterdir():
        match = pattern.fullmatch(path.name)
        if match:
            existing_numbers.append(int(match.group(1)))
    return max(existing_numbers, default=0) + 1


def create_labeled_qr(config_path, output_path):
    try:
        config_text = config_path.read_text(encoding="utf-8")
        config_data = json.loads(config_text)
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"{config_path.name}: {error}") from error

    if not isinstance(config_data, dict) or config_data.get("version") != 1:
        raise ValueError(f"{config_path.name}: expected a JSON object with version 1.")

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )
    qr.add_data(config_text)
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    title_font = load_font(28)
    comment_font = load_font(20)
    output_match = re.fullmatch(r"config(\d+)", output_path.stem, re.IGNORECASE)
    label = f"config {output_match.group(1)}" if output_match else output_path.stem
    draw_for_measure = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    max_label_width = max(qr_image.width - 40, 100)
    title_lines = wrap_label(label, title_font, max_label_width, draw_for_measure)
    title_line_height = draw_for_measure.textbbox((0, 0), "Ag", font=title_font)[3] + 8

    bullet_indent = 30
    comments = describe_changes(config_data)
    comment_lines = [
        wrap_label(
            comment,
            comment_font,
            max(max_label_width - bullet_indent, 100),
            draw_for_measure,
        )
        for comment in comments
    ]
    comment_line_height = draw_for_measure.textbbox((0, 0), "Ag", font=comment_font)[3] + 6
    title_height = title_line_height * len(title_lines)
    comments_height = sum(comment_line_height * len(lines) for lines in comment_lines)
    caption_height = title_height + 12 + comments_height + 16
    canvas_width = qr_image.width
    canvas = Image.new(
        "RGB",
        (canvas_width, qr_image.height + caption_height + 20),
        "white",
    )
    canvas.paste(qr_image, ((canvas_width - qr_image.width) // 2, 0))

    draw = ImageDraw.Draw(canvas)
    y = qr_image.height + 16
    for line in title_lines:
        bounds = draw.textbbox((0, 0), line, font=title_font)
        text_width = bounds[2] - bounds[0]
        draw.text(
            ((canvas_width - text_width) // 2, y),
            line,
            fill="black",
            font=title_font,
        )
        y += title_line_height

    y += 4
    for lines in comment_lines:
        draw.ellipse((24, y + 7, 32, y + 15), fill="black")
        for line in lines:
            draw.text(
                (bullet_indent + 24, y),
                line,
                fill="black",
                font=comment_font,
            )
            y += comment_line_height

    canvas.save(output_path, format="JPEG", quality=95)


def main():
    parser = argparse.ArgumentParser(
        description="Create sequential, labeled JPEG QR codes from JSON config files."
    )
    script_dir = Path(__file__).resolve().parent
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=script_dir / "configs",
        help="Folder containing configuration JSON files (default: QR-builder/configs).",
    )
    parser.add_argument(
        "--config",
        type=Path,
        help="Generate from this single JSON file instead of the input folder.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=script_dir / "output",
        help="Folder for generated JPEG QR codes (default: QR-builder/output).",
    )
    parser.add_argument(
        "--name",
        help="Save a single QR using this filename and caption instead of configN.jpg.",
    )
    args = parser.parse_args()

    if args.config:
        if not args.config.is_file():
            parser.error(f"configuration file does not exist: {args.config}")
        config_files = [args.config]
    else:
        if not args.input_dir.is_dir():
            parser.error(f"configuration folder does not exist: {args.input_dir}")
        config_files = sorted(args.input_dir.glob("*.json"), key=lambda path: path.name.lower())
    if not config_files:
        parser.error(f"no .json configuration files found in {args.input_dir}")
    if args.name and len(config_files) != 1:
        parser.error("--name can only be used when the input folder contains one JSON config.")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    config_number = next_config_number(args.output_dir)

    for config_path in config_files:
        output_name = f"{args.name}.jpg" if args.name else f"config{config_number}.jpg"
        output_path = args.output_dir / output_name
        if output_path.exists():
            print(f"Error: output already exists: {output_path}", file=sys.stderr)
            return 1
        try:
            create_labeled_qr(config_path, output_path)
        except ValueError as error:
            print(f"Error: {error}", file=sys.stderr)
            return 1
        print(f"Created {output_path} (label: {config_path.stem})")
        config_number += 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
