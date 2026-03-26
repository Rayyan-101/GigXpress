import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { loadAdminDB, resetAdminDB, roleIconMap, saveAdminDB } from "./adminData";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "volunteers", label: "Volunteers", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "organizers", label: "Organizers", icon: UserCog },
  { id: "analytics", label: "Analytics", icon: CalendarDays },
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-700",
  Suspended: "bg-rose-100 text-rose-700",
  Upcoming: "bg-sky-100 text-sky-700",
  Ongoing: "bg-purple-100 text-purple-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Draft: "bg-orange-100 text-orange-700",
  Cancelled: "bg-rose-100 text-rose-700",
  Verified: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Scheduled: "bg-indigo-100 text-indigo-700",
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const fmtDate = (date) => new Date(date).toLocaleDateString();
const fmtDateTime = (date) => new Date(date).toLocaleString();
const fmtHours = (hours) => `${Number(hours || 0).toFixed(1)} hrs`;
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const Badge = ({ value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[value] || "bg-slate-100 text-slate-700"}`}>
    {value}
  </span>
);

const Modal = ({ open, onClose, title, children, maxWidth = "max-w-4xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`w-full ${maxWidth} rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ state, onCancel }) => (
  <Modal open={state.open} onClose={onCancel} title={state.title || "Confirm"} maxWidth="max-w-md">
    <p className="text-sm text-slate-600">{state.message}</p>
    <div className="mt-4 flex justify-end gap-2">
      <button onClick={onCancel} className="rounded border px-3 py-2 text-sm">Cancel</button>
      <button
        onClick={() => {
          state.onConfirm?.();
          onCancel();
        }}
        className="rounded bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
      >
        Confirm
      </button>
    </div>
  </Modal>
);

const Toasts = ({ items }) => (
  <div className="fixed bottom-4 right-4 z-[60] space-y-2">
    {items.map((toast) => (
      <div key={toast.id} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-lg">{toast.message}</div>
    ))}
  </div>
);

const MetricCard = ({ label, value, icon: Icon, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">{label}</p>
      <Icon size={18} className="text-slate-400" />
    </div>
    <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>
);

const Pagination = ({ page, setPage, total, pageSize }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
      <span>Page {page} / {pages}</span>
      <div className="flex items-center gap-2">
        <button className="rounded border px-2 py-1" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button>
        <button className="rounded border px-2 py-1" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

const LineChart = ({ data, color = "#2563eb" }) => {
  if (!data.length) return <p className="text-sm text-slate-500">No data</p>;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => `${(i / Math.max(data.length - 1, 1)) * 100},${100 - (d.value / maxValue) * 80 - 10}`).join(" ");
  return (
    <div>
      <svg viewBox="0 0 100 100" className="h-44 w-full"><polyline fill="none" stroke={color} strokeWidth="2.2" points={points} /></svg>
      <div className="mt-2 flex justify-between text-xs text-slate-500">{data.map((d) => <span key={d.label}>{d.label}</span>)}</div>
    </div>
  );
};

const AreaChart = ({ data }) => {
  if (!data.length) return <p className="text-sm text-slate-500">No data</p>;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => `${(i / Math.max(data.length - 1, 1)) * 100},${100 - (d.value / maxValue) * 75 - 10}`).join(" ");
  return (
    <div>
      <svg viewBox="0 0 100 100" className="h-44 w-full">
        <polygon points={`0,100 ${points} 100,100`} fill="rgba(16,185,129,0.2)" />
        <polyline fill="none" stroke="#10b981" strokeWidth="2" points={points} />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-500">{data.map((d) => <span key={d.label}>{d.label}</span>)}</div>
    </div>
  );
};

