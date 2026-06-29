"""PPTX 슬라이드를 PNG로 내보내는 임시 검수용 스크립트 (PowerPoint COM 자동화).
사용법: .venv/Scripts/python.exe scripts/export_slides.py <pptx경로> <출력폴더>
사용법 예시 : .venv/Scripts/python.exe scripts/export_slides.py "out/Project_Monarch_슬라이드_템플릿_검수용_grid.pptx" out/images
"""

import sys
import os
import time
import comtypes.client


def export(pptx_path, out_dir):
    pptx_path = os.path.abspath(pptx_path)
    out_dir = os.path.abspath(out_dir)
    os.makedirs(out_dir, exist_ok=True)

    powerpoint = comtypes.client.CreateObject("PowerPoint.Application")
    powerpoint.Visible = 1
    presentation = None
    last_err = None
    for attempt in range(3):
        try:
            presentation = powerpoint.Presentations.Open(pptx_path, WithWindow=True)
            break
        except Exception as e:
            last_err = e
            time.sleep(1.5)
    if presentation is None:
        powerpoint.Quit()
        raise last_err

    presentation.SaveAs(out_dir, 18)  # 18 = ppSaveAsPNG, exports per-slide
    presentation.Close()
    powerpoint.Quit()


if __name__ == "__main__":
    export(sys.argv[1], sys.argv[2])
