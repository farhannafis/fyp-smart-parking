import mqtt from "mqtt";

export default function Home() {

  const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

  const options = {
    keepalive: 60,
    clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
      topic: 'WillMsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false
    },
  }

  const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt", options);

  client.on("connect", (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Connected to wss://broker.emqx.io:8084/mqtt');
  })

  client.subscribe('esp8266/EFEN', (err) => {
    if (err) {
      console.error(err);
      return;
    }
  })

  client.on("message", (topic, message) => {
    console.log(topic, message.toString());
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8 text-center">
      <h1 className="text-4xl font-extrabold text-slate-800">Smart Parking App</h1>
      <p className="my-8 text-xl font-medium">Slot available: 3</p>
      <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-6 divide-x">
        <div className="flex h-60 items-center justify-center rounded-xl bg-slate-300">Available</div>
        <div className="flex h-60 items-center justify-center rounded-xl bg-slate-300">Available</div>
        <div className="flex h-60 items-center justify-center rounded-xl bg-red-500">Vacant</div>
      </div>
    </div>
  )
}
