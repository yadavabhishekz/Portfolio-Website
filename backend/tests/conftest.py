import sys
from pathlib import Path

# Make backend modules (main, retriever, tools, ...) importable from tests/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
