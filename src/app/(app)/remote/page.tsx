import RemoteClient from "./RemoteClient";

export const metadata = {
  title: "Remote Access - ClearQ",
  description: "Secure SSH and RDP management interface.",
};

export default function RemotePage() {
  return <RemoteClient />;
}
