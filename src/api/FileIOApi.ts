interface FileIoResponse {
    success: boolean;
    link: string;
    id: string;
    key: string;
    expires: string;
    maxDownloads: number;
    autoDelete: boolean;
  // ... otros campos
}

export async function uploadToFileIo(
    file: Blob | File,
    options?: {
        expires?: string;        // por ejemplo "30d" o fecha ISO
        maxDownloads?: number;    // ej. 3
        autoDelete?: boolean;     // true/false
    }
): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    if (options?.expires) fd.append("expires", options.expires);
    if (options?.maxDownloads !== undefined) fd.append("maxDownloads", options.maxDownloads.toString());
    if (options?.autoDelete !== undefined) fd.append("autoDelete", options.autoDelete ? "true" : "false");

    const resp = await fetch("https://file.io", {
        method: "POST",
        body: fd
    });

    if (!resp.ok) {
        throw new Error(`file.io upload error: ${resp.status}`);
    }

    const json = await resp.json() as FileIoResponse;

    if (!json.success) {
        throw new Error(`file.io responded success=false`);
    }

    return json.link;
}
