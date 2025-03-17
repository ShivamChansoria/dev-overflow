export interface Ticket {
  id: number;
  name: string;
  status: "open" | "in-progress" | "closed";
  type: "bug" | "feature" | "enhancement";
}

export const tickets: Ticket[] = [
  {
    id: 1,
    name: "Fix login page crash",
    status: "open",
    type: "bug",
  },
  {
    id: 2,
    name: "Add dark mode support",
    status: "in-progress",
    type: "feature",
  },
  {
    id: 3,
    name: "Improve error messages",
    status: "closed",
    type: "enhancement",
  },
  {
    id: 4,
    name: "Memory leak in dashboard",
    status: "open",
    type: "bug",
  },
  {
    id: 5,
    name: "Add export to PDF feature",
    status: "in-progress",
    type: "feature",
  },
  {
    id: 6,
    name: "Optimize database queries",
    status: "open",
    type: "enhancement",
  },
  {
    id: 7,
    name: "Add user profile photos",
    status: "in-progress",
    type: "feature",
  },
  {
    id: 8,
    name: "Fix broken links in docs",
    status: "open",
    type: "bug",
  },
  {
    id: 9,
    name: "Implement search filters",
    status: "closed",
    type: "feature",
  },
  {
    id: 10,
    name: "Browser compatibility issues",
    status: "open",
    type: "bug",
  },
];
