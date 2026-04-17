import GitClient from "./GitClient";

export const metadata = {
  title: "Git Integration | ClearQ",
  description: "Connect and manage your Git repositories, deployments, and branches.",
};

export default function GitPage() {
  return <GitClient />;
}
