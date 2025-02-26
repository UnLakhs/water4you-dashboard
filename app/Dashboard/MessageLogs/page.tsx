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
  return data.logs;
};

const MessageLogs = async () => {
  const logs = await getLogs();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <span className="text-black text-3xl">No logs recorded</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-6">Message Logs</h1>

      <div className="w-full max-w-3xl flex flex-col gap-4 px-4">
        {logs.map((log: NotificationLogs) => {
          const timestamp = new Date(log.timestamp);
          const formattedDate = timestamp.toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const formattedTime = timestamp.toLocaleTimeString("en-US", {
            hour12: false,
          });

          // Dynamically set classes based on "sent" vs. "failed"
          const isSent = log.status === "sent";
          const borderColor = isSent ? "border-green-500" : "border-red-500";
          const bgColor = isSent ? "bg-green-50" : "bg-red-50";
          const textColor = isSent ? "text-green-800" : "text-red-800";

          return (
            <div
              key={log._id?.toString()}
              className={`rounded-lg shadow p-4 border-l-4 ${borderColor} ${bgColor} flex flex-col gap-2`}
            >
              {/* Top row: type and timestamp */}
              <div className="flex items-center justify-between">
                <span className={`font-semibold capitalize ${textColor}`}>
                  {log.type}
                </span>
                <span className="text-sm text-gray-600">
                  {formattedDate} {formattedTime}
                </span>
              </div>

              {/* Recipient & status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-800">
                  <span className="font-medium">Recipient:</span>{" "}
                  {log.recipient}
                </span>
                <span className={`font-medium ${textColor}`}>{log.status}</span>
              </div>

              {/* Message */}
              {log.successMessage && (
                <div className="text-gray-700">
                  <span className="font-medium">Message:</span> {log.successMessage}
                </div>
              )}

              {/* Error details if any */}
              {log.errorMessage && typeof log.errorMessage === "object" ? (
                <div className="mt-2 text-sm text-red-600">
                  <p className="font-semibold">Error Details:</p>
                  <p>Status: {log.errorMessage.status}</p>
                  <p>Code: {log.errorMessage.code}</p>
                  <p>Info: {log.errorMessage.moreInfo}</p>
                </div>
              ) : log.errorMessage ? (
                <div className="mt-2 text-sm text-red-600">
                  <p className="font-semibold">Error:</p>
                  <p>{String(log.errorMessage)}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageLogs;
