import { useState } from "react";
import { ArrowLeft, Tag, Cpu, FileCode, List, Package, CircuitBoard, AlertCircle, ChevronRight } from "lucide-react";
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
  { id: "overview",   label: "Overview",          icon: FileCode    },
  { id: "schematic",  label: "Schematic",          icon: CircuitBoard },
  { id: "steps",      label: "Steps & Procedure",  icon: List        },
  { id: "materials",  label: "Materials",          icon: Package     },
  { id: "code",       label: "Code",               icon: FileCode    },
];

/* ─────────────────────────────────────────────────────────────
   CODE FILES
───────────────────────────────────────────────────────────── */
const mainCode = `//RFID Attendance + Google Sheets ~ Purnavo
#include <SPI.h>
#include <MFRC522.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <LiquidCrystal_I2C.h>
//-----------------------------------------
#define RST_PIN D3
#define SS_PIN D4
#define BUZZER D8
#define LED D0
//-----------------------------------------
MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;
MFRC522::StatusCode status;
//-----------------------------------------
/* Be aware of Sector Trailer Blocks */
int blockNum = 2;
/* Create another array to read data from Block */
/* Length of buffer should be 2 Bytes more than the size of Block (16 Bytes) */
byte bufferLen = 18;
byte readBlockData[18];
//-----------------------------------------
String card_holder_name;
const String sheet_url = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?name=";  //Enter Google Script URL

//-----------------------------------------
#define WIFI_SSID "YourWiFiName"        //Enter WiFi Name
#define WIFI_PASSWORD "YourPassword"    //Enter WiFi Password
//-----------------------------------------

//Initialize the LCD display
LiquidCrystal_I2C lcd(0x27, 16, 2);  //Change LCD Address to 0x27 if 0x3F doesnt work


/****************************************************************************************************
 * setup() function
 ****************************************************************************************************/
void setup() {
  //--------------------------------------------------
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  Initializing  ");
  for (int a = 5; a <= 10; a++) {
    lcd.setCursor(a, 1);
    lcd.print(".");
    delay(500);
  }

  //--------------------------------------------------
  //WiFi Connectivity
  Serial.println();
  Serial.print("Connecting to AP");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(200);
  }
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  //--------------------------------------------------
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
  //--------------------------------------------------
  SPI.begin();
  //--------------------------------------------------
}


/****************************************************************************************************
 * loop() function
 ****************************************************************************************************/
void loop() {
  //--------------------------------------------------
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(" Scan your Card ");
  mfrc522.PCD_Init();
  if (!mfrc522.PICC_IsNewCardPresent()) { return; }
  if (!mfrc522.PICC_ReadCardSerial())   { return; }
  //--------------------------------------------------
  Serial.println();
  Serial.println(F("Reading last data from RFID..."));
  ReadDataFromBlock(blockNum, readBlockData);

  Serial.println();
  Serial.print(F("Last data in RFID:"));
  Serial.print(blockNum);
  Serial.print(F(" --> "));
  for (int j = 0; j < 16; j++) {
    Serial.write(readBlockData[j]);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Hey " + String((char*)readBlockData) + "!");
  }
  Serial.println();
  //--------------------------------------------------
  digitalWrite(BUZZER, HIGH);
  digitalWrite(LED,    HIGH);
  delay(200);
  digitalWrite(BUZZER, LOW);
  digitalWrite(LED,    LOW);
  delay(200);
  digitalWrite(BUZZER, HIGH);
  digitalWrite(LED,    HIGH);
  delay(200);
  digitalWrite(BUZZER, LOW);
  digitalWrite(LED,    LOW);
  //--------------------------------------------------

  if (WiFi.status() == WL_CONNECTED) {
    std::unique_ptr<BearSSL::WiFiClientSecure> client(new BearSSL::WiFiClientSecure);
    client->setInsecure();
    //-----------------------------------------------------------------
    card_holder_name = sheet_url + String((char*)readBlockData);
    card_holder_name.trim();
    Serial.println(card_holder_name);

    HTTPClient https;
    Serial.print(F("[HTTPS] begin...\\n"));

    if (https.begin(*client, (String)card_holder_name)) {
      Serial.print(F("[HTTPS] GET...\\n"));
      int httpCode = https.GET();

      if (httpCode > 0) {
        Serial.printf("[HTTPS] GET... code: %d\\n", httpCode);
        lcd.setCursor(0, 1);
        lcd.print(" Data Recorded ");
        delay(2000);
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\\n", https.errorToString(httpCode).c_str());
      }
      https.end();
      delay(1000);
    } else {
      Serial.printf("[HTTPS] Unable to connect\\n");
    }
  }
}


/****************************************************************************************************
 * ReadDataFromBlock() function
 ****************************************************************************************************/
void ReadDataFromBlock(int blockNum, byte readBlockData[]) {
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));

  if (status != MFRC522::STATUS_OK) {
    Serial.print("Authentication failed for Read: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    Serial.println("Authentication success");
  }

  status = mfrc522.MIFARE_Read(blockNum, readBlockData, &bufferLen);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Reading failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    Serial.println("Block was read successfully");
  }
}`;

