import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Send } from "lucide-react";

interface ArduinoTestPanelProps {
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

const ArduinoTestPanel = ({ onSendMessage, isConnected }: ArduinoTestPanelProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleQuickTest = () => {
    onSendMessage("TESTE");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste de Comunicação</CardTitle>
        <CardDescription>
          Envie mensagens do celular para o Arduino
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSend} 
            disabled={!isConnected || !message.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleQuickTest}
          disabled={!isConnected}
          variant="secondary"
          className="w-full"
        >
          Enviar "TESTE" para Arduino
        </Button>
        
        {!isConnected && (
          <p className="text-sm text-muted-foreground text-center">
            Conecte-se ao Arduino primeiro
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ArduinoTestPanel;
