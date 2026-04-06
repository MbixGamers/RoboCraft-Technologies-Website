import { useState } from "react";
import { ArrowLeft, Tag, Cpu, FileCode, List, Package, CircuitBoard, AlertCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { projectCategories } from "../data/projects";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";

function findProject(projectId) {
  for (const cat of projectCategories) {
    for (const sub of cat.subCategories) {
      const proj = sub.projects.find((p) => p.id === projectId);
      if (proj) return { project: proj, category: cat, subCategory: sub };
    }
  }
  return null;
}

const difficultyColor = {
  Beginner: "text-green-400 bg-green-500/10 border-green-500/30",
  Intermediate: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Advanced: "text-red-400 bg-red-500/10 border-red-500/30",
};

const TABS = [
  { id: "overview", label: "Overview", icon: FileCode },
  { id: "schematic", label: "Schematic", icon: CircuitBoard },
  { id: "steps", label: "Steps & Procedure", icon: List },
  { id: "materials", label: "Materials", icon: Package },
  { id: "code", label: "Code", icon: FileCode },
];

const projectContent = {
  "rfid-attendance-google-sheets": {
    steps: [
      {
        step: 1,
        title: "Set up Google Apps Script",
        detail:
          "Open Google Sheets, create a new spreadsheet with columns: Timestamp, UID, Name. Go to Extensions → Apps Script and paste the web app script. Deploy it as a web app with access set to 'Anyone'.",
      },
      {
        step: 2,
        title: "Wire the MFRC522 to ESP8266",
        detail:
          "Connect the MFRC522 RFID module to the ESP8266: SDA → D2, SCK → D5, MOSI → D7, MISO → D6, RST → D1, 3.3V → 3.3V, GND → GND. Add a green LED to D3 and a buzzer to D4.",
      },
      {
        step: 3,
        title: "Install Arduino Libraries",
        detail:
          "In Arduino IDE, install the MFRC522 library by GithubCommunity and the ESP8266WiFi library. Set the board to 'NodeMCU 1.0 (ESP-12E Module)' and baud rate to 115200.",
      },
      {
        step: 4,
        title: "Configure WiFi & Google Script URL",
        detail:
          "In the sketch, replace WIFI_SSID and WIFI_PASSWORD with your network credentials. Paste the deployed Google Apps Script web app URL into the GOOGLE_SCRIPT_URL constant.",
      },
      {
        step: 5,
        title: "Upload & Test",
        detail:
          "Upload the sketch to the ESP8266. Open the Serial Monitor at 115200 baud. Tap an RFID card — the UID should appear in the monitor and a new row should be logged in your Google Sheet within seconds.",
      },
    ],
    materials: [
      { name: "ESP8266 NodeMCU", qty: "1", note: "Any NodeMCU v2 or v3" },
      { name: "MFRC522 RFID Module", qty: "1", note: "Includes RFID card & key fob" },
      { name: "RFID Cards / Tags", qty: "2+", note: "125 kHz or 13.56 MHz" },
      { name: "Green LED", qty: "1", note: "Scan success indicator" },
      { name: "Active Buzzer", qty: "1", note: "Scan audio feedback" },
      { name: "220Ω Resistor", qty: "1", note: "For LED current limiting" },
      { name: "Breadboard", qty: "1", note: "Full or half size" },
      { name: "Jumper Wires", qty: "15+", note: "Male-to-male" },
      { name: "USB Micro-B Cable", qty: "1", note: "For programming & power" },
    ],
    code: `#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// ── WiFi credentials ──────────────────────────────
const char* WIFI_SSID     = "YourWiFiName";
const char* WIFI_PASSWORD = "YourPassword";

// ── Google Apps Script web-app URL ────────────────
const char* GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// ── MFRC522 pins (NodeMCU) ────────────────────────
#define SS_PIN  D2   // SDA
#define RST_PIN D1

#define LED_PIN    D3
#define BUZZER_PIN D4

MFRC522 rfid(SS_PIN, RST_PIN);
WiFiClientSecure client;

// ── Authorised UIDs → names ───────────────────────
struct Card { String uid; String name; };
Card authorisedCards[] = {
  { "A1B2C3D4", "Alice Johnson" },
  { "E5F6A7B8", "Bob Smith"    },
};
const int CARD_COUNT = sizeof(authorisedCards) / sizeof(Card);

// ─────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  pinMode(LED_PIN,    OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());
  Serial.println("Ready — place RFID card...");

  client.setInsecure(); // skip SSL cert check for simplicity
}

// ─────────────────────────────────────────────────
void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial())
    return;

  // Build UID string
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  Serial.println("Card UID: " + uid);

  // Look up name
  String name = "Unknown";
  for (int i = 0; i < CARD_COUNT; i++) {
    if (authorisedCards[i].uid == uid) {
      name = authorisedCards[i].name;
      break;
    }
  }
  Serial.println("Name: " + name);

  // Blink LED + buzzer
  digitalWrite(LED_PIN,    HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(LED_PIN,    LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Send to Google Sheets
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(GOOGLE_SCRIPT_URL)
                 + "?uid="  + uid
                 + "&name=" + name;
    http.begin(client, url);
    int code = http.GET();
    Serial.println("HTTP response: " + String(code));
    http.end();
  } else {
    Serial.println("WiFi lost — not logging.");
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(1000); // debounce
}`,
    schematicNotes: [
      "MFRC522 SDA  → NodeMCU D2",
      "MFRC522 SCK  → NodeMCU D5",
      "MFRC522 MOSI → NodeMCU D7",
      "MFRC522 MISO → NodeMCU D6",
      "MFRC522 RST  → NodeMCU D1",
      "MFRC522 3.3V → NodeMCU 3V3",
      "MFRC522 GND  → NodeMCU GND",
      "Green LED (+) → 220Ω → D3, (−) → GND",
      "Buzzer (+) → D4, (−) → GND",
    ],
  },
};

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const result = findProject(projectId);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Link to="/projects" className="text-orange-400 hover:text-orange-300">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const { project, category, subCategory } = result;
  const content = projectContent[projectId];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 px-4 sm:px-6 lg:px-8 pb-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
          <span>/</span>
          <button
            onClick={() => navigate(`/projects?expand=${category.id}`)}
            className="hover:text-white transition-colors"
          >
            {category.name}
          </button>
          <span>/</span>
          <button
            onClick={() => navigate(`/projects?expand=${category.id}`)}
            className="hover:text-white transition-colors"
          >
            {subCategory.name}
          </button>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="mb-8 animate-in slide-in-from-bottom duration-700">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                difficultyColor[project.difficulty]
              }`}
            >
              <Cpu className="w-3 h-3" />
              {project.difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 bg-orange-500/10">
              {subCategory.name}
            </span>
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 bg-white/5 border border-white/10"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
              {project.name}
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto pb-1 animate-in slide-in-from-bottom duration-700 delay-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-150">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span> About This Project
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  {project.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Platform</p>
                    <p className="text-sm font-medium text-orange-400">{project.platform}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                    <p className={`text-sm font-medium ${difficultyColor[project.difficulty].split(" ")[0]}`}>
                      {project.difficulty}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🧩</span> What You'll Build
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">▸</span>
                    RFID card scanner that reads card UIDs in real-time
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">▸</span>
                    WiFi-connected ESP8266 sending data over HTTPS
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">▸</span>
                    Google Apps Script web app receiving attendance logs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">▸</span>
                    Google Sheet auto-populated with timestamp, UID, and name
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">▸</span>
                    LED + buzzer feedback on each successful scan
                  </li>
                </ul>
              </div>

              <div className="sm:col-span-2 bg-slate-900/50 border border-orange-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> How It Works
                </h3>
                <div className="grid sm:grid-cols-4 gap-3">
                  {[
                    { step: "1", label: "Tap Card", desc: "RFID card is placed near MFRC522 reader" },
                    { step: "2", label: "Read UID", desc: "ESP8266 reads the unique card identifier" },
                    { step: "3", label: "Send via WiFi", desc: "HTTP GET sent to Google Apps Script URL" },
                    { step: "4", label: "Log to Sheet", desc: "Script writes timestamp, UID & name to Sheets" },
                  ].map((item) => (
                    <div key={item.step} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                        {item.step}
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCHEMATIC */}
          {activeTab === "schematic" && (
            <div className="space-y-4">
              {/* Diagram placeholder */}
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-10 text-center">
                <CircuitBoard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Circuit Diagram</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Schematic image will be uploaded here. Use the wiring guide below to assemble your circuit.
                </p>
              </div>

              {/* Wiring table */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">🔌</span> Wiring Connections
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-2 pr-6 text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Connection
                        </th>
                        <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {content.schematicNotes.map((note, i) => {
                        const [from, to] = note.split("→").map((s) => s.trim());
                        return (
                          <tr key={i} className="group hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-6">
                              <code className="text-orange-400 font-mono text-xs bg-orange-500/10 px-2 py-0.5 rounded">
                                {from}
                              </code>
                            </td>
                            <td className="py-3">
                              <span className="text-gray-300">→ {to}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEPS */}
          {activeTab === "steps" && (
            <div className="space-y-4">
              {content.steps.map((item) => (
                <div
                  key={item.step}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-6 flex gap-4 hover:border-orange-500/20 transition-colors duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-base flex items-center justify-center group-hover:bg-orange-500/25 transition-colors">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1.5">{item.title}</h4>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MATERIALS */}
          {activeTab === "materials" && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-400" />
                  Components List — {content.materials.length} items
                </h3>
              </div>
              <div className="divide-y divide-slate-800/50">
                {content.materials.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-orange-400">{item.qty}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      {item.note && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CODE */}
          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-gray-400 font-mono">rfid_attendance.ino</span>
                <span className="text-xs text-gray-600">C++ / Arduino</span>
              </div>
              <div className="relative bg-gray-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400">rfid_attendance.ino</span>
                </div>
                <SyntaxHighlighter
                  language="cpp"
                  style={nightOwl}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    fontSize: "0.78rem",
                    lineHeight: "1.6",
                    padding: "1.25rem",
                  }}
                >
                  {content.code}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>

        {/* Back nav */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <button
            onClick={() => navigate(`/projects?expand=${category.id}`)}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to {category.name} projects</span>
          </button>
        </div>
      </div>
    </div>
  );
}
