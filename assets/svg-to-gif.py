import asyncio
import time
import os
from playwright.async_api import async_playwright
from PIL import Image
import io

async def capture_svg_animation(svg_file, output_gif, loop_duration=3.0, fps=30):
    frames = []
    target_frame_count = int(loop_duration * fps)
    frame_delay_ms = int(1000 / fps)
    print("Launching headless browser...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 640})
        file_url = f"file://{os.path.abspath(svg_file)}"
        await page.goto(file_url)
        print(f"Slowing down SVG animations to a {loop_duration}s loop...")
        await page.evaluate(f'''() => {{
            document.querySelectorAll('animate').forEach(el => {{
                el.setAttribute('dur', '{loop_duration}s');
            }});
        }}''')
        print(f"Recording {target_frame_count} frames...")
        for _ in range(target_frame_count):
            start_time = time.time()
            screenshot = await page.screenshot()
            img = Image.open(io.BytesIO(screenshot)).convert("RGB")
            quantized_img = img.quantize(
                colors=256, 
                method=Image.Quantize.MAXCOVERAGE, 
                dither=Image.Dither.NONE
            )
            frames.append(quantized_img)
            elapsed = (time.time() - start_time) * 1000
            sleep_time = max(0, frame_delay_ms - elapsed)
            await page.wait_for_timeout(sleep_time)
        await browser.close()
    print("Stitching frames into GIF...")
    frames[0].save(
        output_gif,
        save_all=True,
        append_images=frames[1:],
        duration=frame_delay_ms,
        loop=0, 
        optimize=True
    )
    print(f"Saved")

if __name__ == "__main__":
    asyncio.run(capture_svg_animation(
        svg_file="header2.svg",
        output_gif="awesome-ai-devtools-social-preview.gif",
        loop_duration=3.0, 
        fps=30
    ))