import {
	DirectionsBoatFilled,
	Sailing,
	Code,
	Handyman,
	WorkOutline,
	Anchor,
} from '@mui/icons-material';

//sometimes we do something not because is needed but because it looks nice :)
export default function JobIcon({ title }: { title: string }) {
	const iconProps = { sx: { fontSize: 40, color: 'primary.main' }, 'aria-hidden': true };
	const t = title.toLowerCase();
	if (t.includes('sailing')) return <Sailing {...iconProps} />;
	if (t.includes('captain')) return <DirectionsBoatFilled {...iconProps} />;
	if (t.includes('superintendent')) return <Anchor {...iconProps} />; // Marine superintendent
	if (t.includes('engineer')) return <Code {...iconProps} />;
	if (t.includes('technician')) return <Handyman {...iconProps} />;

	// fallback
	return <WorkOutline {...iconProps} />;
}
