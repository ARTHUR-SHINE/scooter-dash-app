// ========================================
// CÓDIGO DE TESTE - VALORES FIXOS
// ========================================
// Use este código para testar se o app está recebendo os dados corretamente
// Os valores são FIXOS para facilitar a identificação

#include <SoftwareSerial.h>

// Configuração Bluetooth (HC-05 ou similar)
SoftwareSerial bluetooth(10, 11); // RX, TX

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  
  Serial.println("Arduino iniciado - Modo TESTE com valores fixos");
  bluetooth.println("Arduino conectado!");
}

void loop() {
  // VALORES FIXOS PARA TESTE
  int testRPM = 5000;          // RPM fixo: 5000
  int testAcceleration = 75;   // Aceleração fixa: 75
  
  // Enviar dados em formato JSON a cada 1 segundo
  String jsonData = "{\"rpm\":" + String(testRPM) + 
                   ",\"acceleration\":" + String(testAcceleration) + "}";
  
  bluetooth.println(jsonData);
  Serial.println(jsonData); // Também mostra no monitor serial do Arduino
  
  delay(1000); // Enviar a cada 1 segundo
}

// ========================================
// RESULTADO ESPERADO NO APP:
// ========================================
// RPM: sempre mostrará 5000
// Aceleração: sempre mostrará 75
// 
// Se você ver esses valores no app, significa que:
// ✓ A conexão Bluetooth está funcionando
// ✓ O app está recebendo os dados
// ✓ O parsing do JSON está correto
// ========================================


// ========================================
// CÓDIGO REAL - COM SENSORES
// ========================================
// Depois de testar, use este código para ler sensores reais

/*
#include <SoftwareSerial.h>

// Configuração Bluetooth (HC-05 ou similar)
SoftwareSerial bluetooth(10, 11); // RX, TX

// Pinos dos sensores
const int rpmSensorPin = 2;
const int accelSensorPin = A0;

// Variáveis
volatile int rpmCount = 0;
unsigned long lastTime = 0;
int currentRPM = 0;

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  
  pinMode(rpmSensorPin, INPUT);
  attachInterrupt(digitalPinToInterrupt(rpmSensorPin), countRPM, RISING);
}

void loop() {
  // Calcular RPM a cada segundo
  unsigned long currentTime = millis();
  if (currentTime - lastTime >= 1000) {
    currentRPM = rpmCount * 60; // Converter contagem para RPM
    rpmCount = 0;
    lastTime = currentTime;
    
    // Ler aceleração do sensor
    int accelValue = analogRead(accelSensorPin);
    int acceleration = map(accelValue, 0, 1023, 0, 100);
    
    // OPÇÃO 1: ENVIAR COMO JSON (RECOMENDADO)
    // O React vai fazer JSON.parse() e acessar pelos nomes das chaves
    String jsonData = "{\"rpm\":" + String(currentRPM) + 
                     ",\"acceleration\":" + String(acceleration) + "}";
    bluetooth.println(jsonData);
    
    // Exemplo de saída: {"rpm":3500,"acceleration":78}
    
    
    // OPÇÃO 2: ENVIAR SEPARADO POR VÍRGULA
    // O React vai fazer split(',') e acessar por índice
    // bluetooth.print(currentRPM);
    // bluetooth.print(",");
    // bluetooth.println(acceleration);
    
    // Exemplo de saída: 3500,78
    
    
    // OPÇÃO 3: ENVIAR BYTES BINÁRIOS (MAIS EFICIENTE)
    // O React vai ler os bytes diretamente
    // byte data[3];
    // data[0] = currentRPM >> 8;    // RPM byte alto
    // data[1] = currentRPM & 0xFF;  // RPM byte baixo
    // data[2] = acceleration;       // Aceleração
    // bluetooth.write(data, 3);
  }
  
  delay(100);
}

void countRPM() {
  rpmCount++;
}
*/

/*
RESUMO - Como funciona a identificação dos dados:

1. JSON (mais fácil de entender):
   Arduino: {"rpm":3500,"acceleration":78}
   React: const data = JSON.parse(text); 
          data.rpm // O nome "rpm" identifica o dado
          
2. Delimitado (mais simples):
   Arduino: 3500,78
   React: const values = text.split(',');
          values[0] // Posição 0 = RPM (convenção)
          values[1] // Posição 1 = Aceleração (convenção)
          
3. Binário (mais eficiente):
   Arduino: [0x0D, 0xAC, 0x4E] (bytes)
   React: const rpm = (bytes[0] << 8) | bytes[1];
          const accel = bytes[2];
          // Ordem dos bytes define o que cada um significa

A escolha do formato é um ACORDO entre Arduino e React!
Ambos precisam usar o mesmo formato para funcionar.
*/
