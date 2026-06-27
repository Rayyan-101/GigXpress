import React from "react";
import { MessageSquare } from "lucide-react";

const OrganizerMessages = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 h-[80vh] flex flex-col">

      {/* Header */}
      <div className="border-b p-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="text-indigo-600" />
          Messages
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Chat with workers you have hired.
        </p>
      </div>

      {/* Placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">

          <MessageSquare
            className="mx-auto text-gray-300 mb-4"
            size={70}
          />

          <h2 className="text-xl font-semibold text-gray-700">
            No Conversation Selected
          </h2>

          <p className="text-gray-500 mt-2">
            Select a worker from the left panel.
          </p>

        </div>
      </div>

    </div>
  );
};

export default OrganizerMessages;