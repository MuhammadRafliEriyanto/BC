from __future__ import annotations

import runpy
import shutil
import sys
import tempfile
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASE_TEMP = ROOT / ".tmp" / "docx-render-workspace-temp"
RENDER_SCRIPT = Path(
    r"C:\Users\LENOVO\.codex\plugins\cache\openai-primary-runtime\documents\26.614.11602\skills\documents\render_docx.py"
)
INPUT_DOCX = ROOT / "manual-book" / "Manual_Book_Bimbel_LMS_All_Roles.docx"
OUTPUT_DIR = ROOT / "manual-book" / "rendered"


class WorkspaceTemporaryDirectory:
    def __init__(self, suffix=None, prefix=None, dir=None, ignore_cleanup_errors=False):
        del suffix, dir, ignore_cleanup_errors
        BASE_TEMP.mkdir(parents=True, exist_ok=True)
        safe_prefix = prefix or "tmp_"
        self.name = str(BASE_TEMP / f"{safe_prefix}{uuid.uuid4().hex}")

    def __enter__(self):
        Path(self.name).mkdir(parents=True, exist_ok=True)
        return self.name

    def __exit__(self, exc_type, exc, tb):
        shutil.rmtree(self.name, ignore_errors=True)
        return False

    def cleanup(self):
        shutil.rmtree(self.name, ignore_errors=True)


if __name__ == "__main__":
    tempfile.TemporaryDirectory = WorkspaceTemporaryDirectory
    tempfile.tempdir = str(BASE_TEMP)
    sys.argv = [
        str(RENDER_SCRIPT),
        str(INPUT_DOCX),
        "--output_dir",
        str(OUTPUT_DIR),
        "--emit_pdf",
    ]
    runpy.run_path(str(RENDER_SCRIPT), run_name="__main__")
