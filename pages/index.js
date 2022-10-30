import clsx from "clsx";
import mqtt from "mqtt";
import { useEffect, useState } from "react";

export default function Home() {

  const parkingSpots = ['fyp_smart_parking/spot/1','fyp_smart_parking/spot/2','fyp_smart_parking/spot/3'];
  const [ client, setClient ] = useState(null);
  const [ connectStatus, setConnectStatus ] = useState("Establishing Connection");
  const [ parkingSpot1Available, setParkingSpot1Available ] = useState("true");
  const [ parkingSpot2Available, setParkingSpot2Available ] = useState("true");
  const [ parkingSpot3Available, setParkingSpot3Available ] = useState("true");

  const [ vacantParking, setVacantParking ] = useState(["true", "true", "true"]);

  useEffect(() => {

    const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
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
      }
    }

    if (client) {
      client.on("connect", () => {
        console.log('Connected to wss://broker.emqx.io:8084/mqtt');
        // setConnectStatus("System Online");
      })
      client.subscribe(['fyp_smart_parking/ready'].concat(parkingSpots), (err) => {
        if (err) {
          console.error("Subscribe error: ", err);
          return;
        }
      })
      client.on("message", (topic, message) => {
        switch (topic.split('/')[2]) {
          case '1':
            setParkingSpot1Available(message.toString());
            break;
          case '2':
            setParkingSpot2Available(message.toString());
            break;
          case '3':
            setParkingSpot3Available(message.toString());
            break;
          default:
            setConnectStatus("System Online");
            break;
        }
      })
    }
    else {
      setClient(mqtt.connect("wss://broker.emqx.io:8084/mqtt", options));
    }
  }, [client]);

  useEffect(() => {
    let copyVacantParking = [...vacantParking]
    copyVacantParking.splice(0, 1, parkingSpot1Available);
    copyVacantParking.splice(1, 1, parkingSpot2Available);
    copyVacantParking.splice(2, 1, parkingSpot3Available);
    console.log(copyVacantParking)
    setVacantParking(copyVacantParking);
  }, [parkingSpot1Available, parkingSpot2Available, parkingSpot3Available]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8 text-center">
      <h1 className="text-4xl font-extrabold text-slate-800">Smart Parking App</h1>
      <span class={clsx(
        {
          "bg-amber-400/10 text-amber-500 ring-amber-500": connectStatus === 'Establishing Connection',
          "bg-green-400/10 text-green-500 ring-green-500": connectStatus === 'System Online'
        },
        "mt-4 ml-2 font-medium text-xs leading-5 rounded-full bg-amber-400/10 px-2 py-0.5 ring-1"
      )}>
        {connectStatus}
      </span>
      <p className="my-8 text-xl font-medium text-slate-800">Slot available: {vacantParking.filter(x => x == "true").length}</p>
      <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-6 divide-x">
        <div className={clsx(parkingSpot1Available === "true" ? "bg-slate-300 text-slate-500" : "bg-red-500 text-white", "flex flex-col h-60 items-center justify-center rounded-xl")}>
          <p class="text-xs uppercase">Spot 1</p>
          <p class="font-medium">{parkingSpot1Available === "true" ? "Available" : "Vacant"}</p>
        </div>
        <div className={clsx(parkingSpot2Available === "true" ? "bg-slate-300 text-slate-500" : "bg-red-500 text-white", "flex flex-col h-60 items-center justify-center rounded-xl")}>
          <p class="text-xs uppercase">Spot 2</p>
          <p class="font-medium">{parkingSpot2Available === "true" ? "Available" : "Vacant"}</p>
        </div>
        <div className={clsx(parkingSpot3Available === "true" ? "bg-slate-300 text-slate-500" : "bg-red-500 text-white", "flex flex-col h-60 items-center justify-center rounded-xl")}>
          <p class="text-xs uppercase">Spot 3</p>
          <p class="font-medium">{parkingSpot3Available === "true" ? "Available" : "Vacant"}</p>
        </div>
      </div>
    </div>
  )
}
