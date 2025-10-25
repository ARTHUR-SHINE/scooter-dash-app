// ========================================
// CÓDIGO DE TESTE - VALORES FIXOS
// ========================================

// ┌─────────────────────────────────────────────────────────────┐
// │  OPÇÃO 1: Bluetooth nos pinos 0 (RX) e 1 (TX)              │
// │  (Pinos de serial FÍSICA do Arduino Uno)                    │
// └─────────────────────────────────────────────────────────────┘

void setup() {
  Serial.begin(9600); // Pinos 0 (RX) e 1 (TX) - Comunicação direta
  Serial.println("Arduino iniciado - Modo TESTE");
}

void loop() {
  // VALORES FIXOS PARA TESTE
  int testRPM = 5000;          // RPM fixo: 5000
  int testAcceleration = 75;   // Aceleração fixa: 75
  
  // Enviar dados em formato JSON
  String jsonData = "{\"rpm\":" + String(testRPM) + 
                   ",\"acceleration\":" + String(testAcceleration) + "}";
  
  Serial.println(jsonData); // Envia pelo Bluetooth nos pinos 0 e 1
  
  delay(1000); // Enviar a cada 1 segundo
}

// ATENÇÃO: Ao usar os pinos 0 e 1, desconecte o Bluetooth antes de 
// fazer upload do código, senão vai dar erro!


// ========================================
// RESULTADO ESPERADO NO APP:
// ========================================
// RPM: sempre mostrará 5000
// Aceleração: sempre mostrará 75
// ========================================


/*
// ┌─────────────────────────────────────────────────────────────┐
// │  OPÇÃO 2: Bluetooth em OUTROS pinos (ex: 10 e 11)          │
// │  (Usar se quiser debugar no Monitor Serial)                 │
// └─────────────────────────────────────────────────────────────┘

#include <SoftwareSerial.h>

SoftwareSerial bluetooth(10, 11); // RX=10, TX=11 (ou outros pinos)

void setup() {
  Serial.begin(9600);      // Para ver mensagens no Monitor Serial (debug)
  bluetooth.begin(9600);   // Para comunicação com Bluetooth
  
  Serial.println("Arduino iniciado - Modo TESTE");
}

void loop() {
  int testRPM = 5000;
  int testAcceleration = 75;
  
  String jsonData = "{\"rpm\":" + String(testRPM) + 
                   ",\"acceleration\":" + String(testAcceleration) + "}";
  
  bluetooth.println(jsonData);  // Envia para Bluetooth (pinos 10 e 11)
  Serial.println(jsonData);     // Mostra no Monitor Serial (debug)
  
  delay(1000);
}
*/


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
