import { ShieldCheck, UserCog, UserRoundCheck } from "lucide-react";

export const ADMIN_STORAGE_KEY = "gigxpress_admin_db_v1";

const firstNames = [
  "Aarav", "Vihaan", "Aditya", "Arjun", "Kavya", "Ananya", "Neha", "Priya", "Riya", "Aisha",
  "Rahul", "Rohan", "Sanya", "Ishita", "Karan", "Manav", "Sneha", "Tanvi", "Nikhil", "Maya",
  "Harsh", "Kabir", "Siddharth", "Meera", "Naina", "Dev", "Pooja", "Reyansh", "Ayaan", "Pari",
];

const lastNames = [
  "Sharma", "Verma", "Patel", "Singh", "Mehta", "Reddy", "Nair", "Iyer", "Das", "Kapoor",
  "Malhotra", "Bose", "Jain", "Gupta", "Pandey", "Chopra", "Khurana", "Agarwal", "Kulkarni", "Mishra",
];

const cities = [
  "Mumbai", "Delhi", "Pune", "Bengaluru", "Hyderabad", "Ahmedabad", "Kolkata", "Jaipur", "Lucknow", "Chandigarh",
];

const categories = [
  "Music", "Sports", "Corporate", "Wedding", "Education", "Food", "Startup", "NGO", "Community", "Tech",
];

const volunteerSkills = [
  "Registration", "Crowd Management", "Photography", "Video Editing", "Social Media", "Public Speaking", "Sound Setup",
  "Hospitality", "Logistics", "First Aid", "Stage Management", "Content Creation", "Data Entry", "Ticketing",
];

const eventLocations = [
  "Convention Center", "Open Grounds", "Town Hall", "City Mall", "Riverfront Arena", "Tech Park", "University Campus", "Community Center",
];

const messageTemplates = [
  {
    id: "tpl-1",
    name: "Event Reminder",
    type: "email",
    subject: "Reminder: Upcoming event assignment",
    body: "Hi {{name}}, this is a reminder for your upcoming volunteer assignment at {{event}} on {{date}}.",
  },
  {
    id: "tpl-2",
    name: "Check-In Alert",
    type: "sms",
    subject: "Check-in opens",
    body: "Check-in is now open for {{event}}. Please arrive 30 mins early.",
  },
  {
    id: "tpl-3",
    name: "Thank You",
    type: "in-app",
    subject: "Thanks for volunteering",
    body: "Thanks for supporting {{event}}. Your effort made the event successful.",
  },
];

const roleSeed = [
  {
    id: "admin-1",
    name: "Aman Khanna",
    email: "aman.admin@gigxpress.com",
    role: "Super Admin",
    active: true,
    icon: ShieldCheck,
  },
  {
    id: "admin-2",
    name: "Mira Sethi",
    email: "mira.ops@gigxpress.com",
    role: "Operations Admin",
    active: true,
    icon: UserCog,
  },
  {
    id: "admin-3",
    name: "Rohit Jain",
    email: "rohit.review@gigxpress.com",
    role: "Review Admin",
    active: true,
    icon: UserRoundCheck,
  },
];

const notificationSeed = {
  newEvent: true,
  eventCompletion: true,
  volunteerRegistration: true,
  approvalReminders: true,
  communications: false,
};

const dayMs = 24 * 60 * 60 * 1000;

const hashSeed = (text) => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (random, list) => list[Math.floor(random() * list.length)];

const uniquePicks = (random, list, count) => {
  const selected = new Set();
  while (selected.size < count && selected.size < list.length) {
    selected.add(pick(random, list));
  }
  return [...selected];
};

const toISODate = (date) => new Date(date).toISOString();

const randomPastDate = (random, maxDaysAgo = 365) => {
  const daysAgo = Math.floor(random() * maxDaysAgo);
  return toISODate(Date.now() - daysAgo * dayMs);
};

const randomFutureDate = (random, maxDaysAhead = 120) => {
  const daysAhead = Math.floor(random() * maxDaysAhead);
  return toISODate(Date.now() + daysAhead * dayMs);
};

const makePhone = (index) => `+91 98${String(10000000 + index).slice(0, 8)}`;

const makeName = (random) => `${pick(random, firstNames)} ${pick(random, lastNames)}`;

const makeSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");

