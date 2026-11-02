"""Kleine lokale Oberfläche für den einmaligen Stadtliga-Abruf."""
import threading,queue,tkinter as tk
from tkinter import ttk
from pathlib import Path
import importlib.util

if __name__=='__main__':
    spec=importlib.util.spec_from_file_location('city_import',Path(__file__).with_name('import-stadtliga.py'))
    importer=importlib.util.module_from_spec(spec);spec.loader.exec_module(importer)
    app=tk.Tk();app.title('Fan-Ticker · Stadtliga aktualisieren');app.geometry('580x380');app.minsize(580,380)
    app.configure(bg='#f4f6f9')
    frame=tk.Frame(app,bg='#f4f6f9',padx=25,pady=22);frame.pack(fill='both',expand=True)
    tk.Label(frame,text='Stadtliga aktualisieren',font=('Segoe UI',19,'bold'),fg='#052148',bg='#f4f6f9').pack(anchor='w')
    status=tk.StringVar(value='Die Spielpläne werden einmalig abgerufen …')
    tk.Label(frame,textvariable=status,font=('Segoe UI',11),fg='#052148',bg='#f4f6f9',wraplength=515,justify='left').pack(anchor='w',pady=(16,12))
    progress=ttk.Progressbar(frame,mode='indeterminate');progress.pack(fill='x');progress.start()
    note=tk.Label(frame,text='Noch keine Veröffentlichung: Nach erfolgreichem Abruf bitte in GitHub Desktop committen und pushen.',font=('Segoe UI',10),fg='#61738a',bg='#f4f6f9',wraplength=515,justify='left');note.pack(anchor='w',pady=14)
    actions=tk.Frame(frame,bg='#f4f6f9');actions.pack(anchor='e')
    messages=queue.Queue()
    def fetch():
        try:messages.put((True,importer.run_import()))
        except Exception as error:messages.put((False,str(error)))
    def poll():
        try:ok,text=messages.get_nowait()
        except queue.Empty:app.after(100,poll);return
        progress.stop();progress.pack_forget()
        status.set(('Erfolgreich gespeichert.\n\n' if ok else 'Abruf fehlgeschlagen.\n\n')+text)
        if ok:
            note.configure(text='Jetzt in GitHub Desktop committen und pushen! Erst danach sind die Änderungen online sichtbar.',font=('Segoe UI',12,'bold'),fg='#052148',bg='#e8f3d8',padx=12,pady=12)
        else:note.configure(text='Die vorhandenen Daten bleiben erhalten. Bitte später erneut versuchen oder den lokalen PDF-Import verwenden.')
        ttk.Button(actions,text='Schließen',command=app.destroy).pack()
    threading.Thread(target=fetch,daemon=True).start();app.after(100,poll);app.mainloop()
