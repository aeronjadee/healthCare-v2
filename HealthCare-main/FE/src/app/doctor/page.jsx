import RequireDoctor from "@/components/RequireDoctor";
import DoctorPageContent from "@/components/DoctorPageContent";

export default function DoctorPage() {
  return (
    <RequireDoctor>
      <DoctorPageContent />
    </RequireDoctor>
  );
}
