# ESP32 Loom Sensor Integration

## Connection Approach
- Use a hall-effect, inductive, or optical sensor connected to an interrupt-capable ESP32 GPIO.
- Count pulses produced by loom shaft or roller rotation.
- Convert pulses counted in a fixed interval into RPM or another speed metric.
- Connect ESP32 to Wi-Fi and send the reading to the backend over HTTP or MQTT.

## Example Hardware Mapping
- `GPIO 27` → pulse sensor output.
- `3.3V` → sensor power if supported.
- `GND` → common ground.

## Arduino Example Using HTTP POST

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* apiUrl = "http://YOUR_BACKEND_HOST/api/machines/data";
const char* machineId = "loom-01";

volatile unsigned long pulseCount = 0;
unsigned long lastSend = 0;
const unsigned long sendIntervalMs = 5000;
const uint8_t sensorPin = 27;

void IRAM_ATTR onPulse() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  pinMode(sensorPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(sensorPin), onPulse, RISING);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
}

void loop() {
  unsigned long now = millis();

  if (now - lastSend >= sendIntervalMs) {
    noInterrupts();
    unsigned long pulses = pulseCount;
    pulseCount = 0;
    interrupts();

    float rpm = (pulses * 60000.0) / sendIntervalMs;
    const char* status = rpm == 0 ? "stopped" : "running";

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(apiUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<256> doc;
      doc["machineId"] = machineId;
      doc["speed"] = rpm;
      doc["status"] = status;
      doc["timestamp"] = "2026-03-23T10:00:00.000Z";

      String body;
      serializeJson(doc, body);
      int code = http.POST(body);
      Serial.printf("HTTP response: %d\n", code);
      http.end();
    }

    lastSend = now;
  }
}
```

## MQTT Alternative
- Publish machine data to a topic such as `loom/loom-01/telemetry`.
- Use a backend MQTT consumer that writes messages into MongoDB and emits Socket.io events.
- MQTT is better for unreliable networks and higher device counts.
