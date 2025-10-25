#include <SoftwareSerial.h>

// RX = 10, TX = 11
SoftwareSerial BT(10, 11);

unsigned long lastTime = 0;

void setup() {
  Serial.begin(9600);   // Monitor Serial do PC
  BT.begin(9600);       // HC-06
  Serial.println("Arduino iniciado - Envio de dados a cada 1s");
}

void loop() {
  // --- Receber dados do app e ecoar ---
  while (BT.available()) {
    char c = BT.read();
    BT.write(c);        // ecoa de volta para o app
    Serial.write(c);    // mostra no monitor serial
  }

  // --- Envio de dados a cada 1 segundo ---
  if (millis() - lastTime >= 1000) {
    lastTime = millis();

    int rpm = 3500;
    int aceleracao = 78;

    // Envia dados em formato JSON (compatível com o app)
    String jsonData = "{\"rpm\":" + String(rpm) + 
                     ",\"acceleration\":" + String(aceleracao) + "}";
    
    BT.println(jsonData);      // Envia para Bluetooth
    Serial.println(jsonData);  // Mostra no Monitor Serial
  }
}


// ========================================
// RESULTADO ESPERADO NO APP:
// ========================================
// RPM: sempre mostrará 3500
// Aceleração: sempre mostrará 78
// ========================================


/*
// ========================================
// EXPLICAÇÃO - DIFERENÇA ENTRE OS PINOS:
// ========================================
// 
// Arduino Uno tem apenas 1 porta serial FÍSICA (Hardware):
// - Pino 0 = RX (recebe dados)
// - Pino 1 = TX (envia dados)
// - Esses pinos são compartilhados com o cabo USB!
// 
// OPÇÃO 1 - Usar pinos 0 e 1 (Serial):
// ✓ Mais confiável e rápido
// ✓ Usa a serial FÍSICA (hardware)
// ✗ NÃO pode usar Monitor Serial ao mesmo tempo
// ✗ Precisa desconectar Bluetooth para fazer upload
// 
// OPÇÃO 2 - Usar outros pinos (SoftwareSerial):
// ✓ Pode usar Monitor Serial para debug
// ✓ Não precisa desconectar para upload
// ✗ Usa biblioteca SoftwareSerial (simulação)
// ✗ Menos confiável em altas velocidades
// 
// CONEXÃO DO BLUETOOTH HC-05:
// Arduino    Bluetooth
// VCC    ->  VCC (5V)
// GND    ->  GND
// TX (1) ->  RX  (se usar pinos 0/1)
// RX (0) ->  TX  (se usar pinos 0/1)
// 
// OU
// 
// Pino 11 -> RX  (se usar pinos 10/11)
// Pino 10 -> TX  (se usar pinos 10/11)
// 
// ========================================
*/