export const createSeedData = () => {
  const random = mulberry32(hashSeed("gigxpress-admin-seed-v1"));

  const organizers = Array.from({ length: 24 }).map((_, index) => {
    const orgName = `${pick(random, ["Skyline", "Pulse", "Vertex", "Nova", "Bluebird", "Northstar"])} ${pick(
      random,
      ["Events", "Collective", "Productions", "Network", "Studios", "Experiences"]
    )}`;
    const contact = makeName(random);
    const city = pick(random, cities);

    return {
      id: `org-${index + 1}`,
      organizationName: orgName,
      contactPerson: contact,
      email: `${makeSlug(contact)}@${makeSlug(orgName)}.com`,
      phone: makePhone(index + 11),
      city,
      verificationStatus: pick(random, ["Verified", "Pending", "Rejected", "Verified", "Verified"]),
      registrationDate: randomPastDate(random, 620),
      documents: [
        { id: `doc-${index + 1}-1`, name: "Business License.pdf", status: "Submitted" },
        { id: `doc-${index + 1}-2`, name: "Tax Certificate.pdf", status: pick(random, ["Approved", "Submitted"]) },
      ],
      ratings: Number((3.4 + random() * 1.6).toFixed(1)),
      eventsCreated: 0,
      notes: "",
    };
  });

  const volunteers = Array.from({ length: 120 }).map((_, index) => {
    const name = makeName(random);
    const city = pick(random, cities);
    const primary = pick(random, volunteerSkills);
    const skills = uniquePicks(random, volunteerSkills, Math.floor(2 + random() * 4));
    if (!skills.includes(primary)) skills.unshift(primary);

    return {
      id: `vol-${index + 1}`,
      avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      name,
      email: `${makeSlug(name)}${index + 1}@mail.com`,
      phone: makePhone(index + 101),
      status: pick(random, ["Active", "Active", "Pending", "Inactive", "Suspended"]),
      location: city,
      skills: skills.slice(0, 4),
      dateJoined: randomPastDate(random, 540),
      hoursLogged: 0,
      history: [],
      adminNotes: "",
    };
  });

  const statusOptions = ["Upcoming", "Upcoming", "Ongoing", "Completed", "Draft", "Cancelled"];

  const events = Array.from({ length: 64 }).map((_, index) => {
    const organizer = pick(random, organizers);
    const status = pick(random, statusOptions);
    const totalSlots = Math.floor(8 + random() * 28);
    const baseFilled =
      status === "Draft" || status === "Cancelled"
        ? 0
        : Math.floor(totalSlots * (0.2 + random() * 0.8));

    const activeVolunteerPool = volunteers.filter((vol) => vol.status !== "Suspended");
    const assignedVolunteers = uniquePicks(
      random,
      activeVolunteerPool.map((vol) => vol.id),
      Math.min(baseFilled, activeVolunteerPool.length)
    );

    const checkedInCount =
      status === "Completed" || status === "Ongoing"
        ? Math.floor(assignedVolunteers.length * (0.55 + random() * 0.4))
        : 0;

    const checkedInVolunteerIds = uniquePicks(random, assignedVolunteers, checkedInCount);

    const potentialWaitlist = volunteers
      .filter((vol) => !assignedVolunteers.includes(vol.id))
      .map((vol) => vol.id);

    const waitlistIds = uniquePicks(random, potentialWaitlist, Math.floor(random() * 7));

    const dateTime =
      status === "Completed"
        ? randomPastDate(random, 150)
        : status === "Ongoing"
          ? toISODate(Date.now() - Math.floor(random() * 3) * dayMs)
          : randomFutureDate(random, 120);

    const durationHours = Number((2 + random() * 8).toFixed(1));

    return {
      id: `evt-${index + 1}`,
      name: `${pick(random, categories)} ${pick(random, ["Expo", "Summit", "Drive", "Festival", "Workshop", "Meetup"])} ${index + 1}`,
      organizerId: organizer.id,
      dateTime,
      location: `${pick(random, eventLocations)}, ${pick(random, cities)}`,
      category: pick(random, categories),
      volunteerSlotsFilled: assignedVolunteers.length,
      volunteerSlotsTotal: totalSlots,
      status,
      description: "High-impact community and event operation engagement opportunity.",
      requirements: uniquePicks(random, volunteerSkills, Math.floor(1 + random() * 3)),
      assignedVolunteerIds: assignedVolunteers,
      checkedInVolunteerIds,
      waitlistVolunteerIds: waitlistIds,
      durationHours,
      createdAt: randomPastDate(random, 420),
      updatedAt: randomPastDate(random, 90),
    };
  });

  const organizerEventCount = events.reduce((acc, event) => {
    acc[event.organizerId] = (acc[event.organizerId] || 0) + 1;
    return acc;
  }, {});

  organizers.forEach((org) => {
    org.eventsCreated = organizerEventCount[org.id] || 0;
  });

  const volunteerMap = new Map(volunteers.map((vol) => [vol.id, vol]));

  events.forEach((event) => {
    event.checkedInVolunteerIds.forEach((volunteerId) => {
      const volunteer = volunteerMap.get(volunteerId);
      if (!volunteer) return;
      volunteer.hoursLogged += event.durationHours;
      volunteer.history.push({
        id: `hist-${event.id}-${volunteer.id}`,
        eventId: event.id,
        eventName: event.name,
        date: event.dateTime,
        hours: event.durationHours,
        status: "Checked-In",
      });
    });
  });

  volunteers.forEach((volunteer, index) => {
    volunteer.hoursLogged = Number(volunteer.hoursLogged.toFixed(1));
    if (volunteer.status === "Pending" && index % 3 === 0) {
      volunteer.adminNotes = "Profile under verification. Awaiting ID proof review.";
    }
  });

  const activities = [
    ...volunteers.slice(0, 20).map((volunteer, index) => ({
      id: `activity-vol-${index + 1}`,
      type: volunteer.status === "Pending" ? "approval" : "registration",
      entity: "volunteer",
      entityId: volunteer.id,
      message:
        volunteer.status === "Pending"
          ? `${volunteer.name} submitted verification documents`
          : `${volunteer.name} joined as a new volunteer`,
      timestamp: toISODate(Date.now() - index * 6 * 60 * 60 * 1000),
      actionRequired: volunteer.status === "Pending",
    })),
    ...events.slice(0, 12).map((event, index) => ({
      id: `activity-evt-${index + 1}`,
      type: "event",
      entity: "event",
      entityId: event.id,
      message: `${event.name} status changed to ${event.status}`,
      timestamp: toISODate(Date.now() - (index + 3) * 9 * 60 * 60 * 1000),
      actionRequired: event.status === "Draft",
    })),
    ...organizers.slice(0, 8).map((organizer, index) => ({
      id: `activity-org-${index + 1}`,
      type: "organizer",
      entity: "organizer",
      entityId: organizer.id,
      message: `${organizer.organizationName} verification is ${organizer.verificationStatus}`,
      timestamp: toISODate(Date.now() - (index + 2) * 11 * 60 * 60 * 1000),
      actionRequired: organizer.verificationStatus === "Pending",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 60);

  const messageHistory = Array.from({ length: 16 }).map((_, index) => ({
    id: `msg-${index + 1}`,
    subject: pick(random, ["Shift Reminder", "Policy Update", "Event Brief", "Thank You Note"]),
    type: pick(random, ["email", "sms", "in-app"]),
    recipients: Math.floor(15 + random() * 140),
    audience: pick(random, ["All Volunteers", "Active Volunteers", "Skill: Logistics", "City: Mumbai"]),
    sentAt: toISODate(Date.now() - index * 1.5 * dayMs),
    status: pick(random, ["Delivered", "Delivered", "Scheduled", "Draft"]),
  }));

  return {
    meta: {
      initializedAt: toISODate(Date.now()),
      version: 1,
    },
    volunteers,
    events,
    organizers,
    activities,
    messageTemplates,
    messageHistory,
    settings: {
      general: {
        platformName: "GigXpress Admin",
        logoUrl: "https://dummyimage.com/80x80/1f2937/ffffff&text=GX",
        timezone: "Asia/Kolkata",
      },
      roles: roleSeed.map((item) => ({ ...item, icon: undefined })),
      notifications: notificationSeed,
    },
  };
};

export const loadAdminDB = () => {
  try {
    const fromStorage = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (fromStorage) return JSON.parse(fromStorage);
  } catch {
    // no-op
  }
  const seeded = createSeedData();
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

export const saveAdminDB = (db) => {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(db));
};

export const resetAdminDB = () => {
  const seeded = createSeedData();
  saveAdminDB(seeded);
  return seeded;
};

export const roleIconMap = {
  "Super Admin": ShieldCheck,
  "Operations Admin": UserCog,
  "Review Admin": UserRoundCheck,
};