const appScriptCode = `//App Script for Google Sheets
var ss = SpreadsheetApp.openById('Sheet ID Here'); //Enter your Google Sheets URL Id here
var sheet = ss.getSheetByName('Sheet1');
var timezone = "Asia/Kolkata"; //Set your timezone


function doGet(e){
  Logger.log( JSON.stringify(e) );
  //------------------------------------------------------------------------
  // write_google_sheet() function in ESP8266 sketch sends data to this block
  //------------------------------------------------------------------------
  if (e.parameter == 'undefined') {
    return ContentService.createTextOutput("Received data is undefined");
  }
  //------------------------------------------------------------------------
  var Curr_Date = new Date();
  var Curr_Time = Utilities.formatDate(Curr_Date, timezone, 'HH:mm:ss');
  var name = stripQuotes(e.parameters.name);
  //------------------------------------------------------------------------
  var nextRow = sheet.getLastRow() + 1;
  sheet.getRange("A" + nextRow).setValue(Curr_Date);
  sheet.getRange("B" + nextRow).setValue(Curr_Time);
  sheet.getRange("C" + nextRow).setValue(name);
  //------------------------------------------------------------------------

  //returns response back to ESP8266
  return ContentService.createTextOutput("Card holder name is stored in column C");
}


function stripQuotes( value ) {
  return value.toString().replace(/^["']|['"]$/g, "");
}


// Extra Function — not used in this project.
// Planning to use in future projects.
// This function handles POST requests.
function doPost(e) {
  var val = e.parameter.value;

  if (e.parameter.value !== undefined){
    var range = sheet.getRange('A2');
    range.setValue(val);
  }
}`;

const registerCardCode = `//Store name into RFID Tag

#include <SPI.h>
#include <MFRC522.h>
//-----------------------------------------
constexpr uint8_t RST_PIN = D3;
constexpr uint8_t SS_PIN  = D4;
//-----------------------------------------
MFRC522 mfrc522(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;
//-----------------------------------------
/* Set the block to write data */
int blockNum = 2;
/* This is the actual data which is going to be written into the card */
byte blockData[16] = {"Alex"};  // Change the name you want to store in RFID Tag
//-----------------------------------------
byte bufferLen = 18;
byte readBlockData[18];
//-----------------------------------------
MFRC522::StatusCode status;
//-----------------------------------------

void setup()
{
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Scan a RFID Tag to write data...");
}


/****************************************************************************************************
 * loop() function
 ****************************************************************************************************/
void loop()
{
  for (byte i = 0; i < 6; i++){
    key.keyByte[i] = 0xFF;
  }

  if ( ! mfrc522.PICC_IsNewCardPresent()){ return; }
  if ( ! mfrc522.PICC_ReadCardSerial())  { return; }

  Serial.print("\\n");
  Serial.println("**Card Detected**");
  Serial.print(F("Card UID:"));
  for (byte i = 0; i < mfrc522.uid.size; i++){
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.print("\\n");
  Serial.print(F("PICC type: "));
  MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
  Serial.println(mfrc522.PICC_GetTypeName(piccType));

  Serial.print("\\n");
  Serial.println("Writing to Data Block...");
  WriteDataToBlock(blockNum, blockData);

  Serial.print("\\n");
  Serial.println("Reading from Data Block...");
  ReadDataFromBlock(blockNum, readBlockData);

  Serial.print("\\n");
  Serial.print("Data in Block:");
  Serial.print(blockNum);
  Serial.print(" --> ");
  for (int j=0 ; j<16 ; j++){
    Serial.write(readBlockData[j]);
  }
  Serial.print("\\n");
}


/****************************************************************************************************
 * WriteDataToBlock() function
 ****************************************************************************************************/
void WriteDataToBlock(int blockNum, byte blockData[])
{
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));
  if (status != MFRC522::STATUS_OK){
    Serial.print("Authentication failed for Write: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    Serial.println("Authentication success");
  }

  status = mfrc522.MIFARE_Write(blockNum, blockData, 16);
  if (status != MFRC522::STATUS_OK) {
    Serial.print("Writing to Block failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    Serial.println("Data was written into Block successfully");
  }
}


/****************************************************************************************************
 * ReadDataFromBlock() function
 ****************************************************************************************************/
void ReadDataFromBlock(int blockNum, byte readBlockData[])
{
  status = mfrc522.PCD_Authenticate(MFRC522::PICC_CMD_MF_AUTH_KEY_A, blockNum, &key, &(mfrc522.uid));

  if (status != MFRC522::STATUS_OK){
    Serial.print("Authentication failed for Read: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    Serial.println("Authentication success");
  }

  status = mfrc522.MIFARE_Read(blockNum, readBlockData, &bufferLen);
  if (status != MFRC522::STATUS_OK){
    Serial.print("Reading failed: ");
    Serial.println(mfrc522.GetStatusCodeName(status));
    return;
  } else {
    Serial.println("Block was read successfully");
  }
}`;

