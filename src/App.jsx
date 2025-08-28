import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import './App.css';

function App() {
  const [client, setClient] = useState(null);
  const [connectStatus, setConnectStatus] = useState('Disconnected');
  const [payload, setPayload] = useState({});
  const [isSub, setIsSub] = useState(false);

  const topico = 'peteletrica/topico';
  const broker = 'wss://test.mosquitto.org:8081';


  const mqttConnect = (host) => {
    setConnectStatus('Connecting');
    const mqttClient = mqtt.connect(host);
    setClient(mqttClient);
  };

  const mqttSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription;
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log('Subscribe to topics error', error);
          return;
        }
        setIsSub(true);
      });
    }
  };

  useEffect(() => {
    mqttConnect(broker);
  }, []);

  useEffect(() => {
    if (client) {
      client.on('connect', () => {
        console.log('Connected');
        setConnectStatus('Connected');
        mqttSub({ topic: topico, qos: 0 });
      });

      client.on('error', (err) => {
        console.error('Connection error:', err);
        client.end();
      });

      client.on('reconnect', () => {
        console.log('Reconnecting...');
        setConnectStatus('Reconnecting');
      });

      client.on('message', (topic, message) => {
        const payload = { topic, message: message.toString() };
        console.log('Received Message:', payload);
        setPayload(payload);
      });
    }
  }, [client]);

  return (
    <div className="App">
      <h2>MQTT Status: {connectStatus}</h2>
      {isSub && <p>✔ Subscribed to: {topico}</p>}
      {payload.message && (
        <div>
          <h4>Última Mensagem:</h4>
          <p><strong>Topico:</strong> {payload.topic}</p>
          <p><strong>Mensagem:</strong> {payload.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
