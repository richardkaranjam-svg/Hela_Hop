import fs from "node:fs";
import path from "node:path";
import { startTunnel } from "untun";

async function run() {
  console.log("🚀 Starting Cloudflare tunnel to http://localhost:3000...");

  try {
    const tunnel = await startTunnel({ port: 3000 });
    const tunnelUrl = await tunnel.getURL();

    console.log(`\n======================================================`);
    console.log(`🎉 Cloudflare Tunnel is LIVE!`);
    console.log(`🔗 Public URL: ${tunnelUrl}`);
    console.log(`📡 M-PESA Callback Webhook: ${tunnelUrl}/api/webhooks/mpesa`);
    console.log(`======================================================\n`);

    // Auto-update .env.local
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      if (/NEXT_PUBLIC_APP_URL=.*/.test(envContent)) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_APP_URL=.*/,
          `NEXT_PUBLIC_APP_URL=${tunnelUrl}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_APP_URL=${tunnelUrl}\n`;
      }
      fs.writeFileSync(envPath, envContent, "utf-8");
      console.log(`✅ Automatically updated NEXT_PUBLIC_APP_URL in .env.local`);
      console.log(`👉 Please ensure 'npm run dev' is running.\n`);
    }

    console.log("Press Ctrl+C to stop the tunnel at any time.");
  } catch (error) {
    console.error("❌ Failed to start tunnel:", error);
    process.exit(1);
  }
}

run();
