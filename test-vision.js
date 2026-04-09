require("dotenv").config({ path: ".env.local" });
const vision = require("@google-cloud/vision");

async function test() {
  try {
    console.log("Parsing credentials...");
    const creds = JSON.parse(process.env.GCP_SA_KEY_JSON.replace(/^'|'$/g, ''));
    console.log("Client Email:", creds.client_email);
    console.log("Private key start:", creds.private_key.substring(0, 30));
    
    const client = new vision.ImageAnnotatorClient({ credentials: creds });
    console.log("Client initialized successfully.");
    
    // Test a bogus image buffer
    const [result] = await client.safeSearchDetection(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"));
    console.log("Vision API successful:", result.safeSearchAnnotation);
  } catch (err) {
    console.error("VISION TEST ERROR:", err);
  }
}
test();
