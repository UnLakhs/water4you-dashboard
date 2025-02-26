import { LogsResponse, NotificationLogs } from "@/app/Cosntants/constants";

let baseUrl;
if (process.env.NODE_ENV === "development") {
  baseUrl = "http://localhost:3000";
} else {
  baseUrl = "https://water4you-dashboard.vercel.app";
}
const getLogs = async () => {
  const res = await fetch(`${baseUrl}/api/logs`, {
    method: "GET",
  });
  const data: LogsResponse = await res.json();
  console.log(data.logs);
  return data.logs;
};

const MessageLogs = async () => {
  const logs = await getLogs();

  return logs.length > 0 ? (
    <div className="flex flex-col justify-center items-center h-screen">
      {/* Logs container */}
      <div className="flex flex-col gap-10 justify-center items-center">
        {logs.map((log: NotificationLogs) => (
          <div className={` ${log.status === "sent" ? `bg-green-500` : `bg-red-500`} flex flex-row`}>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center h-screen">
      <span className="text-black text-3xl">No logs recorded</span>
    </div>
  );
};

export default MessageLogs;
