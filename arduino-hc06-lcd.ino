/*
 * Arduino - HC-06 Bluetooth + LCD I2C 16x2
 * 
 * FUNCIONALIDADES:
 * 1. Lê RPM e Aceleração dos sensores
 * 2. Envia dados para o app via HC-06 (Bluetooth)
 * 3. Recebe velocidade do app via HC-06
 * 4. Exibe tudo no LCD I2C 16x2
 * 
 * CONEXÕES:
 * 
 * HC-06 Bluetooth:
 * - VCC -> 5V
 * - GND -> GND
 * - TX  -> Pino 10 (RX do Arduino)
 * - RX  -> Pino 11 (TX do Arduino)
 * 
 * LCD I2C 16x2:
 * - VCC -> 5V
 * - GND -> GND
 * - SDA -> A4 (Arduino Uno/Nano)
 * - SCL -> A5 (Arduino Uno/Nano)
 * 
 * Sensor RPM (Hall Effect ou Óptico):
 * - VCC -> 5V
 * - GND -> GND
 * - OUT -> Pino 2 (interrupt)
 * 
 * Sensor Aceleração (Acelerômetro ADXL335 ou MPU6050):
 * - VCC -> 5V (ou 3.3V para ADXL335)
 * - GND -> GND
 * - X   -> A0 (exemplo para ADXL335)
 * 
 * BIBLIOTECAS NECESSÁRIAS:
 * - SoftwareSerial (nativa do Arduino)
 * - LiquidCrystal_I2C (instalar via Library Manager)
 * - ArduinoJson (opcional, para parse mais robusto)
 */

#include <SoftwareSerial.h>
#include <LiquidCrystal_I2C.h>

// ===== CONFIGURAÇÕES =====
#define HC06_RX 10
#define HC06_TX 11
#define RPM_PIN 2
#define ACCEL_PIN A0

// Inicializa HC-06 (RX, TX)
SoftwareSerial bluetooth(HC06_RX, HC06_TX);

// Inicializa LCD I2C (endereço 0x27, 16 colunas, 2 linhas)
// Se não funcionar, tente 0x3F em vez de 0x27
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ===== VARIÁVEIS GLOBAIS =====
volatile unsigned long rpmPulses = 0;
unsigned long lastRPMTime = 0;
int currentRPM = 0;
int currentAcceleration = 0;
int currentSpeed = 0;

String receivedData = "";

// ===== SETUP =====
void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  
  // Configura LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Iniciando...");
  delay(2000);
  lcd.clear();
  
  // Configura sensor de RPM (interrupt)
  pinMode(RPM_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(RPM_PIN), countRPM, FALLING);
  
  Serial.println("Sistema iniciado!");
}

// ===== LOOP PRINCIPAL =====
void loop() {
  // 1. Ler sensores
  readSensors();
  
  // 2. Enviar dados para o app via HC-06
  sendDataToApp();
  
  // 3. Receber dados do app via HC-06
  receiveDataFromApp();
  
  // 4. Atualizar LCD
  updateLCD();
  
  delay(1000); // Atualiza a cada 1 segundo
}

// ===== FUNÇÕES =====

// Interrupção para contar pulsos do sensor RPM
void countRPM() {
  rpmPulses++;
}

// Lê os sensores de RPM e aceleração
void readSensors() {
  // Calcular RPM (assumindo 1 pulso por rotação)
  // Ajuste o fator multiplicador conforme seu sensor
  unsigned long currentTime = millis();
  if (currentTime - lastRPMTime >= 1000) {
    currentRPM = (rpmPulses * 60); // pulsos/seg * 60 = RPM
    rpmPulses = 0;
    lastRPMTime = currentTime;
  }
  
  // Ler aceleração (convertendo leitura analógica)
  // Para ADXL335: leitura de 0-1023 -> 0-100%
  // Ajuste conforme seu sensor
  int rawAccel = analogRead(ACCEL_PIN);
  currentAcceleration = map(rawAccel, 0, 1023, 0, 100);
  
  // Se usar MPU6050, substitua por:
  // currentAcceleration = readMPU6050Acceleration();
}

// Envia dados para o app via HC-06 (formato JSON)
void sendDataToApp() {
  String jsonData = "{\"rpm\":" + String(currentRPM) + 
                    ",\"acceleration\":" + String(currentAcceleration) + "}";
  
  bluetooth.println(jsonData);
  Serial.print("Enviado: ");
  Serial.println(jsonData);
}

// Recebe dados do app via HC-06 (velocidade em JSON)
void receiveDataFromApp() {
  while (bluetooth.available()) {
    char c = bluetooth.read();
    
    if (c == '\n') {
      // Processa a linha recebida
      parseReceivedData(receivedData);
      receivedData = "";
    } else {
      receivedData += c;
    }
  }
}

// Faz parse dos dados recebidos (JSON simples)
void parseReceivedData(String data) {
  data.trim();
  
  // Parse JSON simples: {"speed":75}
  int speedIndex = data.indexOf("\"speed\":");
  if (speedIndex != -1) {
    int startValue = data.indexOf(":", speedIndex) + 1;
    int endValue = data.indexOf("}", startValue);
    
    if (endValue == -1) endValue = data.length();
    
    String speedStr = data.substring(startValue, endValue);
    speedStr.trim();
    currentSpeed = speedStr.toInt();
    
    Serial.print("Velocidade recebida: ");
    Serial.println(currentSpeed);
  }
}

// Atualiza display LCD
void updateLCD() {
  lcd.clear();
  
  // Linha 1: Velocidade e RPM
  lcd.setCursor(0, 0);
  lcd.print("V:");
  lcd.print(currentSpeed);
  lcd.print("km");
  
  lcd.setCursor(9, 0);
  lcd.print("R:");
  lcd.print(currentRPM);
  
  // Linha 2: Aceleração
  lcd.setCursor(0, 1);
  lcd.print("Acel:");
  lcd.print(currentAcceleration);
  lcd.print("%");
}

/*
 * ===== EXEMPLO DE EXIBIÇÃO NO LCD =====
 * 
 * +----------------+
 * |V:75km  R:5240  |  <- Linha 1
 * |Acel:68%        |  <- Linha 2
 * +----------------+
 * 
 * ===== NOTAS IMPORTANTES =====
 * 
 * 1. SENSOR DE RPM:
 *    - Use sensor Hall Effect (A3144) ou sensor óptico
 *    - Instale ímã ou marca na roda/motor
 *    - Ajuste o cálculo conforme pulsos por rotação
 * 
 * 2. SENSOR DE ACELERAÇÃO:
 *    - ADXL335: analógico simples (3 eixos)
 *    - MPU6050: I2C mais preciso (requer biblioteca)
 *    - Escolha o eixo correto para direção do movimento
 * 
 * 3. LCD I2C:
 *    - Teste o endereço I2C com scanner
 *    - Endereços comuns: 0x27 ou 0x3F
 *    - Ajuste o contraste com potenciômetro no módulo
 * 
 * 4. HC-06:
 *    - Velocidade padrão: 9600 baud
 *    - Nome padrão: "HC-06"
 *    - PIN padrão: 1234 ou 0000
 * 
 * ===== CALIBRAÇÃO =====
 * 
 * Para RPM mais preciso:
 * - Conte pulsos por rotação do sensor
 * - Ajuste fórmula: RPM = (pulsos * 60) / pulsosRotacao
 * 
 * Para aceleração mais precisa:
 * - Calibre valores min/max do sensor
 * - Ajuste map(rawAccel, minValue, maxValue, 0, 100)
 */
