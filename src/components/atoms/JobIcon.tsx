
import {
  DirectionsBoatFilled,
  Sailing,
  Code,
  Handyman,
  WorkOutline,
  Anchor,
} from "@mui/icons-material";

//sometimes we do something not because is needed but because it looks nice :)
export default function JobIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (t.includes("sailing")) return <Sailing color="primary" />;
  if (t.includes("captain")) return <DirectionsBoatFilled color="primary" />;
  if (t.includes("superintendent")) return <Anchor color="primary" />; // Marine superintendent
  if (t.includes("engineer")) return <Code color="primary" />;
  if (t.includes("technician")) return <Handyman color="primary" />;

  // fallback
  return <WorkOutline color="primary" />;
}
