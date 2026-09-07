
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "No disponible";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function row(nombre, valor) {
    return `
        <tr>
            <td style="
                padding:8px;
                border-bottom:1px solid #ddd;
                font-weight:bold;
                width:220px;
            ">
                ${escapeHtml(nombre)}
            </td>
            <td style="
                padding:8px;
                border-bottom:1px solid #ddd;
            ">
                ${escapeHtml(valor)}
            </td>
        </tr>
    `;
}

function section(titulo, contenido) {
    return `
        <h2 style="
            background:#222;
            color:white;
            padding:10px;
            margin-top:25px;
            font-size:18px;
        ">
            ${escapeHtml(titulo)}
        </h2>

        <table style="
            width:100%;
            border-collapse:collapse;
            font-family:Arial,sans-serif;
            font-size:14px;
        ">
            ${contenido}
        </table>
    `;
}

function buildEmail(data) {

    const device = data.device || {};
    const screen = data.screen || {};
    const browser = data.browser || {};
    const gpu = data.gpu || {};
    const network = data.network || {};
    const ip = data.ip || {};
    const location = data.location || {};
    const capabilities = data.capabilities || {};
    const privacy = data.privacy || {};

    let deviceRows = "";

    deviceRows += row("Tipo de dispositivo", device.type);
    deviceRows += row("Plataforma", device.platform);
    deviceRows += row("Sistema operativo", device.os);
    deviceRows += row("Arquitectura", device.architecture);
    deviceRows += row("CPU / núcleos lógicos", device.cpuCores);
    deviceRows += row("RAM estimada", device.ram);
    deviceRows += row("Touchscreen", device.touch);
    deviceRows += row("Máximo de puntos táctiles", device.maxTouchPoints);

    let screenRows = "";

    screenRows += row("Resolución", screen.resolution);
    screenRows += row("Resolución disponible", screen.availableResolution);
    screenRows += row("Pixel Ratio", screen.pixelRatio);
    screenRows += row("Orientación", screen.orientation);
    screenRows += row("Profundidad de color", screen.colorDepth);
    screenRows += row("Profundidad de píxel", screen.pixelDepth);

    let browserRows = "";

    browserRows += row("Navegador", browser.name);
    browserRows += row("User Agent", browser.userAgent);
    browserRows += row("Idioma", browser.language);
    browserRows += row("Idiomas", browser.languages);
    browserRows += row("Zona horaria", browser.timezone);

    let gpuRows = "";

    gpuRows += row("GPU Vendor", gpu.vendor);
    gpuRows += row("GPU Renderer", gpu.renderer);
    gpuRows += row("WebGL", gpu.webgl);
    gpuRows += row("WebGL2", gpu.webgl2);
    gpuRows += row("GLSL", gpu.glsl);
    gpuRows += row("Máxima textura", gpu.maxTextureSize);
    gpuRows += row("Viewport máximo", gpu.maxViewport);

    let networkRows = "";

    networkRows += row("Conexión", network.connection);
    networkRows += row("Tipo efectivo", network.effectiveType);
    networkRows += row("Downlink", network.downlink);
    networkRows += row("RTT", network.rtt);
    networkRows += row("Online", network.online);

    let ipRows = "";

    ipRows += row("IP pública", ip.ip);
    ipRows += row("Continente", ip.continent);
    ipRows += row("País", ip.country);
    ipRows += row("Código país", ip.countryCode);
    ipRows += row("Región", ip.region);
    ipRows += row("Ciudad", ip.city);
    ipRows += row("Código postal", ip.postal);
    ipRows += row("Zona horaria", ip.timezone);
    ipRows += row("Organización", ip.org);
    ipRows += row("ASN", ip.asn);
    ipRows += row("Hostname", ip.hostname);
    ipRows += row("Latitud aproximada", ip.latitude);
    ipRows += row("Longitud aproximada", ip.longitude);

    let locationRows = "";

    locationRows += row("Latitud GPS", location.latitude);
    locationRows += row("Longitud GPS", location.longitude);
    locationRows += row("Precisión", location.accuracy);
    locationRows += row("Altitud", location.altitude);
    locationRows += row("Precisión de altitud", location.altitudeAccuracy);
    locationRows += row("Dirección", location.heading);
    locationRows += row("Velocidad", location.speed);
    locationRows += row("Fecha/Hora", location.timestamp);

    if (location.mapsUrl) {
        locationRows += row(
            "Google Maps",
            `<a href="${escapeHtml(location.mapsUrl)}">Abrir ubicación</a>`
        );
    }

    let capabilityRows = "";

    Object.entries(capabilities).forEach(([key, value]) => {
        capabilityRows += row(key, value ? "Disponible" : "No disponible");
    });

    let privacyRows = "";

    privacyRows += row("Cookies habilitadas", privacy.cookies);
    privacyRows += row("Do Not Track", privacy.doNotTrack);
    privacyRows += row("Estado de conexión", privacy.online);

    return `
<!DOCTYPE html>
<html lang="es">

<head>
<meta charset="UTF-8">
<title>Reporte de dispositivo</title>
</head>

<body style="
    margin:0;
    padding:20px;
    background:#f3f3f3;
    font-family:Arial,sans-serif;
">

<div style="
    max-width:900px;
    margin:auto;
    background:white;
    padding:25px;
    border-radius:10px;
">

<h1 style="margin-top:0;">
    📋 Reporte de dispositivo
</h1>

<p>
    Se generó un nuevo reporte desde la aplicación.
</p>

${section("🖥️ Device Information", deviceRows)}

${section("🖥️ Screen Information", screenRows)}

${section("🌐 Browser Information", browserRows)}

${section("🎮 GPU / WebGL", gpuRows)}

${section("📡 Network Information", networkRows)}

${section("🌎 IP Information", ipRows)}

${section("📍 GPS Information", locationRows)}

${section("🔧 Browser Capabilities", capabilityRows)}

${section("🔐 Privacy / Browser", privacyRows)}

<p style="
    margin-top:30px;
    color:#777;
    font-size:12px;
">
    Este reporte contiene únicamente información proporcionada por las APIs
    disponibles en el navegador y los permisos concedidos por el usuario.
</p>

</div>

</body>
</html>
`;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE) === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.get("/api/status", (req, res) => {
    res.json({
        ok: true,
        message: "Servidor funcionando correctamente"
    });
});

app.post("/api/report", async (req, res) => {

    try {

        const data = req.body;

        if (!data || typeof data !== "object") {
            return res.status(400).json({
                ok: false,
                error: "Datos inválidos"
            });
        }

        const deviceName =
            data.device?.platform ||
            data.device?.type ||
            "Dispositivo desconocido";

        const publicIP =
            data.ip?.ip ||
            "IP desconocida";

        const html = buildEmail(data);

        await transporter.sendMail({

            from: `"Device Scanner" <${process.env.SMTP_USER}>`,

            to: process.env.REPORT_TO,

            subject:
                `📋 Nuevo reporte - ${deviceName} - ${publicIP}`,

            html: html
        });

        console.log("Reporte enviado correctamente.");

        res.json({
            ok: true,
            message: "Reporte enviado correctamente"
        });

    } catch (error) {

        console.error(
            "Error enviando correo:",
            error.message
        );

        res.status(500).json({
            ok: false,
            error: "No se pudo enviar el reporte"
        });
    }
});

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("       DEVICE SCANNER SERVER");
    console.log("======================================");
    console.log("");
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log("");
});
