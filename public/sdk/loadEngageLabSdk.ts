// Define la interfaz según los métodos/propiedades que exponga MTpushInterface
// Extiende el tipo Window para incluir JGSDK

declare global {
    interface Window {
        MTpushInterface?: {
            init?: (options: Record<string, unknown>) => unknown;
            register?: () => void;
            [key: string]: unknown;
        };
    }
}

export function loadEngageLabSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.MTpushInterface) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "/sdk/webSdk.produce.min.3.3.4.js";
        script.async = true;

        script.onload = () => {
            if (window.MTpushInterface) {
                resolve();
            } else {
                reject("SDK cargado pero MTpushInterface no existe");
            }
        };

        script.onerror = reject;

        document.body.appendChild(script);
    });
}