const BarChart = ({ data }) => {
  if (!data.length) return <p className="text-sm text-slate-500">No data</p>;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500"><span>{d.label}</span><span>{d.value}</span></div>
          <div className="h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-indigo-500" style={{ width: `${Math.max(4, (d.value / maxValue) * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
};

const PieChart = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <p className="text-sm text-slate-500">No data</p>;
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
  let cursor = 0;
  const gradient = data.map((d, i) => {
    const start = (cursor / total) * 360;
    cursor += d.value;
    const end = (cursor / total) * 360;
    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
  }).join(", ");
  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-32 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="space-y-1 text-xs text-slate-600">
        {data.map((d, i) => <div key={d.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} /><span>{d.label}</span><span className="font-semibold">{d.value}</span></div>)}
      </div>
    </div>
  );
};

const CSVDownload = ({ rows }) => {
  const exportCsv = () => {
    const headers = ["Name", "Email", "Phone", "Status", "Location", "Skills", "Hours", "Date Joined"];
    const lines = [
      headers.join(","),
      ...rows.map((v) => [v.name, v.email, v.phone, v.status, v.location, v.skills.join("|"), v.hoursLogged, fmtDate(v.dateJoined)].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gigxpress-volunteers-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm"><Download size={16} />Export CSV</button>;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState({ open: false });

  const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(null);

  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventEditId, setEventEditId] = useState(null);

  const [volunteerFilters, setVolunteerFilters] = useState({ search: "", status: "All", skill: "All", location: "All", from: "", to: "" });
  const [volunteerPage, setVolunteerPage] = useState(1);
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState([]);

  const [eventFilters, setEventFilters] = useState({ search: "", status: "All", category: "All", organizerId: "All", from: "", to: "", view: "table" });
  const [eventPage, setEventPage] = useState(1);

  const [organizerFilters, setOrganizerFilters] = useState({ search: "", verificationStatus: "All" });
  const [organizerPage, setOrganizerPage] = useState(1);

  const [analyticsTab, setAnalyticsTab] = useState("overview");
  const [analyticsRange, setAnalyticsRange] = useState({ from: "", to: "" });

  const [composer, setComposer] = useState({ audience: "All Volunteers", type: "email", subject: "", body: "", templateId: "" });

  const pushToast = (message) => {
    const id = uid("toast");
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 2600);
  };

  const mutateDb = (updater, toastMessage) => {
    setDb((prev) => {
      if (!prev) return prev;
      const next = updater(clone(prev));
      saveAdminDB(next);
      return next;
    });
    if (toastMessage) pushToast(toastMessage);
  };

  const addActivity = (next, payload) => {
    next.activities.unshift({ id: uid("activity"), timestamp: new Date().toISOString(), ...payload });
    next.activities = next.activities.slice(0, 120);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDb(loadAdminDB());
      setLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  const organizersById = useMemo(() => db ? db.organizers.reduce((acc, o) => ({ ...acc, [o.id]: o }), {}) : {}, [db]);
  const volunteersById = useMemo(() => db ? db.volunteers.reduce((acc, v) => ({ ...acc, [v.id]: v }), {}) : {}, [db]);

  const metrics = useMemo(() => {
    if (!db) return null;
    return {
      totalVolunteers: db.volunteers.length,
      activeEvents: db.events.filter((e) => ["Upcoming", "Ongoing"].includes(e.status)).length,
      totalOrganizers: db.organizers.length,
      volunteerHours: Number(db.volunteers.reduce((sum, v) => sum + (v.hoursLogged || 0), 0).toFixed(1)),
    };
  }, [db]);

  const chartData = useMemo(() => {
    if (!db) return null;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const trend = Array.from({ length: 6 }).map((_, i) => {
      const base = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${base.getFullYear()}-${base.getMonth()}`;
      const value = db.volunteers.filter((vol) => {
        const d = new Date(vol.dateJoined);
        return `${d.getFullYear()}-${d.getMonth()}` === key;
      }).length;
      return { label: monthNames[base.getMonth()], value };
    });

    const byCategory = Object.entries(db.events.reduce((acc, e) => ({ ...acc, [e.category]: (acc[e.category] || 0) + 1 }), {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const statusDistribution = Object.entries(db.volunteers.reduce((acc, v) => ({ ...acc, [v.status]: (acc[v.status] || 0) + 1 }), {})).map(([label, value]) => ({ label, value }));

    const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyHours = week.map((d) => ({ label: d, value: 0 }));
    db.events.forEach((event) => {
      if (!event.checkedInVolunteerIds?.length) return;
      const date = new Date(event.dateTime);
      const idx = date.getDay() === 0 ? 6 : date.getDay() - 1;
      weeklyHours[idx].value += event.durationHours * event.checkedInVolunteerIds.length;
    });

    return { trend, byCategory, statusDistribution, weeklyHours: weeklyHours.map((item) => ({ ...item, value: Number(item.value.toFixed(1)) })) };
  }, [db]);

  const filteredVolunteers = useMemo(() => {
    if (!db) return [];
    const { search, status, skill, location, from, to } = volunteerFilters;
    const searchText = search.toLowerCase();
    return db.volunteers.filter((v) => {
      if (searchText && ![v.name, v.email, v.phone].some((t) => t.toLowerCase().includes(searchText))) return false;
      if (status !== "All" && v.status !== status) return false;
      if (skill !== "All" && !v.skills.includes(skill)) return false;
      if (location !== "All" && v.location !== location) return false;
      if (from && new Date(v.dateJoined) < new Date(from)) return false;
      if (to && new Date(v.dateJoined) > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [db, volunteerFilters]);

  const filteredEvents = useMemo(() => {
    if (!db) return [];
    const { search, status, category, organizerId, from, to } = eventFilters;
    const searchText = search.toLowerCase();
    return db.events.filter((e) => {
      if (searchText && ![e.name, e.location, organizersById[e.organizerId]?.organizationName || ""].join(" ").toLowerCase().includes(searchText)) return false;
      if (status !== "All" && e.status !== status) return false;
      if (category !== "All" && e.category !== category) return false;
      if (organizerId !== "All" && e.organizerId !== organizerId) return false;
      if (from && new Date(e.dateTime) < new Date(from)) return false;
      if (to && new Date(e.dateTime) > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [db, eventFilters, organizersById]);

  const filteredOrganizers = useMemo(() => {
    if (!db) return [];
    const { search, verificationStatus } = organizerFilters;
    const searchText = search.toLowerCase();
    return db.organizers.filter((o) => {
      if (searchText && ![o.organizationName, o.contactPerson, o.email].join(" ").toLowerCase().includes(searchText)) return false;
      if (verificationStatus !== "All" && o.verificationStatus !== verificationStatus) return false;
      return true;
    });
  }, [db, organizerFilters]);

  const selectedVolunteer = db?.volunteers.find((v) => v.id === selectedVolunteerId);
  const selectedEvent = db?.events.find((e) => e.id === selectedEventId);
  const selectedOrganizer = db?.organizers.find((o) => o.id === selectedOrganizerId);

  const volunteerSkills = useMemo(() => db ? [...new Set(db.volunteers.flatMap((v) => v.skills))].sort() : [], [db]);
  const locations = useMemo(() => db ? [...new Set(db.volunteers.map((v) => v.location))].sort() : [], [db]);
  const categories = useMemo(() => db ? [...new Set(db.events.map((e) => e.category))].sort() : [], [db]);

  const pageSlice = (data, page, size) => data.slice((page - 1) * size, page * size);

  const pendingVolunteerApprovals = db?.volunteers.filter((v) => v.status === "Pending") || [];
  const pendingOrganizerApprovals = db?.organizers.filter((o) => o.verificationStatus === "Pending") || [];

  const handleVolunteerStatus = (volunteerId, status) => {
    mutateDb((next) => {
      const volunteer = next.volunteers.find((item) => item.id === volunteerId);
      if (!volunteer) return next;
      volunteer.status = status;
      addActivity(next, { type: "approval", entity: "volunteer", entityId: volunteerId, actionRequired: false, message: `${volunteer.name} status changed to ${status}` });
      return next;
    }, `Volunteer marked as ${status}`);
  };

  const handleVolunteerBulkStatus = (status) => {
    if (!selectedVolunteerIds.length) return;
    mutateDb((next) => {
      next.volunteers.forEach((volunteer) => {
        if (selectedVolunteerIds.includes(volunteer.id)) volunteer.status = status;
      });
      addActivity(next, { type: "volunteer", entity: "volunteer", entityId: "bulk", message: `${selectedVolunteerIds.length} volunteers changed to ${status}` });
      return next;
    }, `${selectedVolunteerIds.length} volunteers updated`);
    setSelectedVolunteerIds([]);
  };

  const handleVolunteerNotes = (volunteerId, adminNotes) => {
    mutateDb((next) => {
      const volunteer = next.volunteers.find((item) => item.id === volunteerId);
      if (!volunteer) return next;
      volunteer.adminNotes = adminNotes;
      return next;
    }, "Volunteer notes saved");
  };

  const assignVolunteerToEvent = (eventId, volunteerId) => {
    mutateDb((next) => {
      const event = next.events.find((item) => item.id === eventId);
      if (!event) return next;
      if (!event.assignedVolunteerIds.includes(volunteerId)) {
        if (event.assignedVolunteerIds.length < event.volunteerSlotsTotal) event.assignedVolunteerIds.push(volunteerId);
        else if (!event.waitlistVolunteerIds.includes(volunteerId)) event.waitlistVolunteerIds.push(volunteerId);
      }
      event.waitlistVolunteerIds = event.waitlistVolunteerIds.filter((id) => id !== volunteerId);
      event.volunteerSlotsFilled = event.assignedVolunteerIds.length;
      addActivity(next, { type: "event", entity: "event", entityId: eventId, message: `Volunteer assignment updated for ${event.name}` });
      return next;
    }, "Volunteer assignment updated");
  };

  const toggleCheckIn = (eventId, volunteerId) => {
    mutateDb((next) => {
      const event = next.events.find((item) => item.id === eventId);
      const volunteer = next.volunteers.find((item) => item.id === volunteerId);
      if (!event || !volunteer) return next;
      const checkedIn = event.checkedInVolunteerIds.includes(volunteerId);
      if (checkedIn) {
        event.checkedInVolunteerIds = event.checkedInVolunteerIds.filter((id) => id !== volunteerId);
        volunteer.hoursLogged = Math.max(0, Number((volunteer.hoursLogged - event.durationHours).toFixed(1)));
        volunteer.history = volunteer.history.filter((item) => item.eventId !== event.id);
      } else {
        event.checkedInVolunteerIds.push(volunteerId);
        volunteer.hoursLogged = Number((volunteer.hoursLogged + event.durationHours).toFixed(1));
        volunteer.history.unshift({ id: uid("hist"), eventId: event.id, eventName: event.name, date: event.dateTime, hours: event.durationHours, status: "Checked-In" });
      }
      addActivity(next, { type: "event", entity: "event", entityId: eventId, message: `${volunteer.name} ${checkedIn ? "check-out" : "check-in"} for ${event.name}` });
      return next;
    }, "Check-in updated");
  };

  const handleEventSubmit = (payload) => {
    mutateDb((next) => {
      if (eventEditId) {
        const event = next.events.find((item) => item.id === eventEditId);
        if (!event) return next;
        Object.assign(event, { ...payload, volunteerSlotsTotal: Number(payload.volunteerSlotsTotal), durationHours: Number(payload.durationHours), updatedAt: new Date().toISOString() });
        addActivity(next, { type: "event", entity: "event", entityId: event.id, message: `Event updated: ${event.name}` });
      } else {
        const created = { ...payload, id: uid("evt"), volunteerSlotsFilled: 0, assignedVolunteerIds: [], checkedInVolunteerIds: [], waitlistVolunteerIds: [], volunteerSlotsTotal: Number(payload.volunteerSlotsTotal), durationHours: Number(payload.durationHours), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        next.events.unshift(created);
        const organizer = next.organizers.find((item) => item.id === created.organizerId);
        if (organizer) organizer.eventsCreated += 1;
        addActivity(next, { type: "event", entity: "event", entityId: created.id, message: `New event created: ${created.name}`, actionRequired: created.status === "Draft" });
      }
      return next;
    }, eventEditId ? "Event updated" : "Event created");
    setEventEditId(null);
    setEventFormOpen(false);
  };

  const deleteEvent = (eventId) => {
    setConfirm({
      open: true,
      title: "Delete event",
      message: "This will remove the event and related attendance logs from volunteers.",
      onConfirm: () => {
        mutateDb((next) => {
          const event = next.events.find((item) => item.id === eventId);
          if (!event) return next;
          next.volunteers.forEach((volunteer) => {
            if (event.checkedInVolunteerIds.includes(volunteer.id)) volunteer.hoursLogged = Math.max(0, Number((volunteer.hoursLogged - event.durationHours).toFixed(1)));
            volunteer.history = volunteer.history.filter((entry) => entry.eventId !== event.id);
          });
          next.events = next.events.filter((item) => item.id !== eventId);
          addActivity(next, { type: "event", entity: "event", entityId: eventId, message: `Event deleted: ${event.name}` });
          return next;
        }, "Event deleted");
        setSelectedEventId(null);
      },
    });
  };
  const setOrganizerVerification = (organizerId, verificationStatus) => {
    mutateDb((next) => {
      const organizer = next.organizers.find((item) => item.id === organizerId);
      if (!organizer) return next;
      organizer.verificationStatus = verificationStatus;
      addActivity(next, { type: "organizer", entity: "organizer", entityId: organizer.id, message: `${organizer.organizationName} marked ${verificationStatus}` });
      return next;
    }, `Organizer marked ${verificationStatus}`);
  };

  const sendMessage = () => {
    if (!composer.subject || !composer.body) {
      pushToast("Add subject and message body");
      return;
    }

    mutateDb((next) => {
      const recipients = (() => {
        if (composer.audience === "All Volunteers") return next.volunteers.length;
        if (composer.audience === "Active Volunteers") return next.volunteers.filter((v) => v.status === "Active").length;
        if (composer.audience.startsWith("Skill:")) {
          const skill = composer.audience.split(":")[1]?.trim();
          return next.volunteers.filter((v) => v.skills.includes(skill)).length;
        }
        if (composer.audience.startsWith("Location:")) {
          const location = composer.audience.split(":")[1]?.trim();
          return next.volunteers.filter((v) => v.location === location).length;
        }
        return next.volunteers.length;
      })();

      next.messageHistory.unshift({ id: uid("msg"), subject: composer.subject, type: composer.type, recipients, audience: composer.audience, sentAt: new Date().toISOString(), status: "Delivered" });
      addActivity(next, { type: "message", entity: "message", entityId: "broadcast", message: `Message sent to ${recipients} users (${composer.type})` });
      return next;
    }, "Message sent");

    setComposer((prev) => ({ ...prev, subject: "", body: "", templateId: "" }));
  };

  const addTemplate = () => {
    if (!composer.subject || !composer.body) {
      pushToast("Use subject/body to create a template");
      return;
    }

    mutateDb((next) => {
      next.messageTemplates.unshift({ id: uid("tpl"), name: `Template ${next.messageTemplates.length + 1}`, type: composer.type, subject: composer.subject, body: composer.body });
      return next;
    }, "Template saved");
  };

  if (loading || !db || !metrics || !chartData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <LoaderCircle className="animate-spin" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  const volunteerRows = pageSlice(filteredVolunteers, volunteerPage, 10);
  const eventRows = pageSlice(filteredEvents, eventPage, 10);
  const organizerRows = pageSlice(filteredOrganizers, organizerPage, 10);
  const selectedEventSeed = eventEditId ? db.events.find((event) => event.id === eventEditId) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toasts items={toasts} />
      <ConfirmDialog state={confirm} onCancel={() => setConfirm({ open: false })} />

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2">
            <button className="rounded border p-2 lg:hidden" onClick={() => setSidebarOpen((prev) => !prev)}><Menu size={18} /></button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">GigXpress Admin</h1>
              <p className="text-xs text-slate-500">Operations command center</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button className="inline-flex items-center gap-2 rounded border px-3 py-2" onClick={() => setConfirm({ open: true, title: "Reset all admin data", message: "This restores seeded mock data and removes current edits.", onConfirm: () => { const seeded = resetAdminDB(); setDb(seeded); pushToast("Admin data reset"); } })}><Trash2 size={16} /> Reset</button>
            <button className="inline-flex items-center gap-2 rounded border px-3 py-2"><Bell size={16} /> Alerts</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r bg-white p-4 pt-20 transition-transform lg:static lg:translate-x-0 lg:pt-4 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={16} />{tab.label}</button>;
            })}
          </nav>
        </aside>

        <main className="w-full flex-1 p-4 lg:p-6">
          {activeTab === "overview" && (
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total Volunteers" value={metrics.totalVolunteers} icon={Users} hint="Registered volunteer accounts" />
                <MetricCard label="Active Events" value={metrics.activeEvents} icon={CalendarDays} hint="Upcoming + ongoing events" />
                <MetricCard label="Total Organizers" value={metrics.totalOrganizers} icon={UserCog} hint="Registered organizer entities" />
                <MetricCard label="Volunteer Hours" value={fmtHours(metrics.volunteerHours)} icon={Clock3} hint="Cumulative checked-in hours" />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Volunteer Registration Trend</h3><LineChart data={chartData.trend} /></div>
                <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Events by Category</h3><BarChart data={chartData.byCategory} /></div>
                <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Volunteer Status Distribution</h3><PieChart data={chartData.statusDistribution} /></div>
                <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Weekly Volunteer Hours</h3><AreaChart data={chartData.weeklyHours} /></div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border bg-white p-4 lg:col-span-2">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Recent Activity</h3>
                  <div className="space-y-2">
                    {db.activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start justify-between rounded-lg border p-3 text-sm">
                        <div><p className="text-slate-800">{activity.message}</p><p className="text-xs text-slate-500">{fmtDateTime(activity.timestamp)}</p></div>
                        {activity.actionRequired && <Badge value="Pending" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick Actions</h3>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="font-medium">Volunteer approvals</p>
                      <p className="text-xs text-slate-500">{pendingVolunteerApprovals.length} pending profiles</p>
                      <button className="mt-2 inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => setActiveTab("volunteers")}><UserCheck size={14} /> Review</button>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="font-medium">Organizer verification</p>
                      <p className="text-xs text-slate-500">{pendingOrganizerApprovals.length} pending organizations</p>
                      <button className="mt-2 inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white" onClick={() => setActiveTab("organizers")}><Shield size={14} /> Review</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "volunteers" && (
            <section className="rounded-xl border bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={volunteerFilters.search} onChange={(event) => { setVolunteerPage(1); setVolunteerFilters((prev) => ({ ...prev, search: event.target.value })); }} placeholder="Search name, email, phone" className="w-full rounded border py-2 pl-9 pr-3 text-sm" /></div>
                <select value={volunteerFilters.status} onChange={(event) => setVolunteerFilters((prev) => ({ ...prev, status: event.target.value }))} className="rounded border px-2 py-2 text-sm">{["All", "Active", "Pending", "Inactive", "Suspended"].map((item) => <option key={item}>{item}</option>)}</select>
                <select value={volunteerFilters.skill} onChange={(event) => setVolunteerFilters((prev) => ({ ...prev, skill: event.target.value }))} className="rounded border px-2 py-2 text-sm"><option>All</option>{volunteerSkills.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={volunteerFilters.location} onChange={(event) => setVolunteerFilters((prev) => ({ ...prev, location: event.target.value }))} className="rounded border px-2 py-2 text-sm"><option>All</option>{locations.map((item) => <option key={item}>{item}</option>)}</select>
                <input type="date" value={volunteerFilters.from} onChange={(event) => setVolunteerFilters((prev) => ({ ...prev, from: event.target.value }))} className="rounded border px-2 py-2 text-sm" />
                <input type="date" value={volunteerFilters.to} onChange={(event) => setVolunteerFilters((prev) => ({ ...prev, to: event.target.value }))} className="rounded border px-2 py-2 text-sm" />
              </div>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button className="rounded border px-3 py-2 text-sm" onClick={() => handleVolunteerBulkStatus("Active")} disabled={!selectedVolunteerIds.length}>Mark Active</button>
                  <button className="rounded border px-3 py-2 text-sm" onClick={() => handleVolunteerBulkStatus("Suspended")} disabled={!selectedVolunteerIds.length}>Suspend</button>
                </div>
                <CSVDownload rows={filteredVolunteers} />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="px-2 py-2"><input type="checkbox" checked={volunteerRows.length > 0 && volunteerRows.every((vol) => selectedVolunteerIds.includes(vol.id))} onChange={(event) => { if (event.target.checked) setSelectedVolunteerIds((prev) => [...new Set([...prev, ...volunteerRows.map((vol) => vol.id)])]); else setSelectedVolunteerIds((prev) => prev.filter((id) => !volunteerRows.map((vol) => vol.id).includes(id))); }} /></th><th className="px-2 py-2">Volunteer</th><th className="px-2 py-2">Phone</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Skills</th><th className="px-2 py-2">Hours</th><th className="px-2 py-2">Date Joined</th><th className="px-2 py-2">Actions</th></tr></thead>
                  <tbody>
                    {volunteerRows.map((volunteer) => (
                      <tr key={volunteer.id} className="border-b">
                        <td className="px-2 py-3"><input type="checkbox" checked={selectedVolunteerIds.includes(volunteer.id)} onChange={(event) => { if (event.target.checked) setSelectedVolunteerIds((prev) => [...prev, volunteer.id]); else setSelectedVolunteerIds((prev) => prev.filter((id) => id !== volunteer.id)); }} /></td>
                        <td className="px-2 py-3"><div className="flex items-center gap-2"><img src={volunteer.avatar} alt={volunteer.name} className="h-8 w-8 rounded-full" /><div><p className="font-medium text-slate-900">{volunteer.name}</p><p className="text-xs text-slate-500">{volunteer.email}</p></div></div></td>
                        <td className="px-2 py-3 text-slate-600">{volunteer.phone}</td>
                        <td className="px-2 py-3"><Badge value={volunteer.status} /></td>
                        <td className="px-2 py-3"><div className="flex flex-wrap gap-1">{volunteer.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{skill}</span>)}</div></td>
                        <td className="px-2 py-3">{fmtHours(volunteer.hoursLogged)}</td>
                        <td className="px-2 py-3">{fmtDate(volunteer.dateJoined)}</td>
                        <td className="px-2 py-3"><div className="flex items-center gap-1"><button className="rounded border p-1" onClick={() => setSelectedVolunteerId(volunteer.id)}><Eye size={15} /></button>{volunteer.status === "Pending" && <button className="rounded bg-emerald-600 px-2 py-1 text-xs text-white" onClick={() => handleVolunteerStatus(volunteer.id, "Active")}>Approve</button>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={volunteerPage} setPage={setVolunteerPage} total={filteredVolunteers.length} pageSize={10} />
            </section>
          )}
          {activeTab === "events" && (
            <section className="space-y-4">
              <div className="rounded-xl border bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative min-w-56"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={eventFilters.search} onChange={(event) => setEventFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Search events" className="rounded border py-2 pl-9 pr-3 text-sm" /></div>
                    <select value={eventFilters.status} onChange={(event) => setEventFilters((prev) => ({ ...prev, status: event.target.value }))} className="rounded border px-2 py-2 text-sm">{["All", "Upcoming", "Ongoing", "Completed", "Draft", "Cancelled"].map((item) => <option key={item}>{item}</option>)}</select>
                    <select value={eventFilters.category} onChange={(event) => setEventFilters((prev) => ({ ...prev, category: event.target.value }))} className="rounded border px-2 py-2 text-sm"><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
                    <select value={eventFilters.organizerId} onChange={(event) => setEventFilters((prev) => ({ ...prev, organizerId: event.target.value }))} className="rounded border px-2 py-2 text-sm"><option value="All">All Organizers</option>{db.organizers.map((o) => <option key={o.id} value={o.id}>{o.organizationName}</option>)}</select>
                    <input type="date" value={eventFilters.from} onChange={(event) => setEventFilters((prev) => ({ ...prev, from: event.target.value }))} className="rounded border px-2 py-2 text-sm" />
                    <input type="date" value={eventFilters.to} onChange={(event) => setEventFilters((prev) => ({ ...prev, to: event.target.value }))} className="rounded border px-2 py-2 text-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className={`rounded border px-3 py-2 text-sm ${eventFilters.view === "table" ? "bg-slate-100" : ""}`} onClick={() => setEventFilters((prev) => ({ ...prev, view: "table" }))}>Table</button>
                    <button className={`rounded border px-3 py-2 text-sm ${eventFilters.view === "calendar" ? "bg-slate-100" : ""}`} onClick={() => setEventFilters((prev) => ({ ...prev, view: "calendar" }))}>Calendar</button>
                    <button className="inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => { setEventEditId(null); setEventFormOpen(true); }}><Plus size={16} />Create Event</button>
                  </div>
                </div>

                {eventFilters.view === "table" ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="px-2 py-2">Event</th><th className="px-2 py-2">Organizer</th><th className="px-2 py-2">Date/Time</th><th className="px-2 py-2">Location</th><th className="px-2 py-2">Category</th><th className="px-2 py-2">Slots</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Actions</th></tr></thead>
                      <tbody>
                        {eventRows.map((event) => (
                          <tr key={event.id} className="border-b">
                            <td className="px-2 py-3 font-medium text-slate-900">{event.name}</td>
                            <td className="px-2 py-3 text-slate-600">{organizersById[event.organizerId]?.organizationName || "-"}</td>
                            <td className="px-2 py-3">{fmtDateTime(event.dateTime)}</td>
                            <td className="px-2 py-3">{event.location}</td>
                            <td className="px-2 py-3">{event.category}</td>
                            <td className="px-2 py-3">{event.volunteerSlotsFilled}/{event.volunteerSlotsTotal}</td>
                            <td className="px-2 py-3"><Badge value={event.status} /></td>
                            <td className="px-2 py-3"><div className="flex items-center gap-1"><button className="rounded border p-1" onClick={() => setSelectedEventId(event.id)}><Eye size={15} /></button><button className="rounded border px-2 py-1 text-xs" onClick={() => { setEventEditId(event.id); setEventFormOpen(true); }}>Edit</button><button className="rounded border px-2 py-1 text-xs text-rose-600" onClick={() => deleteEvent(event.id)}>Delete</button></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2"><p className="font-medium text-slate-900">{event.name}</p><Badge value={event.status} /></div>
                        <p className="mt-1 text-xs text-slate-500">{fmtDateTime(event.dateTime)}</p>
                        <p className="text-xs text-slate-500">{event.location}</p>
                        <button className="mt-3 rounded border px-2 py-1 text-xs" onClick={() => setSelectedEventId(event.id)}>View details</button>
                      </div>
                    ))}
                  </div>
                )}

                {eventFilters.view === "table" && <Pagination page={eventPage} setPage={setEventPage} total={filteredEvents.length} pageSize={10} />}
              </div>
            </section>
          )}

          {activeTab === "organizers" && (
            <section className="rounded-xl border bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={organizerFilters.search} onChange={(event) => setOrganizerFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Search organizations" className="w-full rounded border py-2 pl-9 pr-3 text-sm" /></div>
                <select value={organizerFilters.verificationStatus} onChange={(event) => setOrganizerFilters((prev) => ({ ...prev, verificationStatus: event.target.value }))} className="rounded border px-2 py-2 text-sm">{["All", "Verified", "Pending", "Rejected"].map((value) => <option key={value}>{value}</option>)}</select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="px-2 py-2">Organization</th><th className="px-2 py-2">Contact</th><th className="px-2 py-2">Verification</th><th className="px-2 py-2">Events</th><th className="px-2 py-2">Registration Date</th><th className="px-2 py-2">Actions</th></tr></thead>
                  <tbody>
                    {organizerRows.map((organizer) => (
                      <tr key={organizer.id} className="border-b"><td className="px-2 py-3 font-medium text-slate-900">{organizer.organizationName}</td><td className="px-2 py-3"><p>{organizer.contactPerson}</p><p className="text-xs text-slate-500">{organizer.email}</p></td><td className="px-2 py-3"><Badge value={organizer.verificationStatus} /></td><td className="px-2 py-3">{organizer.eventsCreated}</td><td className="px-2 py-3">{fmtDate(organizer.registrationDate)}</td><td className="px-2 py-3"><button className="rounded border px-2 py-1 text-xs" onClick={() => setSelectedOrganizerId(organizer.id)}>View details</button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={organizerPage} setPage={setOrganizerPage} total={filteredOrganizers.length} pageSize={10} />
            </section>
          )}

          {activeTab === "analytics" && (
            <section className="space-y-4">
              <div className="rounded-xl border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {["overview", "volunteers", "events", "reports"].map((item) => <button key={item} className={`rounded px-3 py-2 text-sm ${analyticsTab === item ? "bg-indigo-600 text-white" : "border"}`} onClick={() => setAnalyticsTab(item)}>{item === "overview" ? "Overview" : item === "volunteers" ? "Volunteer Analytics" : item === "events" ? "Event Analytics" : "Custom Reports"}</button>)}
                  </div>
                  <div className="flex items-center gap-2"><input type="date" value={analyticsRange.from} onChange={(e) => setAnalyticsRange((p) => ({ ...p, from: e.target.value }))} className="rounded border px-2 py-2 text-sm" /><input type="date" value={analyticsRange.to} onChange={(e) => setAnalyticsRange((p) => ({ ...p, to: e.target.value }))} className="rounded border px-2 py-2 text-sm" /></div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {(analyticsTab === "overview" || analyticsTab === "volunteers") && (
                  <>
                    <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Top Skills</h3><BarChart data={Object.entries(db.volunteers.reduce((acc, v) => { v.skills.forEach((skill) => { acc[skill] = (acc[skill] || 0) + 1; }); return acc; }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8)} /></div>
                    <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Most Active Volunteers</h3><div className="space-y-2">{[...db.volunteers].sort((a, b) => b.hoursLogged - a.hoursLogged).slice(0, 10).map((v, i) => <div key={v.id} className="flex items-center justify-between rounded border p-2 text-sm"><p>{i + 1}. {v.name}</p><p className="font-semibold">{fmtHours(v.hoursLogged)}</p></div>)}</div></div>
                  </>
                )}
                {(analyticsTab === "overview" || analyticsTab === "events") && (
                  <>
                    <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Attendance Rate</h3><LineChart data={db.events.slice(0, 8).map((event) => ({ label: event.name.split(" ")[0], value: Number(((event.checkedInVolunteerIds.length / Math.max(event.assignedVolunteerIds.length, 1)) * 100).toFixed(1)) }))} color="#16a34a" /></div>
                    <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Completion Rates</h3><PieChart data={[{ label: "Completed", value: db.events.filter((e) => e.status === "Completed").length }, { label: "In Progress", value: db.events.filter((e) => ["Upcoming", "Ongoing"].includes(e.status)).length }, { label: "Cancelled", value: db.events.filter((e) => e.status === "Cancelled").length }]} /></div>
                  </>
                )}
                {analyticsTab === "reports" && (
                  <div className="rounded-xl border bg-white p-4 xl:col-span-2">
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">Custom Report Snapshot</h3>
                    <p className="text-sm text-slate-600">Generate and export trend snapshots for leadership review.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <MetricCard label="Volunteer Retention" value={`${Math.round((db.volunteers.filter((v) => v.history.length > 1).length / db.volunteers.length) * 100)}%`} icon={Users} hint="Volunteers with repeat participation" />
                      <MetricCard label="Geographic Spread" value={`${new Set(db.volunteers.map((v) => v.location)).size} cities`} icon={CalendarDays} hint="Active operational footprint" />
                      <MetricCard label="Event Fill Rate" value={`${Math.round((db.events.reduce((sum, e) => sum + e.volunteerSlotsFilled, 0) / Math.max(db.events.reduce((sum, e) => sum + e.volunteerSlotsTotal, 0), 1)) * 100)}%`} icon={UserPlus} hint="Avg volunteer slot utilization" />
                      <MetricCard label="Approval Backlog" value={pendingVolunteerApprovals.length + pendingOrganizerApprovals.length} icon={Shield} hint="Items requiring manual review" />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "communications" && (
            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border bg-white p-4 lg:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Message Composer</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select value={composer.audience} onChange={(event) => setComposer((prev) => ({ ...prev, audience: event.target.value }))} className="rounded border px-2 py-2 text-sm"><option>All Volunteers</option><option>Active Volunteers</option>{volunteerSkills.slice(0, 5).map((skill) => <option key={skill}>{`Skill: ${skill}`}</option>)}{locations.slice(0, 5).map((location) => <option key={location}>{`Location: ${location}`}</option>)}</select>
                  <select value={composer.type} onChange={(event) => setComposer((prev) => ({ ...prev, type: event.target.value }))} className="rounded border px-2 py-2 text-sm"><option value="email">Email</option><option value="sms">SMS</option><option value="in-app">In-App</option></select>
                </div>
                <div className="mt-2"><select value={composer.templateId} onChange={(event) => { const templateId = event.target.value; const template = db.messageTemplates.find((item) => item.id === templateId); if (!template) { setComposer((prev) => ({ ...prev, templateId: "" })); return; } setComposer((prev) => ({ ...prev, templateId, subject: template.subject, body: template.body, type: template.type })); }} className="w-full rounded border px-2 py-2 text-sm"><option value="">Template (optional)</option>{db.messageTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></div>
                <input value={composer.subject} onChange={(event) => setComposer((prev) => ({ ...prev, subject: event.target.value }))} className="mt-2 w-full rounded border px-3 py-2 text-sm" placeholder="Subject" />
                <textarea value={composer.body} onChange={(event) => setComposer((prev) => ({ ...prev, body: event.target.value }))} rows={5} className="mt-2 w-full rounded border px-3 py-2 text-sm" placeholder="Write message" />
                <div className="mt-3 flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" onClick={sendMessage}><Send size={15} />Send</button><button className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm" onClick={addTemplate}><Plus size={15} />Save as template</button></div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Templates</h3>
                <div className="space-y-2">{db.messageTemplates.map((template) => <div key={template.id} className="rounded border p-2 text-xs"><p className="font-semibold text-slate-800">{template.name}</p><p className="text-slate-500">{template.type.toUpperCase()}</p></div>)}</div>
              </div>

              <div className="rounded-xl border bg-white p-4 lg:col-span-3">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Message History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="px-2 py-2">Subject</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Audience</th><th className="px-2 py-2">Recipients</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Sent At</th></tr></thead>
                    <tbody>
                      {db.messageHistory.slice(0, 20).map((message) => <tr key={message.id} className="border-b"><td className="px-2 py-3">{message.subject}</td><td className="px-2 py-3 uppercase">{message.type}</td><td className="px-2 py-3">{message.audience}</td><td className="px-2 py-3">{message.recipients}</td><td className="px-2 py-3"><Badge value={message.status} /></td><td className="px-2 py-3">{fmtDateTime(message.sentAt)}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "settings" && <SettingsPanel db={db} mutateDb={mutateDb} />}
        </main>
      </div>

      <Modal open={!!selectedVolunteer} onClose={() => setSelectedVolunteerId(null)} title="Volunteer details" maxWidth="max-w-3xl">
        {selectedVolunteer && (
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3"><img src={selectedVolunteer.avatar} alt={selectedVolunteer.name} className="h-14 w-14 rounded-full" /><div><p className="text-lg font-semibold text-slate-900">{selectedVolunteer.name}</p><p className="text-slate-600">{selectedVolunteer.email}</p><p className="text-slate-600">{selectedVolunteer.phone}</p></div><Badge value={selectedVolunteer.status} /></div>
            <div className="grid gap-3 md:grid-cols-3"><div className="rounded border p-3"><p className="text-xs text-slate-500">Location</p><p className="font-medium">{selectedVolunteer.location}</p></div><div className="rounded border p-3"><p className="text-xs text-slate-500">Hours Logged</p><p className="font-medium">{fmtHours(selectedVolunteer.hoursLogged)}</p></div><div className="rounded border p-3"><p className="text-xs text-slate-500">Joined On</p><p className="font-medium">{fmtDate(selectedVolunteer.dateJoined)}</p></div></div>
            <div><p className="mb-2 font-semibold text-slate-800">Volunteer History</p><div className="max-h-40 space-y-2 overflow-y-auto">{selectedVolunteer.history.length ? selectedVolunteer.history.map((entry) => <div key={entry.id} className="rounded border p-2"><p className="font-medium">{entry.eventName}</p><p className="text-xs text-slate-500">{fmtDateTime(entry.date)} � {fmtHours(entry.hours)}</p></div>) : <p className="text-xs text-slate-500">No participation history yet.</p>}</div></div>
            <div><p className="mb-2 font-semibold text-slate-800">Admin Notes</p><textarea defaultValue={selectedVolunteer.adminNotes} onBlur={(event) => handleVolunteerNotes(selectedVolunteer.id, event.target.value)} rows={4} className="w-full rounded border px-3 py-2" placeholder="Add admin notes" /></div>
          </div>
        )}
      </Modal>

      <Modal open={!!selectedEvent} onClose={() => setSelectedEventId(null)} title="Event details" maxWidth="max-w-5xl">
        {selectedEvent && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2"><div className="rounded border p-3"><p className="text-xs text-slate-500">Event</p><p className="text-base font-semibold text-slate-900">{selectedEvent.name}</p><p className="text-slate-600">{selectedEvent.description}</p></div><div className="rounded border p-3"><p className="text-xs text-slate-500">Organizer</p><p className="font-medium">{organizersById[selectedEvent.organizerId]?.organizationName || "-"}</p><p className="text-slate-600">{fmtDateTime(selectedEvent.dateTime)}</p><p className="text-slate-600">{selectedEvent.location}</p><div className="mt-1"><Badge value={selectedEvent.status} /></div></div></div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><h4 className="mb-2 font-semibold">Volunteer Management</h4><div className="max-h-56 space-y-2 overflow-y-auto rounded border p-2">{selectedEvent.assignedVolunteerIds.map((volunteerId) => { const volunteer = volunteersById[volunteerId]; if (!volunteer) return null; const checked = selectedEvent.checkedInVolunteerIds.includes(volunteerId); return <div key={volunteerId} className="flex items-center justify-between rounded border p-2"><div><p className="font-medium">{volunteer.name}</p><p className="text-xs text-slate-500">{volunteer.email}</p></div><button className={`rounded px-2 py-1 text-xs ${checked ? "bg-emerald-600 text-white" : "border"}`} onClick={() => toggleCheckIn(selectedEvent.id, volunteerId)}>{checked ? "Checked-In" : "Check-In"}</button></div>; })}</div></div>
              <div><h4 className="mb-2 font-semibold">Waitlist</h4><div className="max-h-56 space-y-2 overflow-y-auto rounded border p-2">{selectedEvent.waitlistVolunteerIds.length ? selectedEvent.waitlistVolunteerIds.map((volunteerId) => { const volunteer = volunteersById[volunteerId]; if (!volunteer) return null; return <div key={volunteerId} className="flex items-center justify-between rounded border p-2"><div><p className="font-medium">{volunteer.name}</p><p className="text-xs text-slate-500">{volunteer.email}</p></div><button className="rounded border px-2 py-1 text-xs" onClick={() => assignVolunteerToEvent(selectedEvent.id, volunteerId)}>Move to assigned</button></div>; }) : <p className="text-xs text-slate-500">No waitlist volunteers.</p>}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!selectedOrganizer} onClose={() => setSelectedOrganizerId(null)} title="Organizer details" maxWidth="max-w-4xl">
        {selectedOrganizer && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2"><div className="rounded border p-3"><p className="text-xs text-slate-500">Organization</p><p className="text-base font-semibold">{selectedOrganizer.organizationName}</p><p>{selectedOrganizer.contactPerson}</p><p className="text-slate-600">{selectedOrganizer.email}</p><p className="text-slate-600">{selectedOrganizer.phone}</p></div><div className="rounded border p-3"><p className="text-xs text-slate-500">Verification</p><Badge value={selectedOrganizer.verificationStatus} /><p className="mt-2 text-xs text-slate-500">Rating: {selectedOrganizer.ratings} / 5</p><div className="mt-3 flex gap-2"><button className="rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => setOrganizerVerification(selectedOrganizer.id, "Verified")}>Approve</button><button className="rounded bg-rose-600 px-3 py-2 text-xs font-semibold text-white" onClick={() => setOrganizerVerification(selectedOrganizer.id, "Rejected")}>Reject</button></div></div></div>
            <div><h4 className="mb-2 font-semibold">Verification Documents</h4><div className="space-y-2">{selectedOrganizer.documents.map((doc) => <div key={doc.id} className="flex items-center justify-between rounded border p-2"><p>{doc.name}</p><Badge value={doc.status} /></div>)}</div></div>
            <div><h4 className="mb-2 font-semibold">Created Events</h4><div className="space-y-2">{db.events.filter((event) => event.organizerId === selectedOrganizer.id).slice(0, 8).map((event) => <div key={event.id} className="flex items-center justify-between rounded border p-2"><div><p className="font-medium">{event.name}</p><p className="text-xs text-slate-500">{fmtDateTime(event.dateTime)}</p></div><Badge value={event.status} /></div>)}</div></div>
          </div>
        )}
      </Modal>

      <EventFormModal open={eventFormOpen} onClose={() => { setEventFormOpen(false); setEventEditId(null); }} organizers={db.organizers} categories={categories} seed={selectedEventSeed} onSubmit={handleEventSubmit} />
    </div>
  );
};

const EventFormModal = ({ open, onClose, onSubmit, organizers, categories, seed }) => {
  const [form, setForm] = useState({ name: "", organizerId: organizers[0]?.id || "", dateTime: "", location: "", category: categories[0] || "Music", volunteerSlotsTotal: 20, status: "Upcoming", durationHours: 4, description: "", requirements: "" });

  useEffect(() => {
    if (!open) return;
    if (seed) setForm({ ...seed, requirements: seed.requirements?.join(", ") || "" });
    else setForm({ name: "", organizerId: organizers[0]?.id || "", dateTime: "", location: "", category: categories[0] || "Music", volunteerSlotsTotal: 20, status: "Upcoming", durationHours: 4, description: "", requirements: "" });
  }, [open, seed, organizers, categories]);

  const submit = () => {
    if (!form.name || !form.organizerId || !form.dateTime || !form.location) return;
    onSubmit({ ...form, requirements: form.requirements.split(",").map((item) => item.trim()).filter(Boolean) });
  };

  return (
    <Modal open={open} onClose={onClose} title={seed ? "Edit event" : "Create event"} maxWidth="max-w-3xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Event name" className="rounded border px-3 py-2 text-sm" />
        <select value={form.organizerId} onChange={(event) => setForm((prev) => ({ ...prev, organizerId: event.target.value }))} className="rounded border px-3 py-2 text-sm">{organizers.map((organizer) => <option key={organizer.id} value={organizer.id}>{organizer.organizationName}</option>)}</select>
        <input type="datetime-local" value={form.dateTime ? new Date(form.dateTime).toISOString().slice(0, 16) : ""} onChange={(event) => setForm((prev) => ({ ...prev, dateTime: new Date(event.target.value).toISOString() }))} className="rounded border px-3 py-2 text-sm" />
        <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" className="rounded border px-3 py-2 text-sm" />
        <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="rounded border px-3 py-2 text-sm">{categories.map((category) => <option key={category}>{category}</option>)}</select>
        <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="rounded border px-3 py-2 text-sm">{["Upcoming", "Ongoing", "Completed", "Draft", "Cancelled"].map((status) => <option key={status}>{status}</option>)}</select>
        <input type="number" value={form.volunteerSlotsTotal} onChange={(event) => setForm((prev) => ({ ...prev, volunteerSlotsTotal: Number(event.target.value) }))} placeholder="Volunteer slots" className="rounded border px-3 py-2 text-sm" />
        <input type="number" step="0.5" value={form.durationHours} onChange={(event) => setForm((prev) => ({ ...prev, durationHours: Number(event.target.value) }))} placeholder="Duration hours" className="rounded border px-3 py-2 text-sm" />
      </div>
      <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={3} className="mt-3 w-full rounded border px-3 py-2 text-sm" />
      <input value={form.requirements} onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))} placeholder="Requirements comma separated" className="mt-3 w-full rounded border px-3 py-2 text-sm" />
      <div className="mt-4 flex justify-end gap-2"><button onClick={onClose} className="rounded border px-3 py-2 text-sm">Cancel</button><button onClick={submit} className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">{seed ? "Save changes" : "Create event"}</button></div>
    </Modal>
  );
};

const SettingsPanel = ({ db, mutateDb }) => {
  const [active, setActive] = useState("general");
  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-white p-4"><div className="flex flex-wrap gap-2">{[{ id: "general", label: "General Settings" }, { id: "roles", label: "User Roles & Permissions" }, { id: "notifications", label: "Notification Settings" }].map((item) => <button key={item.id} onClick={() => setActive(item.id)} className={`rounded px-3 py-2 text-sm ${active === item.id ? "bg-indigo-600 text-white" : "border"}`}>{item.label}</button>)}</div></div>
      {active === "general" && <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">General Settings</h3><div className="grid gap-3 sm:grid-cols-2"><input value={db.settings.general.platformName} onChange={(event) => mutateDb((next) => { next.settings.general.platformName = event.target.value; return next; }, "Platform name updated")} className="rounded border px-3 py-2 text-sm" placeholder="Platform Name" /><input value={db.settings.general.logoUrl} onChange={(event) => mutateDb((next) => { next.settings.general.logoUrl = event.target.value; return next; }, "Logo URL updated")} className="rounded border px-3 py-2 text-sm" placeholder="Logo URL" /><input value={db.settings.general.timezone} onChange={(event) => mutateDb((next) => { next.settings.general.timezone = event.target.value; return next; }, "Timezone updated")} className="rounded border px-3 py-2 text-sm" placeholder="Timezone" /></div></div>}
      {active === "roles" && <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Admin Users</h3><div className="space-y-2">{db.settings.roles.map((roleUser) => { const Icon = roleIconMap[roleUser.role] || UserCog; return <div key={roleUser.id} className="flex items-center justify-between rounded border p-3 text-sm"><div className="flex items-center gap-3"><div className="rounded-full bg-slate-100 p-2"><Icon size={16} className="text-slate-600" /></div><div><p className="font-medium">{roleUser.name}</p><p className="text-xs text-slate-500">{roleUser.email}</p></div></div><div className="flex items-center gap-2"><select value={roleUser.role} onChange={(event) => mutateDb((next) => { const current = next.settings.roles.find((item) => item.id === roleUser.id); if (current) current.role = event.target.value; return next; }, "Role updated")} className="rounded border px-2 py-1 text-xs">{["Super Admin", "Operations Admin", "Review Admin"].map((role) => <option key={role}>{role}</option>)}</select><button onClick={() => mutateDb((next) => { const current = next.settings.roles.find((item) => item.id === roleUser.id); if (current) current.active = !current.active; return next; }, "User status updated")} className={`rounded px-2 py-1 text-xs ${roleUser.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{roleUser.active ? "Active" : "Disabled"}</button></div></div>; })}</div></div>}
      {active === "notifications" && <div className="rounded-xl border bg-white p-4"><h3 className="mb-3 text-sm font-semibold text-slate-800">Notification Preferences</h3><div className="space-y-2">{Object.entries(db.settings.notifications).map(([key, value]) => <label key={key} className="flex items-center justify-between rounded border p-3 text-sm"><span className="capitalize text-slate-700">{key.replace(/([A-Z])/g, " $1")}</span><input type="checkbox" checked={value} onChange={() => mutateDb((next) => { next.settings.notifications[key] = !next.settings.notifications[key]; return next; }, "Notification preference updated")} /></label>)}</div></div>}
    </section>
  );
};

export default AdminDashboard;