const codeFiles = [
  { id: "main",     label: "rfid_attendance.ino",  lang: "cpp",        hint: "C++ / Arduino",       code: mainCode        },
  { id: "appscript",label: "appscript.gs",          lang: "javascript", hint: "Google Apps Script",  code: appScriptCode   },
  { id: "register", label: "register_card.ino",     lang: "cpp",        hint: "C++ / Arduino",       code: registerCardCode},
];

/* ─────────────────────────────────────────────────────────────
   PROJECT CONTENT
───────────────────────────────────────────────────────────── */
const projectContent = {
  "rfid-attendance-google-sheets": {
    steps: [
      {
        step: 1,
        title: "Set up Google Sheets & Apps Script",
        detail:
          "Create a new Google Sheet with columns: Date (A), Time (B), Name (C). Go to Extensions → Apps Script, paste the appscript.gs code, and replace 'Sheet ID Here' with your spreadsheet's ID. Deploy as a web app with access set to 'Anyone'. Copy the deployment URL.",
      },
      {
        step: 2,
        title: "Register names onto RFID Tags",
        detail:
          "Before running the main sketch, use the register_card.ino code to write each person's name into their RFID tag's Block 2. Change the blockData array to the desired name, upload to NodeMCU, and scan the card. Repeat for each tag.",
      },
      {
        step: 3,
        title: "Wire the circuit",
        detail:
          "Connect the RC522 RFID reader (SDA→D4, SCK→D5, MOSI→D7, MISO→D6, RST→D3, 3.3V, GND). Connect the I2C LCD (GND, VCC→VIN, SDA→D2, SCL→D1). Connect LED to D0 and Buzzer to D8 with a 1K resistor to GND.",
      },
      {
        step: 4,
        title: "Install Required Libraries",
        detail:
          "In Arduino IDE, install: MFRC522 (by GithubCommunity), LiquidCrystal_I2C (by Frank de Brabander), and ESP8266 board package. Set the board to 'NodeMCU 1.0 (ESP-12E Module)' and baud rate to 9600.",
      },
      {
        step: 5,
        title: "Configure WiFi & Script URL in main sketch",
        detail:
          "Open rfid_attendance.ino. Replace WIFI_SSID and WIFI_PASSWORD with your network credentials. Paste the Google Apps Script deployment URL into the sheet_url constant. If your LCD doesn't initialize, try changing the I2C address from 0x27 to 0x3F.",
      },
      {
        step: 6,
        title: "Upload & Test",
        detail:
          "Upload the main sketch to NodeMCU. The LCD will show 'Initializing...' then 'Scan your Card'. Tap a registered RFID card — the LCD should greet the user by name, the buzzer and LED will beep/flash twice, and 'Data Recorded' will appear. Open your Google Sheet to verify the new row.",
      },
    ],
    materials: [
      { name: "NodeMCU ESP8266",      qty: "×1" },
      { name: "RC522 RFID Reader",    qty: "×1" },
      { name: "16×2 I²C LCD Display", qty: "×1" },
      { name: "RFID Tags",            qty: "×2+" },
      { name: "Buzzer",               qty: "×1" },
      { name: "LED",                  qty: "×1" },
      { name: "Breadboard",           qty: "×1" },
      { name: "Jumper Wires",         qty: "×15+" },
    ],
    schematicNotes: [
      { from: "RC522  SDA",  to: "NodeMCU D4" },
      { from: "RC522  SCK",  to: "NodeMCU D5" },
      { from: "RC522  MOSI", to: "NodeMCU D7" },
      { from: "RC522  MISO", to: "NodeMCU D6" },
      { from: "RC522  RST",  to: "NodeMCU D3" },
      { from: "RC522  3.3V", to: "NodeMCU 3V3" },
      { from: "RC522  GND",  to: "NodeMCU GND" },
      { from: "LCD    GND",  to: "NodeMCU GND" },
      { from: "LCD    VCC",  to: "NodeMCU VIN" },
      { from: "LCD    SDA",  to: "NodeMCU D2" },
      { from: "LCD    SCL",  to: "NodeMCU D1" },
      { from: "LED  Anode",  to: "NodeMCU D0 (via resistor)" },
      { from: "Buzzer  (+)", to: "NodeMCU D8 (via 1K Ω resistor)" },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab]     = useState("overview");
  const [activeCodeFile, setActiveCodeFile] = useState("main");
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
  const content  = projectContent[projectId];
  const codeFile = codeFiles.find((f) => f.id === activeCodeFile);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 px-4 sm:px-6 lg:px-8 pb-16 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-40 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate(`/projects?expand=${category.id}`)} className="hover:text-white transition-colors">{category.name}</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate(`/projects?expand=${category.id}`)} className="hover:text-white transition-colors">{subCategory.name}</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-300 truncate max-w-[180px]">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="mb-8 animate-in slide-in-from-bottom duration-700">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${difficultyColor[project.difficulty]}`}>
              <Cpu className="w-3 h-3" />
              {project.difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 bg-orange-500/10">
              {subCategory.name}
            </span>
            {project.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 bg-white/5 border border-white/10">
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

        {/* ── Tab Content ── */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-150">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span> About This Project
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.description}</p>
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
                  {[
                    "RFID card scanner reading stored names from Block 2",
                    "I²C LCD showing greeting and attendance status",
                    "WiFi-connected ESP8266 sending data over HTTPS",
                    "Google Apps Script web app receiving attendance logs",
                    "Google Sheet auto-populated with date, time & name",
                    "LED + buzzer double-beep feedback on each scan",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sm:col-span-2 bg-slate-900/50 border border-orange-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> How It Works
                </h3>
                <div className="grid sm:grid-cols-4 gap-3">
                  {[
                    { n: "1", label: "Tap Card",       desc: "RFID tag placed near RC522 reader" },
                    { n: "2", label: "Read Name",      desc: "Name read from Block 2 of the RFID tag" },
                    { n: "3", label: "Send via WiFi",  desc: "HTTPS GET sent to Google Apps Script URL" },
                    { n: "4", label: "Log to Sheet",   desc: "Script writes date, time & name to Sheets" },
                  ].map((item) => (
                    <div key={item.n} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                        {item.n}
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
              {/* Circuit diagram */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
                  <CircuitBoard className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">Circuit Diagram</span>
                </div>
                <div className="p-4">
                  <img
                    src="/rfid-circuit.png"
                    alt="RFID Attendance Circuit Diagram — RC522, NodeMCU ESP8266, I2C LCD, LED & Buzzer"
                    className="w-full rounded-xl object-contain max-h-[480px]"
                  />
                </div>
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
                        <th className="text-left py-2 pr-6 text-xs text-gray-500 font-medium uppercase tracking-wider">From</th>
                        <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {content.schematicNotes.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-6">
                            <code className="text-orange-400 font-mono text-xs bg-orange-500/10 px-2 py-0.5 rounded whitespace-nowrap">
                              {row.from}
                            </code>
                          </td>
                          <td className="py-3 text-gray-300 text-sm">{row.to}</td>
                        </tr>
                      ))}
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
                  <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-orange-400 text-center leading-tight">{item.qty}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CODE */}
          {activeTab === "code" && (
            <div className="space-y-3">
              {/* File tab selector */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {codeFiles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveCodeFile(f.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all duration-200 border ${
                      activeCodeFile === f.id
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <FileCode className="w-3 h-3" />
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Code block */}
              <div className="relative bg-gray-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-gray-400 font-mono">{codeFile.label}</span>
                  <span className="ml-auto text-xs text-gray-600">{codeFile.hint}</span>
                </div>
                <SyntaxHighlighter
                  language={codeFile.lang}
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
                  {codeFile.code}
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
