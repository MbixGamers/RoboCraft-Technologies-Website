export const codeExamples = {
  "blink.ino": `#include <Arduino.h>

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboCraft: LED Blink");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(1000); // LED ON
  digitalWrite(LED_PIN, LOW);
  delay(1000); // LED OFF
}`,

  "servo.ino": `#include <Servo.h>

Servo myServo;
const int SERVO_PIN = 9;

void setup() {
  myServo.attach(SERVO_PIN);
  Serial.begin(9600);
  Serial.println("Servo Control Ready");
}

void loop() {
  for (int pos = 0; pos <= 180; pos++) {
    myServo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos--) {
    myServo.write(pos);
    delay(15);
  }
}`,

  "wifi.ino": `#include <ESP8266WiFi.h>

const char* SSID     = "YourNetwork";
const char* PASSWORD = "YourPassword";

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected!");
  Serial.println(WiFi.localIP());
}

void loop() {
  // IoT logic here
}`,
};

export const floatingCards = {
  "blink.ino": {
    bgColor: "bg-orange-500/20",
    iconColor: "text-orange-400",
    textColor: "text-orange-300",
    contentColor: "text-gray-300",
    icon: "⚡",
    title: "Output Ready",
    content: "LED blinking at 1 Hz — circuit verified",
  },
  "servo.ino": {
    bgColor: "bg-green-500/20",
    iconColor: "text-green-400",
    textColor: "text-green-300",
    contentColor: "text-gray-300",
    icon: "⚙️",
    title: "Servo Sweep",
    content: "180° cycle running — torque: 2.5 kg/cm",
  },
  "wifi.ino": {
    bgColor: "bg-blue-500/20",
    iconColor: "text-blue-400",
    textColor: "text-blue-300",
    contentColor: "text-gray-300",
    icon: "📡",
    title: "WiFi Connected",
    content: "IP: 192.168.1.42 — Signal: -62 dBm",
  },
};
