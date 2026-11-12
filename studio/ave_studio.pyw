"""Local reel preview with the installed DeepSeek Harness runtime."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog


def main():
    window = tk.Tk()
    window.withdraw()
    window.title("Ave Studio")
    binary = shutil.which("dsh") or shutil.which("dsh", path=str(Path(sys.executable).parent))
    if not binary or not shutil.which("ffmpeg"):
        messagebox.showerror("Ave Studio", "Installa il runtime dsh e FFmpeg come indicato nella guida di Ave Studio.")
        return
    clip = filedialog.askopenfilename(title="Scegli la clip da montare", filetypes=[("Video", "*.mp4 *.mov *.m4v *.MP4 *.MOV *.M4V")])
    if not clip:
        return
    destination = filedialog.askdirectory(title="Dove vuoi salvare il reel e la copertina?")
    if not destination:
        return
    start = simpledialog.askfloat("Ave Studio", "Da quale secondo vuoi iniziare?", initialvalue=0, minvalue=0)
    if start is None:
        return
    duration = simpledialog.askinteger("Ave Studio", "Quanti secondi vuoi tenere? (1–60)", initialvalue=15, minvalue=1, maxvalue=60)
    if duration is None:
        return
    caption = simpledialog.askstring("Ave Studio", "Testo sul video (facoltativo, massimo 160 caratteri)")
    if caption is None:
        return
    if len(caption) > 160:
        messagebox.showerror("Ave Studio", "Il testo supera i 160 caratteri.")
        return
    with tempfile.TemporaryDirectory() as home:
        shutil.copytree(Path(__file__).parent / "profiles", Path(home) / "profiles", ignore=shutil.ignore_patterns("cordis.yml"))
        env = {**os.environ, "DSH_HOME": home, "AVE_INPUT": str(Path(clip).parent),
               "AVE_LOCAL_SOURCE": Path(clip).name, "AVE_OUTPUT": destination, "AVE_START": str(start),
               "AVE_WINDOW": "1", "AVE_DURATION": str(duration), "AVE_CAPTION": caption}
        env.pop("AVE_DEVICE_TOKEN", None)
        window.deiconify()
        tk.Label(window, text="Sto preparando il reel e la copertina…", padx=36, pady=24).pack()
        proc = subprocess.Popen([binary, "--profile", "avely-studio"], env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                stderr=subprocess.DEVNULL, text=True)

        def cancel():
            window.quit()

        def check():
            if proc.poll() is None:
                window.after(200, check)
                return
            if proc.returncode == 0:
                video = Path(destination) / json.loads(proc.stdout.read().strip().splitlines()[-1])["video"]
                messagebox.showinfo("Ave Studio", f"Reel e copertina pronti in\n{video.parent}")
            else:
                messagebox.showerror("Ave Studio", "Esportazione interrotta. Controlla che la clip sia leggibile e il punto di inizio sia dentro il video.")
            window.quit()

        window.protocol("WM_DELETE_WINDOW", cancel)
        window.after(200, check)
        try:
            window.mainloop()
        finally:
            proc.stdin.close()
            proc.wait()
            proc.stdout.close()


if __name__ == "__main__":
    main()
