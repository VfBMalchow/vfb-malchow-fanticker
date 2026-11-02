"""Upstash-Zugang lokal per Windows DPAPI verschlüsselt, niemals im Repository."""
import ctypes,json,os
from pathlib import Path
from ctypes import wintypes

class Blob(ctypes.Structure):
    _fields_=[('size',wintypes.DWORD),('data',ctypes.POINTER(ctypes.c_ubyte))]
def crypt(data,decrypt=False):
    if os.name!='nt':raise RuntimeError('Lokale Zugangsspeicherung benötigt Windows.')
    source=ctypes.create_string_buffer(data);blob=Blob(len(data),ctypes.cast(source,ctypes.POINTER(ctypes.c_ubyte)));out=Blob()
    lib=ctypes.windll.crypt32
    if decrypt:
        fn=lib.CryptUnprotectData;fn.argtypes=[ctypes.POINTER(Blob),ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,wintypes.DWORD,ctypes.POINTER(Blob)]
        ok=fn(ctypes.byref(blob),None,None,None,None,1,ctypes.byref(out))
    else:
        fn=lib.CryptProtectData;fn.argtypes=[ctypes.POINTER(Blob),wintypes.LPCWSTR,ctypes.c_void_p,ctypes.c_void_p,ctypes.c_void_p,wintypes.DWORD,ctypes.POINTER(Blob)]
        ok=fn(ctypes.byref(blob),'VfB Fan-Ticker Upstash',None,None,None,1,ctypes.byref(out))
    if not ok:raise RuntimeError('Windows konnte die Zugangsdaten nicht verarbeiten.')
    try:return ctypes.string_at(out.data,out.size)
    finally:
        free=ctypes.windll.kernel32.LocalFree;free.argtypes=[ctypes.c_void_p];free.restype=ctypes.c_void_p;free(out.data)
def credential_file():return Path(os.environ['LOCALAPPDATA'])/'VfB-FanTicker'/'upstash.bin'
def get_env():
    result=os.environ.copy()
    if result.get('UPSTASH_REDIS_REST_URL') and result.get('UPSTASH_REDIS_REST_TOKEN'):return result
    p=credential_file()
    if not p.exists():raise RuntimeError('Upstash-Zugang fehlt. Bitte zuerst die Desktop-Verknüpfung öffnen und den Zugang einrichten.')
    result.update(json.loads(crypt(p.read_bytes(),True).decode('utf-8')));return result

def configure(parent,force=False):
    if not force:
        try:get_env();return True
        except Exception:pass
    import tkinter as tk
    from tkinter import ttk,messagebox
    from urllib.parse import urlparse
    dialog=tk.Toplevel(parent);dialog.title('Fan-Ticker · Upstash einmalig einrichten');dialog.geometry('610x290');dialog.transient(parent);dialog.grab_set()
    frame=ttk.Frame(dialog,padding=20);frame.pack(fill='both',expand=True)
    ttk.Label(frame,text='REST URL und normalen REST Token aus Upstash eintragen.\nLokal verschlüsselt gespeichert – nicht in GitHub veröffentlichen.',wraplength=560).pack(anchor='w',pady=(0,15))
    ttk.Label(frame,text='UPSTASH_REDIS_REST_URL').pack(anchor='w');url=tk.StringVar();ttk.Entry(frame,textvariable=url,width=75).pack(fill='x',pady=(0,10))
    ttk.Label(frame,text='UPSTASH_REDIS_REST_TOKEN').pack(anchor='w');token=tk.StringVar();ttk.Entry(frame,textvariable=token,show='•',width=75).pack(fill='x')
    success=[False]
    def save():
        raw=url.get().strip().strip('"').strip("'");secret=token.get().strip().strip('"').strip("'");parsed=urlparse(raw)
        if parsed.scheme!='https' or not parsed.hostname or not parsed.hostname.endswith('.upstash.io') or parsed.username or parsed.query or parsed.fragment or parsed.path not in ('','/') or not secret:
            messagebox.showerror('Bitte prüfen','REST URL und normalen REST Token vollständig eintragen.',parent=dialog);return
        p=credential_file();p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(crypt(json.dumps({'UPSTASH_REDIS_REST_URL':raw,'UPSTASH_REDIS_REST_TOKEN':secret}).encode()))
        success[0]=True;dialog.destroy()
    ttk.Button(frame,text='Verschlüsselt speichern',command=save).pack(anchor='e',pady=18)
    parent.wait_window(dialog);return success[0]
