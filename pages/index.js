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
        if (connectStatus === "Establishing Connection") {
          client.publish('fyp_smart_parking/ready', "Is system ready?");
        }
      })
      client.subscribe(['fyp_smart_parking/ready'].concat(parkingSpots), (err) => {
        if (err) {
          console.error("Subscribe error: ", err);
          return;
        }
      })
      client.on("message", (topic, message) => {

        if (topic === 'fyp_smart_parking/ready') {
          if (message.toString() === "restart") {
            setConnectStatus("Restarting System");
          }
          else {
            setConnectStatus("System Online");
          }
        }
        else {
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
              break;
          }
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

  const handleResetESP = () => {
    client.publish("fyp_smart_parking/restart_esp", "1");
    client.publish("fyp_smart_parking/restart_esp", "0");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-8 text-center">
      <h1 className="text-4xl font-extrabold text-slate-800">IoT Based Smart Parking System</h1>
      <p className="mt-2 text-sm">by</p>
      <p className="mt-2 font-medium text-slate-700">Lailatul Jaaizah & Assha Nadhirah</p>
      <span className={clsx(
        {
          "bg-sky-400/10 text-sky-500 ring-sky-500": connectStatus === 'Restarting System',
          "bg-amber-400/10 text-amber-500 ring-amber-500": connectStatus === 'Establishing Connection',
          "bg-green-400/10 text-green-500 ring-green-500": connectStatus === 'System Online'
        },
        "mt-4 ml-2 font-medium text-xs leading-5 rounded-full px-2 py-0.5 ring-1"
      )}>
        {connectStatus}
      </span>
      <p className="flex items-center my-8 text-xl font-medium text-slate-800">
        Spot available: 
        {
          ["Restarting System", "Establishing Connection"].includes(connectStatus)
          ? <svg className="animate-spin ml-2 -mr-1 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          : <span className="ml-2 -mr-1">{vacantParking.filter(x => x == "true").length}</span>
        }
      </p>
      <div className="mt-4 grid w-full max-w-2xl grid-cols-3 gap-6">
        <div className={clsx(parkingSpot1Available === "true" ? "bg-slate-200 text-slate-500" : "bg-red-500 text-white", "flex flex-col h-60 items-center justify-center rounded-xl")}>
          {
            ["Restarting System", "Establishing Connection"].includes(connectStatus)
            ? <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            : <>
                <p className="text-xs uppercase">Spot 1</p>
                <p className="font-medium">{parkingSpot1Available === "true" ? "Available" : "Vacant"}</p>
              </>
          }
        </div>
        <div className={clsx(parkingSpot2Available === "true" ? "bg-slate-200 text-slate-500" : "bg-red-500 text-white", "flex flex-col h-60 items-center justify-center rounded-xl")}>
          {
            ["Restarting System", "Establishing Connection"].includes(connectStatus)
            ? <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            : <>
                <p className="text-xs uppercase">Spot 2</p>
                <p className="font-medium">{parkingSpot2Available === "true" ? "Available" : "Vacant"}</p>
              </>
          }
        </div>
        <div className={clsx(parkingSpot3Available === "true" ? "bg-slate-200 text-slate-500" : "bg-red-500 text-white", "flex flex-col h-60 items-center justify-center rounded-xl")}>
          {
            ["Restarting System", "Establishing Connection"].includes(connectStatus)
            ? <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            : <>
                <p className="text-xs uppercase">Spot 3</p>
                <p className="font-medium">{parkingSpot3Available === "true" ? "Available" : "Vacant"}</p>
              </>
          }
        </div>
      </div>
      <button type="button" onClick={handleResetESP} disabled={["Restarting System", "Establishing Connection"].includes(connectStatus)} className="mt-16 inline-flex justify-center rounded-md border border-transparent bg-sky-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:bg-slate-500/30">
        Restart ESP
      </button>
    </div>
  )
}
