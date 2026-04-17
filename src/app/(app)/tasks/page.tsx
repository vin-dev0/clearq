import TasksClient from "./TasksClient";

export const metadata = {
  title: "Tasks | ClearQ",
  description: "Organize and manage your team tasks",
};

export default function TasksPage() {
  return <TasksClient />;
}
